// src/app/api/college_search/route.js

import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin";
import { dynamo } from "@/lib/dynamo";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { MongoClient } from "mongodb";

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB singleton
// ─────────────────────────────────────────────────────────────────────────────
let cachedClient = null;
async function getMongoClient() {
    if (cachedClient) return cachedClient;
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedClient = client;
    return client;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE FIX:
// DynamoDB stores gender as "Male" / "Female"
// MongoDB stores gender as "Gender-Neutral" / "Female-only (including Supernumerary)"
//
// "Male"   → can sit in "Gender-Neutral" seats (open to everyone)
// "Female" → can sit in both "Gender-Neutral" AND "Female-Only" seats
// ─────────────────────────────────────────────────────────────────────────────
function mapGenderToDbValues(dynamo_gender) {
    if (dynamo_gender === "Female") {
        return ["Gender-Neutral", "Female-only (including Supernumerary)"];
    }
    // Male → Gender-Neutral seats only
    return ["Gender-Neutral"];
}

// ─────────────────────────────────────────────────────────────────────────────
// ID → value maps
// ─────────────────────────────────────────────────────────────────────────────
const VALID_MODE_IDS = new Set(["TEST", "JOSAA", "CSAB"]);

const ROUND_LIMITS = {
    TEST: { min: 1, max: 6 },
    JOSAA: { min: 1, max: 6 },
    CSAB: { min: 1, max: 3 },
};

const COLLEGE_TYPE_MAP = {
    1001: "IIT",
    1002: "IIIT",
    1003: "NIT",
    1004: "Other Govt College",
};

const DEGREE_TYPE_MAP = {
    2001: "4",
    2002: "5",
};

const BRANCH_MAP = {
    3001: "Computer",
    3002: "Chemical",
    3003: "Aerospace",
    3004: "Aeronautical",
    3005: "Artificial Intelligence",
    3006: "Data Science",
    3007: "Civil",
    3008: "Electronics",
    3009: "Electrical",
    3010: "Metallurgy",
    3011: "Mechanical",
    3012: "Bio Technology",
    3013: "Others",
};

// ─────────────────────────────────────────────────────────────────────────────
// Decode + validate filter ID arrays
// ─────────────────────────────────────────────────────────────────────────────
function decodeAndValidateFilters(body) {
    const errors = [];
    const rawCollegeType = body.college_type;
    const rawDegreeType = body.degree_type;
    const rawBranch = body.branch;

    if (rawCollegeType != null) {
        if (!Array.isArray(rawCollegeType)) errors.push("college_type must be an array");
        else if (rawCollegeType.length > 4) errors.push("college_type max size is 4");
    }
    if (rawDegreeType != null) {
        if (!Array.isArray(rawDegreeType)) errors.push("degree_type must be an array");
        else if (rawDegreeType.length > 2) errors.push("degree_type max size is 2");
    }
    if (rawBranch != null) {
        if (!Array.isArray(rawBranch)) errors.push("branch must be an array");
        else if (rawBranch.length > 12) errors.push("branch max size is 12");
    }

    if (errors.length > 0) return { errors };

    const collegeTypes = (rawCollegeType || []).map(id => COLLEGE_TYPE_MAP[id]).filter(Boolean);
    const degreeTypes = (rawDegreeType || []).map(id => DEGREE_TYPE_MAP[id]).filter(Boolean);
    const branches = (rawBranch || []).map(id => BRANCH_MAP[id]).filter(Boolean);

    return { collegeTypes, degreeTypes, branches, errors: [] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Build frontend filter fields — injected into each pipeline's $match
// ─────────────────────────────────────────────────────────────────────────────
function buildFilterMatch(round, collegeTypes, degreeTypes, branches) {
    const match = {
        year: 2025,
        round: round,
    };
    if (branches.length > 0) match.branch = { $regex: branches.join("|"), $options: "i" };
    if (degreeTypes.length > 0) match.duration = { $regex: degreeTypes.join("|"), $options: "i" };
    if (collegeTypes.length > 0) match.clz_type = { $in: collegeTypes };
    return match;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared pipeline stages
// ─────────────────────────────────────────────────────────────────────────────
const QUOTA_ELIGIBILITY_STAGE = {
    $match: {
        $expr: {
            $or: [
                { $eq: ["$quota", "AI"] },
                { $and: [{ $eq: ["$quota", "HS"] }, { $eq: ["$clz_state", "$user_home_state"] }] },
                { $and: [{ $eq: ["$quota", "OS"] }, { $ne: ["$clz_state", "$user_home_state"] }] },
            ],
        },
    },
};

const CHANCE_CALC_STAGE = {
    $addFields: {
        chance: {
            $switch: {
                branches: [
                    { case: { $lte: ["$rank_used", "$open_rank"] }, then: "Strong" },
                    {
                        case: { $and: [{ $gt: ["$rank_used", "$open_rank"] }, { $lte: ["$rank_used", "$close_rank"] }] },
                        then: "Good",
                    },
                    {
                        case: {
                            $lte: ["$rank_used", { $add: ["$close_rank", { $cond: [{ $in: ["$rank_type", [3, 4]] }, 500, 1200] }] }],
                        },
                        then: "Satisfactory",
                    },
                ],
                default: "Low",
            },
        },
    },
};

const SCORE_STAGE = {
    $addFields: {
        score: {
            $switch: {
                branches: [
                    { case: { $eq: ["$chance", "Strong"] }, then: 4 },
                    { case: { $eq: ["$chance", "Good"] }, then: 3 },
                    { case: { $eq: ["$chance", "Satisfactory"] }, then: 2 },
                ],
                default: 1,
            },
        },
    },
};

const SORT_STAGE = { $sort: { score: -1, clz_tier: 1, branch_score: 1 } };
const LIMIT_STAGE = { $limit: 300 };
const OUTPUT_STAGE = { $project: { clz_name: 1, branch: 1, chance: 1, open_rank: 1, close_rank: 1, year: 1, round: 1, category: 1 } };
const BLOCK_IIT_STAGE = { $match: { clz_type: { $ne: "IIT" } } };

// Rank selectors
const RANK_SELECT_ALL_FOUR = {
    $addFields: {
        rank_used: {
            $switch: {
                branches: [
                    { case: { $eq: ["$rank_type", 1] }, then: "$crl_mains_rank" },
                    { case: { $eq: ["$rank_type", 2] }, then: "$category_mains_rank" },
                    { case: { $eq: ["$rank_type", 3] }, then: "$crl_adv_rank" },
                    { case: { $eq: ["$rank_type", 4] }, then: "$category_adv_rank" },
                ],
            },
        },
    },
};

const RANK_SELECT_MAINS_ONLY = {
    $addFields: {
        rank_used: {
            $switch: {
                branches: [
                    { case: { $eq: ["$rank_type", 1] }, then: "$crl_mains_rank" },
                    { case: { $eq: ["$rank_type", 2] }, then: "$category_mains_rank" },
                ],
            },
        },
    },
};

const RANK_SELECT_OPEN_WITH_ADV = {
    $addFields: {
        rank_used: {
            $switch: {
                branches: [
                    { case: { $eq: ["$rank_type", 1] }, then: "$crl_mains_rank" },
                    { case: { $eq: ["$rank_type", 3] }, then: "$crl_adv_rank" },
                ],
            },
        },
    },
};

const RANK_SELECT_OPEN_MAINS_ONLY = {
    $addFields: {
        rank_used: {
            $switch: {
                branches: [
                    { case: { $eq: ["$rank_type", 1] }, then: "$crl_mains_rank" },
                ],
            },
        },
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline builders
// Gender is passed as dbGenders array into each pipeline's $match stage.
// It is NOT stored in $set — it's only used as a filter, never referenced by later stages.
// ─────────────────────────────────────────────────────────────────────────────

// Condition 2: JOSAA | non-OPEN | has all 4 ranks → sees IITs
function buildPipeline_JOSAA_Category_WithAdv(user, dbGenders, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
                category_mains_rank: user.category_mains_rank,
                crl_adv_rank: user.crl_adv_rank,
                category_adv_rank: user.category_adv_rank,
            }
        },
        { $match: { gender: { $in: dbGenders }, category: { $in: ["OPEN", user.category] }, ...filterMatch } },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_ALL_FOUR,
        CHANCE_CALC_STAGE,
        SCORE_STAGE, SORT_STAGE, LIMIT_STAGE, OUTPUT_STAGE,
    ];
}

// Condition 3: JOSAA | non-OPEN | mains only → no IITs
function buildPipeline_JOSAA_Category_NoAdv(user, dbGenders, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
                category_mains_rank: user.category_mains_rank,
            }
        },
        BLOCK_IIT_STAGE,
        { $match: { gender: { $in: dbGenders }, category: { $in: ["OPEN", user.category] }, ...filterMatch } },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_MAINS_ONLY,
        CHANCE_CALC_STAGE,
        SCORE_STAGE, SORT_STAGE, LIMIT_STAGE, OUTPUT_STAGE,
    ];
}

// Condition 4: JOSAA | OPEN | crl_mains + crl_adv → sees IITs
function buildPipeline_JOSAA_Open_WithAdv(user, dbGenders, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
                crl_adv_rank: user.crl_adv_rank,
            }
        },
        { $match: { gender: { $in: dbGenders }, category: { $in: ["OPEN"] }, ...filterMatch } },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_OPEN_WITH_ADV,
        CHANCE_CALC_STAGE,
        SCORE_STAGE, SORT_STAGE, LIMIT_STAGE, OUTPUT_STAGE,
    ];
}

// Condition 5: JOSAA | OPEN | mains only → no IITs
function buildPipeline_JOSAA_Open_NoAdv(user, dbGenders, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
            }
        },
        BLOCK_IIT_STAGE,
        { $match: { gender: { $in: dbGenders }, category: { $in: ["OPEN"] }, ...filterMatch } },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_OPEN_MAINS_ONLY,
        CHANCE_CALC_STAGE,
        SCORE_STAGE, SORT_STAGE, LIMIT_STAGE, OUTPUT_STAGE,
    ];
}

// Condition 6 (CSAB only): CSAB | OPEN | crl_mains → no IITs ever
function buildPipeline_CSAB_Open(user, dbGenders, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
            }
        },
        BLOCK_IIT_STAGE,
        { $match: { gender: { $in: dbGenders }, category: { $in: ["OPEN"] }, ...filterMatch } },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_OPEN_MAINS_ONLY,
        CHANCE_CALC_STAGE,
        SCORE_STAGE, SORT_STAGE, LIMIT_STAGE, OUTPUT_STAGE,
    ];
}

// Condition 7 (CSAB only): CSAB | non-OPEN | crl_mains + cat_mains → no IITs ever
function buildPipeline_CSAB_Category(user, dbGenders, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
                category_mains_rank: user.category_mains_rank,
            }
        },
        BLOCK_IIT_STAGE,
        { $match: { gender: { $in: dbGenders }, category: { $in: ["OPEN", user.category] }, ...filterMatch } },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_MAINS_ONLY,
        CHANCE_CALC_STAGE,
        SCORE_STAGE, SORT_STAGE, LIMIT_STAGE, OUTPUT_STAGE,
    ];
}

// ── TEST pipelines (JOSAA collection, no IITs, test_mains_crl only) ───────────

// TEST | OPEN category
function buildPipeline_TEST_OPEN_CATEGORY(user, dbGenders, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_category: user.category,
                crl_mains_rank: user.test_mains_crl,
            }
        },
        BLOCK_IIT_STAGE,
        { $match: { gender: { $in: dbGenders }, category: { $in: ["OPEN"] }, ...filterMatch } },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_OPEN_MAINS_ONLY,
        CHANCE_CALC_STAGE,
        SCORE_STAGE, SORT_STAGE, LIMIT_STAGE, OUTPUT_STAGE,
    ];
}

// TEST | non-OPEN category
function buildPipeline_TEST_WITH_CATEGORY(user, dbGenders, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_category: user.category,
                crl_mains_rank: user.test_mains_crl,
            }
        },
        BLOCK_IIT_STAGE,
        { $match: { gender: { $in: dbGenders }, category: { $in: ["OPEN"] }, ...filterMatch } },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_MAINS_ONLY,
        CHANCE_CALC_STAGE,
        SCORE_STAGE, SORT_STAGE, LIMIT_STAGE, OUTPUT_STAGE,
    ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline selector — fully separated by mode
// ─────────────────────────────────────────────────────────────────────────────
function selectPipeline(mode, user, dbGenders, filterMatch) {
    const isOpen = user.category === "OPEN";
    const hasCrlMains = user.crl_mains_rank > 0;
    const hasCatMains = user.category_mains_rank > 0;
    const hasCrlAdv = user.crl_adv_rank > 0;
    const hasCatAdv = user.category_adv_rank > 0;
    const hasMainsRanks = hasCrlMains && hasCatMains;
    const hasBothAdv = hasCrlAdv && hasCatAdv;
    const hasTestRank = user.test_mains_crl > 0;

    // ── JOSAA ────────────────────────────────────────────────────────────────
    if (mode === "JOSAA") {
        if (!isOpen) {
            if (hasMainsRanks && hasBothAdv) return { pipeline: buildPipeline_JOSAA_Category_WithAdv(user, dbGenders, filterMatch) };
            if (hasMainsRanks) return { pipeline: buildPipeline_JOSAA_Category_NoAdv(user, dbGenders, filterMatch) };
            return { pipeline: null, error: "Insufficient rank data for JOSAA (non-OPEN). Need crl_mains_rank and category_mains_rank." };
        }
        // OPEN
        if (hasCrlMains && hasCrlAdv) return { pipeline: buildPipeline_JOSAA_Open_WithAdv(user, dbGenders, filterMatch) };
        if (hasCrlMains) return { pipeline: buildPipeline_JOSAA_Open_NoAdv(user, dbGenders, filterMatch) };
        return { pipeline: null, error: "Insufficient rank data for JOSAA (OPEN). Need crl_mains_rank." };
    }

    // ── CSAB ─────────────────────────────────────────────────────────────────
    if (mode === "CSAB") {
        if (isOpen) {
            if (hasCrlMains) return { pipeline: buildPipeline_CSAB_Open(user, dbGenders, filterMatch) };
            return { pipeline: null, error: "Insufficient rank data for CSAB (OPEN). Need crl_mains_rank." };
        }
        if (hasMainsRanks) return { pipeline: buildPipeline_CSAB_Category(user, dbGenders, filterMatch) };
        return { pipeline: null, error: "Insufficient rank data for CSAB (non-OPEN). Need crl_mains_rank and category_mains_rank." };
    }

    // ── TEST ─────────────────────────────────────────────────────────────────
    if (mode === "TEST") {
        if (!hasTestRank) return { pipeline: null, error: "Insufficient rank data for TEST. Need test_mains_crl." };
        if (isOpen) return { pipeline: buildPipeline_TEST_OPEN_CATEGORY(user, dbGenders, filterMatch) };
        return { pipeline: buildPipeline_TEST_WITH_CATEGORY(user, dbGenders, filterMatch) };
    }

    return { pipeline: null, error: "Could not determine pipeline." };
}

// ─────────────────────────────────────────────────────────────────────────────
// DynamoDB fetch
// ─────────────────────────────────────────────────────────────────────────────
async function fetchUserFromDynamo(fb_uid) {
    const command = new GetItemCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: { fb_uid: { S: fb_uid } },
    });
    const response = await dynamo.send(command);
    if (!response.Item) return null;
    const item = response.Item;
    return {
        josaa_credits: item.josaa_credits?.BOOL ?? false,
        csab_credits: item.csab_credits?.BOOL ?? false,
        home_state: item.home_state?.S ?? "",
        gender: item.gender?.S ?? "",
        category: item.category?.S ?? "",
        test_mains_crl: parseInt(item.test_mains_crl?.N ?? "0", 10),
        crl_mains_rank: parseInt(item.crl_mains_rank?.N ?? "0", 10),
        category_mains_rank: parseInt(item.category_mains_rank?.N ?? "0", 10),
        crl_adv_rank: parseInt(item.crl_adv_rank?.N ?? "0", 10),
        category_adv_rank: parseInt(item.category_adv_rank?.N ?? "0", 10),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/college_search
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
    try {
        // 1. Parse body
        let body;
        try { body = await request.json(); }
        catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

        const { jwt, mode, round } = body;

        // 2. Verify JWT
        if (!jwt) return NextResponse.json({ error: "Missing jwt" }, { status: 401 });
        let fb_uid;
        try { const decoded = await admin.auth().verifyIdToken(jwt); fb_uid = decoded.uid; }
        catch { return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }); }

        // 3. Validate mode
        if (!mode || !VALID_MODE_IDS.has(mode))
            return NextResponse.json({ error: `Invalid mode. Must be one of: ${[...VALID_MODE_IDS].join(", ")}` }, { status: 400 });

        // 4. Validate round
        if (round === undefined || round === null)
            return NextResponse.json({ error: "round is required" }, { status: 400 });
        const roundInt = parseInt(round, 10);
        const { min, max } = ROUND_LIMITS[mode];
        if (isNaN(roundInt) || roundInt < min || roundInt > max)
            return NextResponse.json({ error: `Invalid round for ${mode}. Must be ${min}–${max}.` }, { status: 400 });

        // 5. Decode filters
        const filterResult = decodeAndValidateFilters(body);
        if (filterResult.errors.length > 0)
            return NextResponse.json({ error: filterResult.errors.join("; ") }, { status: 400 });
        const { collegeTypes, degreeTypes, branches } = filterResult;

        // 6. Fetch user from DynamoDB
        let user;
        try { user = await fetchUserFromDynamo(fb_uid); }
        catch (e) { console.error("[college_search] DynamoDB error:", e); return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 }); }
        if (!user) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

        // 7. Check subscription credits
        if (mode === "JOSAA" && !user.josaa_credits)
            return NextResponse.json({ error: "JOSAA subscription required" }, { status: 403 });
        if (mode === "CSAB" && !user.csab_credits)
            return NextResponse.json({ error: "CSAB subscription required" }, { status: 403 });
        if (mode === "TEST" && !user.josaa_credits && !user.csab_credits)
            return NextResponse.json({ error: "An active subscription (JOSAA or CSAB) is required for TEST mode" }, { status: 403 });

        // 8. Map DynamoDB gender → MongoDB gender values  ← THE FIX
        const dbGenders = mapGenderToDbValues(user.gender);

        // 9. Build filter match
        const filterMatch = buildFilterMatch(roundInt, collegeTypes, degreeTypes, branches);

        // 10. Select pipeline
        const { pipeline, error: pipelineError } = selectPipeline(mode, user, dbGenders, filterMatch);
        if (!pipeline) return NextResponse.json({ error: pipelineError }, { status: 422 });

        // 11. Run aggregation
        // JOSAA → MONGODB_COLLECTION_JOSAA
        // TEST  → MONGODB_COLLECTION_JOSAA  (same data, different rank logic)
        // CSAB  → MONGODB_COLLECTION_CSAB
        let raw;
        try {
            const collectionName = (mode === "CSAB")
                ? process.env.MONGODB_COLLECTION_CSAB
                : process.env.MONGODB_COLLECTION_JOSAA;

            const client = await getMongoClient();
            const db = client.db(process.env.MONGODB_DB_NAME);
            const collection = db.collection(collectionName);
            raw = await collection.aggregate(pipeline).toArray();
        } catch (e) {
            console.error("[college_search] MongoDB error:", e);
            return NextResponse.json({ error: "Database query failed" }, { status: 500 });
        }

        // 12. Shape response
        const results = raw.map(doc => ({
            college_name: doc.clz_name ?? "",
            branch: doc.branch ?? "",
            probability: doc.chance ?? "",
            round: doc.round ?? "",
            year: doc.year ?? "",
            opening: doc.open_rank ?? "",
            closing: doc.close_rank ?? "",
            category: doc.category ?? "",
        }));

        return NextResponse.json({ results }, { status: 200 });

    } catch (err) {
        console.error("[college_search] Unexpected error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}