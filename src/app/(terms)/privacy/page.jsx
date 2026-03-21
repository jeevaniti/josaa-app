// app/privacy/page.jsx

import Link from "next/link";

export const metadata = {
    title: "Privacy Policy – JOSAA Master",
};

export default function PrivacyPage() {
    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <Link href="/dashboard" style={styles.back}>← Back to Home</Link>

                <h1 style={styles.title}>Privacy Policy</h1>
                <p style={styles.effective}>Effective Date: January 1, 2025</p>
                <p style={styles.intro}>
                    At <strong>JOSAA Master</strong>, we respect your privacy and are committed to protecting your
                    personal data. This Privacy Policy explains how we collect, use, and safeguard information
                    when you use our website.
                </p>

                <Section number="1" title="Information We Collect">
                    <p>We may collect the following information when you use our platform:</p>
                    <ul style={styles.list}>
                        <li>Rank, category, gender, and preferences entered into the predictor tool</li>
                        <li>Email address (if you register or subscribe)</li>
                        <li>Basic usage and analytics data (pages visited, session duration)</li>
                        <li>Payment-related data processed securely by Razorpay (we do not store card details)</li>
                    </ul>
                    <p style={{ marginTop: "12px" }}>
                        We do <strong>NOT</strong> required or collect sensitive personal data such as Aadhaar, financial
                        records, or medical information.
                    </p>
                </Section>

                <Section number="2" title="How We Use Your Information">
                    <p>We use collected data to:</p>
                    <ul style={styles.list}>
                        <li>Generate college predictions based on your inputs</li>
                        <li>Improve our algorithms and user experience</li>
                        <li>Send important updates or notifications (if you opt in)</li>
                        <li>Process payments and manage subscriptions</li>
                    </ul>
                </Section>

                <Section number="3" title="Data Sharing">
                    <p>
                        We <strong>do not sell, trade, or rent</strong> your personal data to third parties.
                        We may share limited data only with:
                    </p>
                    <ul style={styles.list}>
                        <li>Payment processors (Razorpay) for transaction handling</li>
                        <li>Analytics providers to understand platform usage</li>
                    </ul>
                </Section>

                <Section number="4" title="Cookies">
                    <p>We use cookies for:</p>
                    <ul style={styles.list}>
                        <li>Session management and authentication</li>
                        <li>Analytics and performance tracking</li>
                        <li>Remembering your preferences</li>
                    </ul>
                    <p style={{ marginTop: "12px" }}>
                        You can disable cookies in your browser settings, though this may affect some
                        features of the platform.
                    </p>
                </Section>

                <Section number="5" title="Data Security">
                    <p>
                        We implement industry-standard security measures including encryption and secure servers
                        to protect your data. However, no system is 100% secure, and we cannot guarantee
                        absolute security of your information.
                    </p>
                </Section>

                <Section number="6" title="Third-Party Services">
                    <p>We may use third-party services such as:</p>
                    <ul style={styles.list}>
                        <li>Firebase / AWS for hosting and backend infrastructure</li>
                        <li>Razorpay for payment processing</li>
                        <li>Google Analytics or similar tools for usage analytics</li>
                    </ul>
                    <p style={{ marginTop: "12px" }}>
                        These services may collect limited data as per their own privacy policies. We encourage
                        you to review their policies separately.
                    </p>
                </Section>

                <Section number="7" title="Children's Privacy">
                    <p>
                        Our platform is designed for students, including those under 18 years of age. We do not knowingly collect personal information from minors without appropriate consent from a parent or guardian. If you believe that a student has shared personal data without such consent, please contact us, and we will take appropriate action.

                    </p>
                </Section>

                <Section number="8" title="Your Rights">
                    <p>You have the right to:</p>
                    <ul style={styles.list}>
                        <li>Access the personal data we hold about you</li>
                        <li>Request deletion of your data</li>
                        <li>Opt out of marketing communications at any time</li>
                    </ul>
                </Section>

                <Section number="9" title="Changes to This Policy">
                    <p>
                        We may update this Privacy Policy at any time. Changes will be posted on this page
                        with an updated effective date. Continued use of our platform constitutes acceptance
                        of the revised policy.
                    </p>
                </Section>

                <Section number="10" title="Contact">
                    <p>
                        For privacy concerns or data requests, contact us at:{" "}
                        <a href="mailto:support@josaaMaster.in" style={styles.link}>support@josaamaster.in</a>
                        {" "}or visit our <Link href="/contact" style={styles.link}>Contact Page</Link>.
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
    wrapper: {
        background: "#0f1117",
        minHeight: "100vh",
        padding: "60px 24px",
        color: "#e5e7eb",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
    },
    container: { maxWidth: "780px", margin: "0 auto" },
    back: { color: "#60a5fa", textDecoration: "none", fontSize: "14px", display: "inline-block", marginBottom: "32px" },
    title: { fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, color: "#f9fafb", marginBottom: "8px" },
    effective: { color: "#6b7280", fontSize: "14px", marginBottom: "24px" },
    intro: { color: "#9ca3af", lineHeight: 1.7, marginBottom: "40px", fontSize: "15px" },
    section: { marginBottom: "36px", borderLeft: "3px solid #7c3aed", paddingLeft: "20px" },
    sectionTitle: { fontSize: "18px", fontWeight: 700, color: "#f3f4f6", marginBottom: "10px" },
    sectionBody: { color: "#9ca3af", lineHeight: 1.75, fontSize: "15px" },
    list: { paddingLeft: "20px", marginTop: "8px", lineHeight: 2 },
    link: { color: "#60a5fa", textDecoration: "underline" },
};