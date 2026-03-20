import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin";
import { dynamo } from "@/lib/dynamo";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";

export async function POST(req) {
    try {

        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: "Firebase token missing" },
                { status: 400 }
            );
        }

        // Verify Firebase token
        const decoded = await admin.auth().verifyIdToken(token);

        const fb_uid = decoded.uid;
        const user_email = decoded.email;

        if (!fb_uid) {
            return NextResponse.json(
                { error: "Invalid Firebase token" },
                { status: 401 }
            );
        }

        // Insert only if user doesn't exist
        // await dynamo.send(
        //     new PutItemCommand({
        //         TableName: "josaa_users_db",
        //         Item: {
        //             fb_uid: { S: fb_uid },
        //             user_email: { S: user_email },

        //             josaa_credits: { BOOL: false },
        //             csab_credits: { BOOL: false },

        //             josaa_allowed_main: { L: [] }, // max - 2, min - 0
        //             josaa_allowed_adv: { L: [] }, // max - 1, min - 0
        //             csab_allowed_main: { L: [] } // max - 1, min - 0
        //         },
        //         ConditionExpression: "attribute_not_exists(fb_uid)"
        //     })
        // );

        console.log("Region:", process.env.MY_AWS_REGION);
        console.log("Key:", process.env.MY_AWS_ACCESS_KEY);
        await dynamo.send(
            new PutItemCommand({
                TableName: "josaa_users_db",
                Item: {
                    fb_uid: { S: fb_uid },
                    user_email: { S: user_email },


                    josaa_credits: { BOOL: false },
                    csab_credits: { BOOL: false },

                    home_state: { S: "" },
                    gender: { S: "" },
                    category: { S: "" },

                    test_mains_crl: { N: "0" },

                    category_mains_rank: { N: "0" },
                    crl_mains_rank: { N: "0" },

                    category_adv_rank: { N: "0" },
                    crl_adv_rank: { N: "0" }

                },
                ConditionExpression: "attribute_not_exists(fb_uid)"
            })
        );

        return NextResponse.json({
            success: true,
            message: "User created or already exists"
        });

    } catch (error) {

        // DynamoDB throws this if user already exists
        if (error.name === "ConditionalCheckFailedException") {
            return NextResponse.json({
                success: true,
                message: "User already exists"
            });
        }

        console.error(error);

        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}