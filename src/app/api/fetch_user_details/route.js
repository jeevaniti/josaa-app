//    fb_uid: { S: fb_uid },
//                     user_email: { S: user_email },


//                     josaa_credit: { BOOL: false },
//                     csab_credit: { BOOL: false },

//                     home_state: { S: "" },
//                     gender: { S: "" },
//                     category: { S: "" },

//                     test_mains_crl: { N: "0" },

//                     category_mains_rank: { N: "0" },
//                     crl_mains_rank: { N: "0" },

//                     category_adv_rank: { N: "0" },
//                     crl_adv_rank: { N: "0" }


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
        const decoded = await admin.auth().verifyIdToken(rawJwt);
        fbUid = decoded.uid;
        if (!fbUid || typeof fbUid !== "string" || fbUid.trim().length === 0) {
            throw new Error("UID missing from token.");
        }
    } catch {
        return Response.json({ error: "Invalid or expired Firebase token." }, { status: 401 });
    }

    // 4. Fetch user record from DynamoDB
    let item;
    try {
        console.log("TABLE:", TABLE_NAME);
        console.log("fb_uid:", fbUid);


        const result = await dynamo.send(
            new GetItemCommand({
                TableName: TABLE_NAME,
                Key: { fb_uid: { S: fbUid } },
            })
        );

        console.log("DynamoDB result:", JSON.stringify(result));

        if (!result.Item) {
            return Response.json({ error: "User record not found." }, { status: 404 });
        }

        item = result.Item;
    } catch {
        console.log("DynamoDB error:", err)
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