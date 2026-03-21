"use client";
// components/Footer.jsx

import Link from "next/link";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer style={{
            background: "#0f1117",
            borderTop: "1px solid #1e2235",
            padding: "32px 24px 24px",
            marginTop: "auto",
        }}>
            <div style={{
                maxWidth: "1100px",
                margin: "0 auto",
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                {/* Brand */}
                <div style={{ color: "#6b7280", fontSize: "14px" }}>
                    © {year} <strong style={{ color: "#e5e7eb" }}>JOSAA Master</strong>. All rights reserved.
                </div>

                {/* Legal Links */}
                <nav style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                    {[
                        { label: "Terms & Conditions", href: "/terms" },
                        { label: "Privacy Policy", href: "/privacy" },
                        { label: "Refund Policy", href: "/refund" },
                        { label: "Shipping Policy", href: "/shipping" },
                        { label: "Contact Us", href: "/contact" },
                    ].map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            style={{
                                color: "#9ca3af",
                                fontSize: "13px",
                                textDecoration: "none",
                                transition: "color 0.2s",
                            }}
                            onMouseEnter={e => e.target.style.color = "#60a5fa"}
                            onMouseLeave={e => e.target.style.color = "#9ca3af"}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}