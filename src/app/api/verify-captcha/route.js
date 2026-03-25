// src/app/api/verify-captcha/route.js

import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, error: "No CAPTCHA token provided." },
                { status: 400 }
            );
        }

        // Verify the token with Google's reCAPTCHA API
        const verifyRes = await fetch(
            "https://www.google.com/recaptcha/api/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: token,
                }),
            }
        );

        const data = await verifyRes.json();

        if (data.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, errors: data["error-codes"] },
                { status: 400 }
            );
        }
    } catch (err) {
        console.error("verify-captcha error:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}