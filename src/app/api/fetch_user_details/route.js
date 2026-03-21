// src/app/api/fetch_user_details/route.js
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamo } from "@/lib/dynamo";
import { admin } from "@/lib/firebase-admin";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

export async function POST(request) {

    // 1. Parse body safely
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return Response.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }

    // 2. Exactly 1 key expected: jwt
    const keys = Object.keys(body);
    if (keys.length !== 1 || !keys.includes("jwt")) {
        return Response.json(
            { error: "Request must contain exactly one key: jwt." },
            { status: 400 }
        );
    }

    const rawJwt = typeof body.jwt === "string" ? body.jwt.trim() : null;
    if (!rawJwt) {
        return Response.json({ error: "jwt must be a non-empty string." }, { status: 400 });
    }

    // 3. Verify Firebase JWT → extract fb_uid
    let fbUid;
    try {
        // checkRevoked: true ensures the token hasn't been revoked server-side
        const decoded = await admin.auth().verifyIdToken(rawJwt, /* checkRevoked= */ true);
        fbUid = decoded.uid?.trim();
        if (!fbUid) throw new Error("UID missing from token.");
    } catch (err) {
        // Surface the real Firebase error in dev so you can diagnose it
        // const msg = process.env.NODE_ENV === "development"
        //     ? `Invalid or expired Firebase token: ${err.message}`
        //     : "Invalid or expired Firebase token.";
        return Response.json({ error: err }, { status: 401 });
    }

    // 4. Fetch user record from DynamoDB
    let item;
    try {
        // ── Defensive guards ──────────────────────────────────────────────────────
        if (!TABLE_NAME) {
            console.error("DYNAMODB_TABLE_NAME env var is not set.");
            return Response.json({ error: "Server misconfiguration." }, { status: 500 });
        }

        // Log in all envs so you can see what's being queried
        // console.log("[fetch_user_details] TABLE:", TABLE_NAME, "| fb_uid:", fbUid);

        const result = await dynamo.send(
            new GetItemCommand({
                TableName: TABLE_NAME,
                // ── KEY FIX: trim again just in case; any whitespace = miss ──────────
                Key: { fb_uid: { S: fbUid } },
            })
        );

        // console.log("[fetch_user_details] DynamoDB Item found:", !!result.Item);

        if (!result.Item) {
            // Return the uid in dev so you can cross-check with DynamoDB console
            const devHint = process.env.NODE_ENV === "development"
                ? ` (queried uid: "${fbUid}", table: "${TABLE_NAME}")`
                : "";
            return Response.json(
                { error: `User record not found.${devHint}` },
                { status: 404 }
            );
        }

        item = result.Item;
    } catch (err) {
        // console.error("[fetch_user_details] DynamoDB error:", err);
        return Response.json({ error: "Failed to fetch user record." }, { status: 500 });
    }

    // 5. Unwrap DynamoDB types → plain values
    const response = {
        home_state: item.home_state?.S ?? "",
        gender: item.gender?.S ?? "",
        category: item.category?.S ?? "",

        josaa_credits: item.josaa_credits?.BOOL ?? false,
        csab_credits: item.csab_credits?.BOOL ?? false,

        test_mains_crl: parseInt(item.test_mains_crl?.N ?? "0", 10),
        crl_mains_rank: parseInt(item.crl_mains_rank?.N ?? "0", 10),
        category_mains_rank: parseInt(item.category_mains_rank?.N ?? "0", 10),
        crl_adv_rank: parseInt(item.crl_adv_rank?.N ?? "0", 10),
        category_adv_rank: parseInt(item.category_adv_rank?.N ?? "0", 10),
    };

    return Response.json(response, { status: 200 });
}