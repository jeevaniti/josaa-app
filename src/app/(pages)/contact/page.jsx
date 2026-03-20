"use client";

import { useState } from "react";

const FAQ_ITEMS = [
    {
        q: "How is the chance prediction calculated?",
        a: "Chance predictions are based on historical JOSAA closing rank data across all rounds (R1–R6). We compare your rank with past year closing ranks for your category and flag colleges as High, Moderate, or Low chance accordingly.",
    },
    {
        q: "What is the difference between JOSAA and CSAB?",
        a: "JOSAA (Joint Seat Allocation Authority) handles admissions to IITs, NITs, IIITs, and other GFTIs. CSAB (Central Seat Allocation Board) conducts special rounds after JOSAA to fill remaining seats in NITs, IIITs, and GFTIs.",
    },
    {
        q: "Why do I need to set ranks separately for JOSAA and CSAB?",
        a: "JOSAA and CSAB use separate seat matrices and cut-offs. Setting ranks separately allows you to get accurate results for both counselling processes.",
    },
    {
        q: "Can I change my saved rank after setting it?",
        a: "Yes. Go to Set Rank, clear your existing rank using the Clear button, then enter the updated value. You can do this as many times as needed.",
    },
    {
        q: "What does Gender-Neutral vs Female-only mean?",
        a: "These are seat pool categories defined by JOSAA. Female-only (including Supernumerary) seats are reserved for female candidates. Selecting the correct pool ensures you see accurate closing rank data for your eligibility.",
    },
    {
        q: "Is the data updated for the current year?",
        a: "We update our dataset after each JOSAA round concludes. Please check the Find Colleges page for the latest data update notice.",
    },
];

const styles = `
  .hs-root {
    padding: 32px 28px;
    max-width: 820px;
    margin: 0 auto;
  }

  .hs-eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: 6px;
  }

  .hs-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 800;
    color: var(--color-text-primary);
    line-height: 1.2;
    margin-bottom: 6px;
  }

  .hs-subtitle {
    font-size: 14px;
    color: var(--color-text-secondary);
    font-weight: 500;
    line-height: 1.6;
    margin-bottom: 32px;
  }

  /* Contact cards */
  .hs-contact-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 36px;
  }

  .hs-contact-card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 18px;
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hs-contact-icon {
    width: 34px; height: 34px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-bg-blue   { background: #dbeafe; color: #2563eb; }
  .icon-bg-green  { background: #dcfce7; color: #16a34a; }
  .icon-bg-purple { background: #f3e8ff; color: #7c3aed; }

  .hs-contact-type {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    margin-bottom: 2px;
  }

  .hs-contact-value {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .hs-contact-sub {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  /* Section heading */
  .hs-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-border);
  }

  /* FAQ accordion */
  .hs-faq-list {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--color-card);
    box-shadow: var(--shadow-card);
    margin-bottom: 36px;
  }

  .hs-faq-item {
    border-bottom: 1px solid #f1f5f9;
  }

  .hs-faq-item:last-child { border-bottom: none; }

  .hs-faq-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: background 0.1s ease;
  }

  .hs-faq-trigger:hover { background: #f8fafc; }

  .hs-faq-q {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    line-height: 1.4;
    padding-right: 12px;
  }

  .hs-faq-chevron {
    flex-shrink: 0;
    color: var(--color-text-muted);
    transition: transform 0.2s ease;
  }

  .hs-faq-chevron.open { transform: rotate(180deg); }

  .hs-faq-body {
    padding: 0 20px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    line-height: 1.7;
    animation: faqOpen 0.18s ease-out both;
  }

  @keyframes faqOpen {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Contact form */
  .hs-form-card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 22px;
    box-shadow: var(--shadow-card);
    margin-bottom: 20px;
  }

  .hs-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .hs-field { display: flex; flex-direction: column; gap: 6px; }
  .hs-field.full { grid-column: span 2; }

  .hs-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
  }

  .hs-input,
  .hs-textarea {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 10px 13px;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
    background: #f8fafc;
    transition: border-color 0.15s ease, background 0.15s ease;
    font-family: inherit;
  }

  .hs-input { height: 40px; }

  .hs-textarea {
    resize: vertical;
    min-height: 96px;
    line-height: 1.6;
  }

  .hs-input:focus,
  .hs-textarea:focus {
    outline: none;
    border-color: var(--color-blue);
    background: white;
  }

  .hs-form-footer {
    display: flex;
    justify-content: flex-end;
  }

  .hs-btn-submit {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--color-blue);
    color: white;
    font-size: 13px;
    font-weight: 700;
    padding: 10px 22px;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;
    box-shadow: 0 4px 12px rgba(37,99,235,0.18);
    font-family: inherit;
  }

  .hs-btn-submit:hover {
    background: var(--color-blue-dark);
    transform: translateY(-1px);
  }

  .hs-btn-submit:active { transform: scale(0.97); }

  .hs-btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .hs-toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    color: #15803d;
    margin-top: 14px;
    animation: toastIn 0.22s ease-out both;
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .hs-root { padding: 20px 16px; }

    .hs-contact-grid { grid-template-columns: 1fr; }

    .hs-form-grid { grid-template-columns: 1fr; }
    .hs-field.full { grid-column: span 1; }

    .hs-form-footer { justify-content: stretch; }
    .hs-btn-submit  { width: 100%; justify-content: center; }
  }
`;

export default function HelpSupportPage() {
    const [openFaq, setOpenFaq] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit() {
        if (!name || !email || !message) return;
        setSubmitted(true);
        setName(""); setEmail(""); setMessage("");
        setTimeout(() => setSubmitted(false), 4000);
    }

    return (
        <>
            <style>{styles}</style>
            <div className="hs-root">

                <p className="hs-eyebrow">Support</p>
                <h1 className="hs-title">Help and Support</h1>
                <p className="hs-subtitle">Find answers to common questions or reach out directly. We are here to help you navigate your counselling journey.</p>

                {/* Contact options */}
                <div className="hs-contact-grid">
                    <div className="hs-contact-card">
                        <div className="hs-contact-icon icon-bg-blue">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="hs-contact-type">Email</p>
                            <p className="hs-contact-value">support@josaamaster.in</p>
                            <p className="hs-contact-sub">Reply within 24 hours</p>
                        </div>
                    </div>

                    <div className="hs-contact-card">
                        <div className="hs-contact-icon icon-bg-green">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <p className="hs-contact-type">Live Chat</p>
                            <p className="hs-contact-value">Chat with us</p>
                            <p className="hs-contact-sub">Mon – Sat, 10am – 6pm IST</p>
                        </div>
                    </div>

                    <div className="hs-contact-card">
                        <div className="hs-contact-icon icon-bg-purple">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M13 4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-6-5z" />
                            </svg>
                        </div>
                        <div>
                            <p className="hs-contact-type">Documentation</p>
                            <p className="hs-contact-value">Read the Docs</p>
                            <p className="hs-contact-sub">Guides and tutorials</p>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <p className="hs-section-title">Frequently Asked Questions</p>
                <div className="hs-faq-list">
                    {FAQ_ITEMS.map((item, i) => (
                        <div key={i} className="hs-faq-item">
                            <button className="hs-faq-trigger" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                <span className="hs-faq-q">{item.q}</span>
                                <span className={`hs-faq-chevron${openFaq === i ? " open" : ""}`}>
                                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>
                            {openFaq === i && <div className="hs-faq-body">{item.a}</div>}
                        </div>
                    ))}
                </div>

                {/* Contact form */}
                <p className="hs-section-title">Send Us a Message</p>
                <div className="hs-form-card">
                    <div className="hs-form-grid">
                        <div className="hs-field">
                            <label className="hs-label">Your Name</label>
                            <input className="hs-input" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="hs-field">
                            <label className="hs-label">Email Address</label>
                            <input className="hs-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="hs-field full">
                            <label className="hs-label">Message</label>
                            <textarea className="hs-textarea" placeholder="Describe your issue or question..." value={message} onChange={e => setMessage(e.target.value)} />
                        </div>
                    </div>

                    <div className="hs-form-footer">
                        <button className="hs-btn-submit" onClick={handleSubmit} disabled={!name || !email || !message}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                            </svg>
                            Send Message
                        </button>
                    </div>

                    {submitted && (
                        <div className="hs-toast">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Message sent. We will get back to you shortly.
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}