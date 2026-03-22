/*


> recives JWT + Plan Type, from client
> verify jwt and plan type input field(Int Type) (locally) with plantype array. 
        // Give Less Choice to Customers
        const plan_Types = {
            josaa_basic: {
                josaa_credits: 2,
                price: 103
            },
            csab_basic: {
                csab_credits: 2,
                price: 99
            },
            josaa_plus_csab: {
                josaa_credits: 4,
                csab_credits: 4,
                price: 149
            },
        }
> decode and extract fb_uid from it. 
> send notes to razorpay along with payment_Type


Notes : { fb_uid && plan_type} 





*/


// app/api/create-order/route.js

// app/api/create-order/route.js
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_LIVE_KEY_ID,
    key_secret: process.env.RAZORPAY_LIVE_KEY_SECRET,
});

// Plans with prices in paise (multiply by 100)
const PLANS = {
    josaa: {
        label: "JOSAA Only",
        price: 11900, // ₹119 in paise
    },
    csab: {
        label: "CSAB Only",
        price: 9900, // ₹99 in paise
    },
    josaa_and_csab: {
        label: "JOSAA and CSAB",
        price: 14900, // ₹149 in paise
    },
};

export async function POST(req) {
    try {
        const body = await req.json();
        const { plan } = body;

        // 1. Validate plan
        if (!plan || !PLANS[plan]) {
            return NextResponse.json(
                { error: "Invalid plan. Must be one of: josaa, csab, josaa_and_csab" },
                { status: 400 }
            );
        }

        const selectedPlan = PLANS[plan];

        // 2. Get and validate Authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Unauthorized - No token provided" },
                { status: 401 }
            );
        }

        const token = authHeader.split("Bearer ")[1];

        // 3. Verify Firebase JWT using Admin SDK
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (error) {
            console.error("JWT verification error:", error);
            return NextResponse.json(
                { error: "Unauthorized - Invalid token" },
                { status: 401 }
            );
        }

        // 4. Create Razorpay order
        const order = await razorpay.orders.create({
            amount: selectedPlan.price,
            currency: "INR",
            receipt: "receipt_" + Date.now(),
            notes: {
                fb_uid: decodedToken.uid,
                email: decodedToken.email,
                plan_label: selectedPlan.label,
            },
        });

        // 5. Return order details to client
        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            // key: process.env.RAZORPAY_KEY_ID,
            key: process.env.RAZORPAY_LIVE_KEY_ID,
            plan,
            planLabel: selectedPlan.label,
        });

    } catch (err) {
        console.error("RAZORPAY ERROR:", err);

        if (err.error?.description) {
            return NextResponse.json(
                { error: `Payment error: ${err.error.description}` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Order creation failed" },
            { status: 500 }
        );
    }
}