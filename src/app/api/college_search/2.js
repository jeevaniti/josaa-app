// src/app/api/college_search/route.js

import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin";
import { dynamo } from "@/lib/dynamo";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { MongoClient } from "mongodb";

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB singleton connection
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
// ID → value maps  (frontend sends IDs, we decode them here)
// ─────────────────────────────────────────────────────────────────────────────

const VALID_MODE_IDS = new Set(["TEST", "JOSAA", "CSAB"]);

const ROUND_LIMITS = {
    TEST: { min: 1, max: 6 },
    JOSAA: { min: 1, max: 6 },
    CSAB: { min: 1, max: 3 },
};

// College type IDs → MongoDB clz_type strings
const COLLEGE_TYPE_MAP = {
    1001: "IIT",
    1002: "IIIT",
    1003: "NIT",
    1004: "Other Govt College",
};

// Degree type IDs → regex pattern strings matched against `duration` field
const DEGREE_TYPE_MAP = {
    2001: "4",  // "4 Years"
    2002: "5",  // "5 Years"
};

// Branch IDs → regex keyword strings matched against `branch` field
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
    3012: "Bio Technology"
};

// ─────────────────────────────────────────────────────────────────────────────
// Decode + validate incoming filter ID arrays
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

    // Decode IDs → values (unknown IDs are silently dropped)
    const collegeTypes = (rawCollegeType || []).map(id => COLLEGE_TYPE_MAP[id]).filter(Boolean);
    const degreeTypes = (rawDegreeType || []).map(id => DEGREE_TYPE_MAP[id]).filter(Boolean);
    const branches = (rawBranch || []).map(id => BRANCH_MAP[id]).filter(Boolean);

    return { collegeTypes, degreeTypes, branches, errors: [] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the frontend-filter $match fields object
// This object is spread directly into each pipeline's $match stage.
// Empty arrays = that filter is not applied (fetch all).
// ─────────────────────────────────────────────────────────────────────────────
function buildFilterMatch(round, collegeTypes, degreeTypes, branches) {
    const match = {
        year: 2025,
        round: round,
    };

    // branch: regex OR of all decoded keywords  e.g. "Computer|Civil|Electrical"
    if (branches.length > 0) {
        match.branch = { $regex: branches.join("|"), $options: "i" };
    }

    // duration: regex OR of decoded values  e.g. "4|5"
    if (degreeTypes.length > 0) {
        match.duration = { $regex: degreeTypes.join("|"), $options: "i" };
    }

    // clz_type: $in array  e.g. ["IIT", "NIT"]
    if (collegeTypes.length > 0) {
        match.clz_type = { $in: collegeTypes };
    }

    return match;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared pipeline stages — identical across all pipelines
// ─────────────────────────────────────────────────────────────────────────────

const QUOTA_ELIGIBILITY_STAGE = {
    $match: {
        $expr: {
            $or: [
                { $eq: ["$quota", "AI"] },
                {
                    $and: [
                        { $eq: ["$quota", "HS"] },
                        { $eq: ["$clz_state", "$user_home_state"] },
                    ],
                },
                {
                    $and: [
                        { $eq: ["$quota", "OS"] },
                        { $ne: ["$clz_state", "$user_home_state"] },
                    ],
                },
            ],
        },
    },
};

const CHANCE_CALC_STAGE = {
    $addFields: {
        chance: {
            $switch: {
                branches: [
                    {
                        case: { $lte: ["$rank_used", "$open_rank"] },
                        then: "Strong",
                    },
                    {
                        case: {
                            $and: [
                                { $gt: ["$rank_used", "$open_rank"] },
                                { $lte: ["$rank_used", "$close_rank"] },
                            ],
                        },
                        then: "Good",
                    },
                    {
                        case: {
                            $lte: [
                                "$rank_used",
                                {
                                    $add: [
                                        "$close_rank",
                                        { $cond: [{ $in: ["$rank_type", [3, 4]] }, 500, 1200] },
                                    ],
                                },
                            ],
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
const OUTPUT_STAGE = { $project: { clz_name: 1, branch: 1, chance: 1 } };

// Rank selection: has all 4 rank types (mains CRL, mains category, adv CRL, adv category)
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

// Rank selection: mains only — rank_type 1 and 2
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

// Rank selection: OPEN with adv — rank_type 1 (mains CRL) and 3 (adv CRL)
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

// Rank selection: OPEN mains only — rank_type 1 only
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

// Block IITs — used when user has no advanced rank
const BLOCK_IIT_STAGE = { $match: { clz_type: { $ne: "IIT" } } };

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE BUILDERS — one per condition, strictly separated
// ─────────────────────────────────────────────────────────────────────────────

// ── CONDITION 2 ──────────────────────────────────────────────────────────────
// JOSAA | category != "OPEN"
// has ALL four ranks: crl_mains, cat_mains, crl_adv, cat_adv
// → Can see IITs
function buildPipeline_JOSAA_Category_WithAdv(user, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_gender: user.gender,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
                category_mains_rank: user.category_mains_rank,
                crl_adv_rank: user.crl_adv_rank,
                category_adv_rank: user.category_adv_rank,
            },
        },
        {
            $match: {
                gender: user.gender,
                category: { $in: ["OPEN", user.category] },
                ...filterMatch,
            },
        },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_ALL_FOUR,
        CHANCE_CALC_STAGE,
        SCORE_STAGE,
        SORT_STAGE,
        LIMIT_STAGE,
        OUTPUT_STAGE,
    ];
}

// ── CONDITION 3 ──────────────────────────────────────────────────────────────
// JOSAA | category != "OPEN"
// has ONLY mains ranks: crl_mains, cat_mains  (no adv ranks)
// → Cannot see IITs
function buildPipeline_JOSAA_Category_NoAdv(user, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_gender: user.gender,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
                category_mains_rank: user.category_mains_rank,
            },
        },
        BLOCK_IIT_STAGE,
        {
            $match: {
                gender: user.gender,
                category: { $in: ["OPEN", user.category] },
                ...filterMatch,
            },
        },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_MAINS_ONLY,
        CHANCE_CALC_STAGE,
        SCORE_STAGE,
        SORT_STAGE,
        LIMIT_STAGE,
        OUTPUT_STAGE,
    ];
}

// ── CONDITION 4 ──────────────────────────────────────────────────────────────
// JOSAA | category == "OPEN"
// has: crl_mains AND crl_adv
// → Can see IITs
function buildPipeline_JOSAA_Open_WithAdv(user, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_gender: user.gender,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
                crl_adv_rank: user.crl_adv_rank,
            },
        },
        {
            $match: {
                gender: user.gender,
                category: { $in: ["OPEN"] },
                ...filterMatch,
            },
        },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_OPEN_WITH_ADV,
        CHANCE_CALC_STAGE,
        SCORE_STAGE,
        SORT_STAGE,
        LIMIT_STAGE,
        OUTPUT_STAGE,
    ];
}

// ── CONDITION 5 ──────────────────────────────────────────────────────────────
// JOSAA | category == "OPEN"
// has ONLY: crl_mains  (no adv rank)
// → Cannot see IITs
function buildPipeline_JOSAA_Open_NoAdv(user, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_gender: user.gender,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
            },
        },
        BLOCK_IIT_STAGE,
        {
            $match: {
                gender: user.gender,
                category: { $in: ["OPEN"] },
                ...filterMatch,
            },
        },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_OPEN_MAINS_ONLY,
        CHANCE_CALC_STAGE,
        SCORE_STAGE,
        SORT_STAGE,
        LIMIT_STAGE,
        OUTPUT_STAGE,
    ];
}

// ── CONDITION 6 ──────────────────────────────────────────────────────────────
// CSAB or TEST | category == "OPEN"
// has: crl_mains
// → IITs always blocked in CSAB/TEST
function buildPipeline_CSAB_TEST_Open(user, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_gender: user.gender,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
            },
        },
        BLOCK_IIT_STAGE,
        {
            $match: {
                gender: user.gender,
                category: { $in: ["OPEN"] },
                ...filterMatch,
            },
        },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_OPEN_MAINS_ONLY,
        CHANCE_CALC_STAGE,
        SCORE_STAGE,
        SORT_STAGE,
        LIMIT_STAGE,
        OUTPUT_STAGE,
    ];
}

// ── CONDITION 7 ──────────────────────────────────────────────────────────────
// CSAB or TEST | category != "OPEN"
// has: crl_mains AND cat_mains
// → IITs always blocked in CSAB/TEST
function buildPipeline_CSAB_TEST_Category(user, filterMatch) {
    return [
        {
            $set: {
                user_home_state: user.home_state,
                user_gender: user.gender,
                user_category: user.category,
                crl_mains_rank: user.crl_mains_rank,
                category_mains_rank: user.category_mains_rank,
            },
        },
        BLOCK_IIT_STAGE,
        {
            $match: {
                gender: user.gender,
                category: { $in: ["OPEN", user.category] },
                ...filterMatch,
            },
        },
        QUOTA_ELIGIBILITY_STAGE,
        RANK_SELECT_MAINS_ONLY,
        CHANCE_CALC_STAGE,
        SCORE_STAGE,
        SORT_STAGE,
        LIMIT_STAGE,
        OUTPUT_STAGE,
    ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline selector
// Returns { pipeline } on success or { pipeline: null, error: string } on fail
// ─────────────────────────────────────────────────────────────────────────────
function selectPipeline(mode, user, filterMatch) {
    const isOpen = user.category === "OPEN";
    const hasCrlMains = user.crl_mains_rank > 0;
    const hasCatMains = user.category_mains_rank > 0;
    const hasCrlAdv = user.crl_adv_rank > 0;
    const hasCatAdv = user.category_adv_rank > 0;
    const hasMainsRanks = hasCrlMains && hasCatMains;
    const hasBothAdv = hasCrlAdv && hasCatAdv;

    // ── JOSAA conditions ────────────────────────────────────────────────────
    if (mode === "JOSAA") {
        if (!isOpen) {
            // Condition 2: non-OPEN + all four ranks (mains + adv)
            if (hasMainsRanks && hasBothAdv) {
                return { pipeline: buildPipeline_JOSAA_Category_WithAdv(user, filterMatch) };
            }
            // Condition 3: non-OPEN + mains only (no adv ranks at all)
            if (hasMainsRanks) {
                return { pipeline: buildPipeline_JOSAA_Category_NoAdv(user, filterMatch) };
            }
            return {
                pipeline: null,
                error: "Insufficient rank data for JOSAA (non-OPEN). Need at least crl_mains_rank and category_mains_rank.",
            };
        }

        if (isOpen) {
            // Condition 4: OPEN + crl_mains + crl_adv
            if (hasCrlMains && hasCrlAdv) {
                return { pipeline: buildPipeline_JOSAA_Open_WithAdv(user, filterMatch) };
            }
            // Condition 5: OPEN + crl_mains only (no adv rank)
            if (hasCrlMains) {
                return { pipeline: buildPipeline_JOSAA_Open_NoAdv(user, filterMatch) };
            }
            return {
                pipeline: null,
                error: "Insufficient rank data for JOSAA (OPEN). Need at least crl_mains_rank.",
            };
        }
    }

    // ── CSAB and TEST conditions ────────────────────────────────────────────
    if (mode === "CSAB" || mode === "TEST") {
        if (isOpen) {
            // Condition 6: OPEN + crl_mains
            if (hasCrlMains) {
                return { pipeline: buildPipeline_CSAB_TEST_Open(user, filterMatch) };
            }
            return {
                pipeline: null,
                error: "Insufficient rank data for CSAB/TEST (OPEN). Need crl_mains_rank.",
            };
        }

        if (!isOpen) {
            // Condition 7: non-OPEN + crl_mains + cat_mains
            if (hasMainsRanks) {
                return { pipeline: buildPipeline_CSAB_TEST_Category(user, filterMatch) };
            }
            return {
                pipeline: null,
                error: "Insufficient rank data for CSAB/TEST (non-OPEN). Need crl_mains_rank and category_mains_rank.",
            };
        }
    }

    return { pipeline: null, error: "Could not determine a valid pipeline for the given inputs." };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch user from DynamoDB  (fb_uid = primary key)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchUserFromDynamo(fb_uid) {
    const command = new GetItemCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            fb_uid: { S: fb_uid },
        },
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
// POST  /api/college_search
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
    try {

        // ── STEP 1: Parse body ────────────────────────────────────────────
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { jwt, mode, round } = body;

        // ── STEP 2: Validate JWT → get Firebase UID ───────────────────────
        if (!jwt) {
            return NextResponse.json({ error: "Missing jwt" }, { status: 401 });
        }

        let fb_uid;
        try {
            const decoded = await admin.auth().verifyIdToken(jwt);
            fb_uid = decoded.uid;
        } catch {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        // ── STEP 3: Validate mode ─────────────────────────────────────────
        if (!mode || !VALID_MODE_IDS.has(mode)) {
            return NextResponse.json(
                { error: `Invalid mode. Must be one of: ${[...VALID_MODE_IDS].join(", ")}` },
                { status: 400 }
            );
        }

        // ── STEP 4: Validate round ────────────────────────────────────────
        if (round === undefined || round === null) {
            return NextResponse.json({ error: "round is required" }, { status: 400 });
        }

        const roundInt = parseInt(round, 10);
        const { min, max } = ROUND_LIMITS[mode];

        if (isNaN(roundInt) || roundInt < min || roundInt > max) {
            return NextResponse.json(
                { error: `Invalid round for ${mode}. Must be an integer between ${min} and ${max}.` },
                { status: 400 }
            );
        }

        // ── STEP 5: Decode + validate filter ID arrays ────────────────────
        const filterResult = decodeAndValidateFilters(body);
        if (filterResult.errors.length > 0) {
            return NextResponse.json({ error: filterResult.errors.join("; ") }, { status: 400 });
        }
        const { collegeTypes, degreeTypes, branches } = filterResult;

        // ── STEP 6: Fetch user from DynamoDB ──────────────────────────────
        let user;
        try {
            user = await fetchUserFromDynamo(fb_uid);
        } catch (e) {
            console.error("[college_search] DynamoDB error:", e);
            return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
        }

        if (!user) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        // ── STEP 7: Check subscription credits ────────────────────────────
        if (mode === "JOSAA" && !user.josaa_credits) {
            return NextResponse.json({ error: "JOSAA subscription required" }, { status: 403 });
        }
        if (mode === "CSAB" && !user.csab_credits) {
            return NextResponse.json({ error: "CSAB subscription required" }, { status: 403 });
        }
        if (mode === "TEST" && !user.josaa_credits && !user.csab_credits) {
            return NextResponse.json(
                { error: "An active subscription (JOSAA or CSAB) is required for TEST mode" },
                { status: 403 }
            );
        }

        // ── STEP 8: Build frontend filter $match object ───────────────────
        const filterMatch = buildFilterMatch(roundInt, collegeTypes, degreeTypes, branches);

        // ── STEP 9: Select pipeline based on mode + user data ─────────────
        const { pipeline, error: pipelineError } = selectPipeline(mode, user, filterMatch);

        if (!pipeline) {
            return NextResponse.json({ error: pipelineError }, { status: 422 });
        }

        // ── STEP 10: Run aggregation against MongoDB ──────────────────────
        let raw;
        try {
            const client = await getMongoClient();
            const db = client.db(process.env.MONGODB_DB_NAME);
            const collection = db.collection(process.env.MONGODB_COLLECTION_NAME);
            raw = await collection.aggregate(pipeline).toArray();
        } catch (e) {
            console.error("[college_search] MongoDB error:", e);
            return NextResponse.json({ error: "Database query failed" }, { status: 500 });
        }

        // ── STEP 11: Shape and return response ────────────────────────────
        const results = raw.map(doc => ({
            college_name: doc.clz_name ?? "",
            branch: doc.branch ?? "",
            probability: doc.chance ?? "",
        }));

        return NextResponse.json({ results }, { status: 200 });

    } catch (err) {
        console.error("[college_search] Unexpected error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}