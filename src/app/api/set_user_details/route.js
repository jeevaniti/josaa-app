
// This API will receive JSON body in the below format,


/*

Verify Response Carefully. Dont fill randomly "" string anywhere.

--> Validate keys(sent from user) = ["home_state", "fb_uid", "gender", "category"]
--> Only 4 fields should be there.
1) verify/validate fb_token if its correct or not
2) Decode: const {fb_uid, email} from fb_token
3) fetch record in AWS Dynamo DB of user with Primary key:  fb_uid
   > If those three fields: home_state, category, gender is EMPTY in that. or NULL. Then only proceed further, if not No Need to Update,
   > because this will be one time update.
4) For the fields:
    "home_state": "",
    "category": "",
    "gender": "",

-> Field value validater:
    const gender = [ 'female', 'male' ];

    const home_state =
        [
        'Andhra Pradesh',    'Arunachal Pradesh',
        'Assam',             'Bihar',
        'Chandigarh',        'Chhattisgarh',
        'Delhi',             'Diu (UT)',
        'Goa',               'Gujarat',
        'Haryana',           'Himachal Pradesh',
        'Jammu and Kashmir', 'Jharkhand',
        'Karnataka',         'Kerala',
        'Madhya Pradesh',    'Maharashtra',
        'Manipur',           'Meghalaya',
        'Mizoram',           'Nagaland',
        'Odisha',            'Puducherry',
        'Punjab',            'Rajasthan',
        'Sikkim',            'Tamil Nadu',
        'Telangana',         'Tripura',
        'Uttar Pradesh',     'Uttarakhand',
        'West Bengal'
        ]

        const categories = [
            'EWS',
            'EWS (PwD)',
            'OBC-NCL',
            'OBC-NCL (PwD)',
            'OPEN',
            'OPEN (PwD)',
            'SC',
            'SC (PwD)',
            'ST',
            'ST (PwD)'
        ]


-> No key should be empty. Literally no key. which will be sent from user. All 3 should contain String values.
-> if the fields received from user not present in among above list of values,
    Just response back with error: no further processing needed.
   Note: Carefully handle JSON or Comparision breaking string, caused by random things Lol . i need high security here.


-> if the all those 3 fields have successfullly matched from their respective fields then only:

-->  AWS Dynamo DB which have been called by fb_uid, update those 3 fields of user: with contains PK: "fb_uid"

*/





// let dataset = {
//     "fb_token": "",
//     "email": "",


//     // pair
//     "home_state": "",
//     "gender": "",
//     "category": "",
// }


// src/app/api/set_user_details/route.js
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// ─── Firebase Admin (singleton) ──────────────────────────────────────────────
function getFirebaseAdmin() {
    if (getApps().length === 0) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        });
    }
    return getAuth();
}

// ─── DynamoDB client (singleton) ─────────────────────────────────────────────
const dynamo = new DynamoDBClient({
    region: process.env.MY_AWS_REGION,
    credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY,
        secretAccessKey: process.env.MY_AWS_SECRET_KEY,
    },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME; // e.g. "users"

// ─── Allowed values (source of truth) ────────────────────────────────────────
const ALLOWED_GENDERS = new Set(["Male", "Female"]);

const ALLOWED_HOME_STATES = new Set([
    "Andhra Pradesh", "Arunachal Pradesh",
    "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh",
    "Delhi", "Diu (UT)",
    "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh",
    "Jammu and Kashmir", "Jharkhand",
    "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya",
    "Mizoram", "Nagaland",
    "Odisha", "Puducherry",
    "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand",
    "West Bengal",
]);

const ALLOWED_CATEGORIES = new Set([
    "EWS",
    "EWS (PwD)",
    "OBC-NCL",
    "OBC-NCL (PwD)",
    "OPEN",
    "OPEN (PwD)",
    "SC",
    "SC (PwD)",
    "ST",
    "ST (PwD)",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a clean, trimmed string — or null if the value is not a non-empty string.
 * Rejects anything that isn't a plain string type (no objects, arrays, etc.).
 */
function safeString(val) {
    if (typeof val !== "string") return null;
    const trimmed = val.trim();
    if (trimmed.length === 0) return null;
    return trimmed;
}

/**
 * Strict structural guard — only allows the exact 4 expected keys in the body.
 * Any extra key → rejected immediately.
 */
function validateBodyKeys(body) {
    const EXPECTED = new Set(["jwt", "home_state", "gender", "category"]);
    const received = Object.keys(body);
    if (received.length !== 4) return false;
    return received.every((k) => EXPECTED.has(k));
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request) {
    // 1. Parse body safely
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json(
            { error: "Invalid JSON body." },
            { status: 400 }
        );
    }

    // 2. Strict key validation — exactly 4 keys, no more, no less
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return Response.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }

    if (!validateBodyKeys(body)) {
        return Response.json(
            { error: "Request must contain exactly these keys: jwt, home_state, gender, category." },
            { status: 400 }
        );
    }

    // 3. Extract & clean fields
    const rawJwt = safeString(body.jwt);
    const rawHomeState = safeString(body.home_state);
    const rawGender = safeString(body.gender);
    const rawCategory = safeString(body.category);

    // 4. None of the 4 fields may be empty
    if (!rawJwt || !rawHomeState || !rawGender || !rawCategory) {
        return Response.json(
            { error: "All fields (jwt, home_state, gender, category) are required and must be non-empty strings." },
            { status: 400 }
        );
    }

    // 5. Validate field values against allowed lists
    if (!ALLOWED_HOME_STATES.has(rawHomeState)) {
        return Response.json({ error: "Invalid home_state value." }, { status: 400 });
    }

    if (!ALLOWED_GENDERS.has(rawGender)) {
        return Response.json({ error: "Invalid gender value. Must be 'Male' or 'Female'." }, { status: 400 });
    }

    if (!ALLOWED_CATEGORIES.has(rawCategory)) {
        return Response.json({ error: "Invalid category value." }, { status: 400 });
    }

    // 6. Verify Firebase JWT
    let fbUid;
    try {
        const adminAuth = getFirebaseAdmin();
        const decoded = await adminAuth.verifyIdToken(rawJwt);
        fbUid = decoded.uid;

        if (!fbUid || typeof fbUid !== "string" || fbUid.trim().length === 0) {
            throw new Error("UID missing from token.");
        }
    } catch {
        return Response.json({ error: "Invalid or expired Firebase token." }, { status: 401 });
    }

    // 7. Fetch existing DynamoDB record
    let existingItem;
    try {
        const getCmd = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: { fb_uid: { S: fbUid } },
        });
        const result = await dynamo.send(getCmd);

        if (!result.Item) {
            return Response.json({ error: "User record not found." }, { status: 404 });
        }

        existingItem = result.Item;
    } catch (err) {
        return Response.json({ error: `${err}` }, { status: 500 });
    }

    // 8. One-time update guard — if ANY of the 3 fields is already set, reject entirely.
    //    These fields are write-once: set together on first submit, never changed after.
    const existingHomeState = existingItem?.home_state?.S;
    const existingGender = existingItem?.gender?.S;
    const existingCategory = existingItem?.category?.S;

    const homeStateSet = typeof existingHomeState === "string" && existingHomeState.trim().length > 0;
    const genderSet = typeof existingGender === "string" && existingGender.trim().length > 0;
    const categorySet = typeof existingCategory === "string" && existingCategory.trim().length > 0;

    if (homeStateSet || genderSet || categorySet) {
        return Response.json(
            { error: "Student details have already been set and cannot be changed." },
            { status: 409 }
        );
    }

    // 9. All 3 fields are empty — safe to do the one-time write.
    //    DynamoDB ConditionExpression enforces this at the DB level too,
    //    guarding against any race condition between the GET and this UPDATE.
    try {
        const updateCmd = new UpdateItemCommand({
            TableName: TABLE_NAME,
            Key: { fb_uid: { S: fbUid } },

            UpdateExpression: "SET home_state = :hs, gender = :g, category = :c",

            // DB-level race condition guard: all 3 must still be absent at write time
            ConditionExpression:
                "fb_uid = :uid" +
                " AND (attribute_not_exists(home_state) OR home_state = :empty)" +
                " AND (attribute_not_exists(gender)     OR gender     = :empty)" +
                " AND (attribute_not_exists(category)   OR category   = :empty)",

            ExpressionAttributeValues: {
                ":hs": { S: rawHomeState },
                ":g": { S: rawGender },
                ":c": { S: rawCategory },
                ":uid": { S: fbUid },
                ":empty": { S: "" },
            },
        });

        await dynamo.send(updateCmd);
    } catch (err) {
        // ConditionalCheckFailedException — uid mismatch (should not normally happen)
        if (err?.name === "ConditionalCheckFailedException") {
            return Response.json({ error: "Ownership check failed." }, { status: 403 });
        }
        return Response.json({ error: "Failed to update user details." }, { status: 500 });
    }

    // 10. Success
    return Response.json(
        { success: true, message: "Student details updated successfully." },
        { status: 200 }
    );
}