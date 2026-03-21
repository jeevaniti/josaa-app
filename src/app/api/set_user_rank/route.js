
// src/app/api/set_user_rank/route.js
import { GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamo } from "@/lib/dynamo";
import { admin } from "@/lib/firebase-admin";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const VALID_TYPES = new Set(["TEST", "MAINS", "ADVANCED"]);

function validRank(val) {
    const n = parseInt(val, 10);
    return !isNaN(n) && n >= 1 && n <= 1500000 ? n : null;
}

export async function POST(request) {

    // 1. Parse body
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return Response.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }

    // 2. Validate token
    const rawJwt = typeof body.token === "string" ? body.token.trim() : null;
    if (!rawJwt) {
        return Response.json({ error: "token must be a non-empty string." }, { status: 400 });
    }

    // 3. Validate type
    const type = typeof body.type === "string" ? body.type.trim().toUpperCase() : null;
    if (!type || !VALID_TYPES.has(type)) {
        return Response.json({ error: "type must be one of: TEST, MAINS, ADVANCED." }, { status: 400 });
    }

    // 4. Verify Firebase JWT → extract fb_uid
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

    // 5. Fetch existing record from DynamoDB
    let existingItem;
    try {
        const result = await dynamo.send(
            new GetItemCommand({
                TableName: TABLE_NAME,
                Key: { fb_uid: { S: fbUid } },
            })
        );
        if (!result.Item) {
            return Response.json({ error: "User record not found." }, { status: 404 });
        }
        existingItem = result.Item;
    } catch {
        return Response.json({ error: "Failed to fetch user record." }, { status: 500 });
    }

    // 6. Guard — category, home_state, gender must all be set before any rank can be saved
    const dbHomeState = existingItem.home_state?.S?.trim() ?? "";
    const dbGender = existingItem.gender?.S?.trim() ?? "";
    const dbCategory = existingItem.category?.S?.trim() ?? "";

    if (!dbHomeState || !dbGender || !dbCategory) {
        return Response.json(
            { error: "Please set your home state, gender, and category before setting ranks." },
            { status: 403 }
        );
    }

    // 7. Check credit/subscription for this type
    const josaa_credit = existingItem.josaa_credits?.BOOL ?? false;
    const csab_credit = existingItem.csab_credits?.BOOL ?? false;

    if (type === "TEST" && !josaa_credit && !csab_credit) return Response.json({ error: "JOSAA or CSAB subscription required to set TEST rank." }, { status: 403 });
    if (type === "MAINS" && !josaa_credit && !csab_credit) return Response.json({ error: "JOSAA or CSAB subscription required to set MAINS ranks." }, { status: 403 });
    if (type === "ADVANCED" && !josaa_credit) return Response.json({ error: "JOSAA subscription required to set ADVANCED ranks." }, { status: 403 });

    // 8. Validate fields per type
    //    If dbCategory === "OPEN" → only CRL field allowed for MAINS and ADVANCED (no category rank)
    const isOpen = dbCategory === "OPEN";
    let updateFields = {};

    if (type === "TEST") {
        const keys = Object.keys(body).filter(k => k !== "token" && k !== "type");
        if (keys.length !== 1 || !keys.includes("test_mains_crl")) {
            return Response.json({ error: "test_mains_crl is Missing" }, { status: 400 });
        }
        const v = validRank(body.test_mains_crl);
        if (v === null) return Response.json({ error: "Test Main CRL must be between 1 and 15,00,000." }, { status: 400 });
        updateFields.test_mains_crl = v;
    }

    else if (type === "MAINS") {
        const keys = Object.keys(body).filter(k => k !== "token" && k !== "type");

        if (isOpen) {
            // OPEN category — only crl_mains_rank allowed, exactly 1 field
            if (keys.length !== 1 || !keys.includes("crl_mains_rank")) {
                return Response.json({ error: "For JEE MAINS with OPEN category, send exactly: crl_mains_rank." }, { status: 400 });
            }
            const v = validRank(body.crl_mains_rank);
            if (v === null) return Response.json({ error: "crl_mains_rank must be between 1 and 15,00,000." }, { status: 400 });
            updateFields.crl_mains_rank = v;
        } else {
            // All other categories — both fields required
            const allowed = new Set(["crl_mains_rank", "category_mains_rank"]);
            if (keys.length === 0 || keys.some(k => !allowed.has(k))) {
                return Response.json({ error: "For type MAINS, send crl_mains_rank and/or category_mains_rank only." }, { status: 400 });
            }
            if (body.crl_mains_rank !== undefined) {
                const v = validRank(body.crl_mains_rank);
                if (v === null) return Response.json({ error: "crl_mains_rank must be between 1 and 15,00,000." }, { status: 400 });
                updateFields.crl_mains_rank = v;
            }
            if (body.category_mains_rank !== undefined) {
                const v = validRank(body.category_mains_rank);
                if (v === null) return Response.json({ error: "category_mains_rank must be between 1 and 15,00,000." }, { status: 400 });
                updateFields.category_mains_rank = v;
            }
        }
    }

    else if (type === "ADVANCED") {
        const keys = Object.keys(body).filter(k => k !== "token" && k !== "type");

        if (isOpen) {
            // OPEN category — only crl_adv_rank allowed, exactly 1 field
            if (keys.length !== 1 || !keys.includes("crl_adv_rank")) {
                return Response.json({ error: "For type ADVANCED with OPEN category, send exactly: crl_adv_rank." }, { status: 400 });
            }
            const v = validRank(body.crl_adv_rank);
            if (v === null) return Response.json({ error: "crl_adv_rank must be between 1 and 3,00,000." }, { status: 400 });
            updateFields.crl_adv_rank = v;
        } else {
            // All other categories — both fields required
            const allowed = new Set(["crl_adv_rank", "category_adv_rank"]);
            if (keys.length === 0 || keys.some(k => !allowed.has(k))) {
                return Response.json({ error: "For type ADVANCED, send crl_adv_rank and/or category_adv_rank only." }, { status: 400 });
            }
            if (body.crl_adv_rank !== undefined) {
                const v = validRank(body.crl_adv_rank);
                if (v === null) return Response.json({ error: "crl_adv_rank must be between 1 and 3,00,000." }, { status: 400 });
                updateFields.crl_adv_rank = v;
            }
            if (body.category_adv_rank !== undefined) {
                const v = validRank(body.category_adv_rank);
                if (v === null) return Response.json({ error: "category_adv_rank must be between 1 and 3,00,000." }, { status: 400 });
                updateFields.category_adv_rank = v;
            }
        }
    }

    if (Object.keys(updateFields).length === 0) {
        return Response.json({ error: "No valid rank fields provided." }, { status: 400 });
    }

    // 9. One-time guard — reject any field that is already set (non-zero)
    for (const field of Object.keys(updateFields)) {
        const existing = parseInt(existingItem[field]?.N ?? "0", 10);
        if (existing !== 0) {
            return Response.json(
                { error: `${field} has already been set and cannot be changed.` },
                { status: 409 }
            );
        }
    }

    // 10. Build UpdateExpression dynamically
    const fieldNames = Object.keys(updateFields);
    const setClauses = fieldNames.map((f, i) => `${f} = :v${i}`).join(", ");
    const condClauses = fieldNames.map((f) => `(attribute_not_exists(${f}) OR ${f} = :zero)`).join(" AND ");
    const exprValues = {};
    fieldNames.forEach((f, i) => {
        exprValues[`:v${i}`] = { N: String(updateFields[f]) };
    });
    exprValues[":uid"] = { S: fbUid };
    exprValues[":zero"] = { N: "0" };

    try {
        await dynamo.send(
            new UpdateItemCommand({
                TableName: TABLE_NAME,
                Key: { fb_uid: { S: fbUid } },
                UpdateExpression: `SET ${setClauses}`,
                ConditionExpression: `fb_uid = :uid AND ${condClauses}`,
                ExpressionAttributeValues: exprValues,
            })
        );
    } catch (err) {
        if (err?.name === "ConditionalCheckFailedException") {
            return Response.json({ error: "One or more ranks already set (race condition)." }, { status: 409 });
        }
        return Response.json({ error: "Failed to update rank." }, { status: 500 });
    }

    return Response.json({ success: true, message: "Rank updated successfully." }, { status: 200 });
}