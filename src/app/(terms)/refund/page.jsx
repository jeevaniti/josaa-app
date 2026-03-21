// app/refund/page.jsx

import Link from "next/link";

export const metadata = {
    title: "Cancellation & Refund Policy – JOSAA Master",
};

export default function RefundPage() {
    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <Link href="/dashboard" style={styles.back}>← Back to Home</Link>

                <h1 style={styles.title}>Cancellation &amp; Refund Policy</h1>
                <p style={styles.effective}>Effective Date: January 1, 2025</p>
                <p style={styles.intro}>
                    Please read this policy carefully before making any purchase on <strong>JOSAA Master</strong>.
                    By completing a payment, you acknowledge that you have read and agreed to this policy.
                </p>

                <Section number="1" title="No Refund Policy">
                    <p>
                        All payments made on JOSAA Master are <strong>final and non-refundable</strong>. Once a
                        purchase is completed, no cancellations or refunds will be issued under any circumstances,
                        including but not limited to:
                    </p>
                    <ul style={styles.list}>
                        <li>Duplicate payments (contact us immediately — see Section 5)</li>
                        <li>Failure to use the purchased features within the validity period</li>
                    </ul>
                </Section>

                <Section number="2" title="Nature of Service">
                    <p>
                        Our services are <strong>100% digital</strong> and are delivered instantly upon successful
                        payment. Since access is granted immediately and the service is consumed digitally, it is
                        classified as non-returnable under applicable digital goods policies.
                    </p>
                </Section>

                <Section number="3" title="Subscription Cancellation">
                    <p>
                        If you have subscribed to a recurring plan, you may cancel your subscription at any time
                        from your account dashboard. However:
                    </p>
                    <ul style={styles.list}>
                        <li>No refund will be issued for the current billing period</li>
                        <li>Access will continue until the end of the paid period</li>
                        <li>No partial refunds for unused days</li>
                    </ul>
                </Section>

                <Section number="4" title="Exceptions">
                    <p>
                        No exceptions will be made to this refund policy <strong>unless explicitly required by
                            applicable law</strong> in India. If you believe you are entitled to a refund under
                        applicable consumer protection laws, please contact us with full details.
                    </p>
                </Section>

                <Section number="5" title="Duplicate or Failed Payments">
                    <p>
                        In the rare case of a duplicate charge or payment deducted but access not granted, please
                        contact us within <strong>48 hours</strong> of the transaction with your payment receipt.
                        We will investigate and resolve the issue promptly.
                    </p>
                </Section>

                <Section number="6" title="Payment Processor">
                    <p>
                        All transactions are processed securely via <strong>Razorpay</strong>. We do not store your
                        card or bank details. For payment-related disputes handled at the gateway level, Razorpay's
                        own policies may apply.
                    </p>
                </Section>

                <Section number="7" title="Contact">
                    <p>
                        For payment issues, reach out to us at:{" "}
                        <a href="mailto:support@josaaMaster.in" style={styles.link}>support@josaamaster.in</a>
                        {" "}or visit our <Link href="/contact" style={styles.link}>Contact Page</Link>.
                        Please include your Order ID and payment screenshot for faster resolution.
                    </p>
                </Section>
            </div>
        </div>
    );
}

function Section({ number, title, children }) {
    return (
        <div style={styles.section}>
            <h2 style={styles.sectionTitle}>{number}. {title}</h2>
            <div style={styles.sectionBody}>{children}</div>
        </div>
    );
}

const styles = {
    wrapper: { background: "#0f1117", minHeight: "100vh", padding: "60px 24px", color: "#e5e7eb", fontFamily: "'Segoe UI', system-ui, sans-serif" },
    container: { maxWidth: "780px", margin: "0 auto" },
    back: { color: "#60a5fa", textDecoration: "none", fontSize: "14px", display: "inline-block", marginBottom: "32px" },
    title: { fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, color: "#f9fafb", marginBottom: "8px" },
    effective: { color: "#6b7280", fontSize: "14px", marginBottom: "24px" },
    intro: { color: "#9ca3af", lineHeight: 1.7, marginBottom: "40px", fontSize: "15px" },
    section: { marginBottom: "36px", borderLeft: "3px solid #dc2626", paddingLeft: "20px" },
    sectionTitle: { fontSize: "18px", fontWeight: 700, color: "#f3f4f6", marginBottom: "10px" },
    sectionBody: { color: "#9ca3af", lineHeight: 1.75, fontSize: "15px" },
    list: { paddingLeft: "20px", marginTop: "8px", lineHeight: 2 },
    link: { color: "#60a5fa", textDecoration: "underline" },
};