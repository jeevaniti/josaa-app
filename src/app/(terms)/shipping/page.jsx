// app/shipping/page.jsx

import Link from "next/link";

export const metadata = {
    title: "Shipping & Exchange Policy – JOSAA Master",
};

export default function ShippingPage() {
    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <Link href="/dashboard" style={styles.back}>← Back to Home</Link>

                <h1 style={styles.title}>Shipping &amp; Exchange Policy</h1>
                <p style={styles.effective}>Effective Date: January 1, 2025</p>
                <p style={styles.intro}>
                    <strong>JOSAA Master</strong> is a fully digital platform. We do not deal in any physical
                    products or merchandise. This policy outlines how our digital services are delivered.
                </p>

                <Section number="1" title="No Physical Shipping">
                    <p>
                        We do <strong>not ship any physical products</strong>. There are no books, DVDs, printed
                        materials, or merchandise sold on this platform. All services and features offered by JOSAA
                        Master are delivered entirely through our website.
                    </p>
                </Section>

                <Section number="2" title="Instant Digital Access">
                    <p>
                        Upon successful payment, users receive <strong>immediate access</strong> to the purchased
                        features or plans. Access is granted automatically — no download, installation, or shipping
                        wait time is required.
                    </p>
                    <p style={{ marginTop: "10px" }}>
                        If your access is not granted within <strong>5 minutes</strong> of payment, please check:
                    </p>
                    <ul style={styles.list}>
                        <li>Whether you are logged into the correct account</li>
                        <li>Whether the payment was successfully processed (check your bank/UPI app)</li>
                        <li>Refresh the page or log out and log back in</li>
                    </ul>
                </Section>

                <Section number="3" title="No Exchange Policy">
                    <p>
                        Since our services are digital and access is granted instantly, we <strong>do not offer
                            exchanges or replacements</strong> for any purchased plan or feature. You cannot exchange
                        one plan for another after purchase.
                    </p>
                </Section>

                <Section number="4" title="Service Validity">
                    <p>
                        Purchased plans are valid for the duration specified at the time of purchase (e.g., 30 days,
                        1 counselling season, etc.). Unused time cannot be carried forward, transferred, or refunded.
                    </p>
                </Section>

                <Section number="5" title="Technical Access Issues">
                    <p>
                        If you face any technical issues accessing your purchased features — such as login errors,
                        missing features, or broken functionality — please contact us immediately at:{" "}
                        <a href="mailto:support@josaaMaster.in" style={styles.link}>support@josaaMaster.in</a>
                    </p>
                    <p style={{ marginTop: "10px" }}>
                        Include your registered email, Order ID, and a description of the issue. We aim to resolve
                        all technical access issues within <strong>24 hours</strong>.
                    </p>
                </Section>

                <Section number="6" title="Contact">
                    <p>
                        For any questions related to access or delivery of services, visit our{" "}
                        <Link href="/contact" style={styles.link}>Contact Page</Link>{" "}
                        or email us at{" "}
                        <a href="mailto:support@josaaMaster.in" style={styles.link}>support@josaamaster.in</a>.
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
    section: { marginBottom: "36px", borderLeft: "3px solid #059669", paddingLeft: "20px" },
    sectionTitle: { fontSize: "18px", fontWeight: 700, color: "#f3f4f6", marginBottom: "10px" },
    sectionBody: { color: "#9ca3af", lineHeight: 1.75, fontSize: "15px" },
    list: { paddingLeft: "20px", marginTop: "8px", lineHeight: 2 },
    link: { color: "#60a5fa", textDecoration: "underline" },
};