"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

// Plan IDs match exactly what api/create-order expects:
// "josaa"          → JOSAA Only      ₹119
// "csab"           → CSAB Only       ₹99
// "josaa_and_csab" → JOSAA and CSAB  ₹149

const styles = `
  .pay-root {
    padding: 0;
    min-height: 100vh;
    background: var(--color-bg);
  }

  .pay-hero {
    padding: 14px 80px 8px;
    max-width: 860px;
    margin: 0 auto;
  }

  .pay-hero-headline {
    font-family: Georgia, serif;
    font-size: clamp(28px, 4.5vw, 48px);
    font-weight: 800;
    color: var(--color-text-primary);
    line-height: 1.18;
    margin-bottom: 14px;
    letter-spacing: -0.01em;
  }

  .pay-hero-headline .accent {
    color: var(--color-blue);
    font-style: italic;
    position: relative;
    display: inline-block;
  }

  .pay-hero-headline .accent::after {
    content: '';
    position: absolute;
    bottom: 3px;
    left: 0; right: 0;
    height: 3px;
    background: #bfdbfe;
    border-radius: 2px;
  }

  .pay-hero-alert {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    background: #0F172A;
    border-radius: var(--radius-md);
    padding: 18px 22px;
    margin-bottom: 0;
    position: relative;
    overflow: hidden;
  }

  .pay-hero-alert::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px;
    height: 100%;
    background: #f59e0b;
  }

  .pay-hero-alert-icon {
    width: 34px;
    height: 34px;
    background: rgba(245,158,11,0.15);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #f59e0b;
    margin-top: 1px;
  }

  .pay-hero-alert-text {
    font-size: 14px;
    font-weight: 500;
    color: #94a3b8;
    line-height: 1.6;
  }

  .pay-hero-alert-text strong {
    font-size: 15px;
    font-weight: 800;
    color: #fbbf24;
    display: block;
    margin-bottom: 3px;
  }

  .pay-divider {
    max-width: 860px;
    margin: 36px auto 0;
    padding: 0 28px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .pay-divider-line {
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }

  .pay-divider-text {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .pay-cards-section {
    max-width: 960px;
    margin: 24px auto 0;
    padding: 0 28px 56px;
  }

  .pay-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    align-items: stretch;
  }

  .pay-card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 26px 22px 22px;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-card);
    position: relative;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    overflow: hidden;
    animation: cardIn 0.4s ease-out both;
  }

  .pay-card:nth-child(1) { animation-delay: 0.05s; }
  .pay-card:nth-child(2) { animation-delay: 0.12s; }
  .pay-card:nth-child(3) { animation-delay: 0.19s; }

  .pay-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.09);
  }

  .pay-card.featured {
    border-color: var(--color-blue);
    box-shadow: 0 0 0 1px var(--color-blue), 0 8px 28px rgba(37,99,235,0.12);
    transform: translateY(-6px);
    background: white;
    animation: featuredIn 0.4s ease-out 0.12s both;
  }

  .pay-card.featured:hover {
    transform: translateY(-10px);
    box-shadow: 0 0 0 1px var(--color-blue), 0 16px 40px rgba(37,99,235,0.18);
  }

  .pay-card.featured::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #2563EB, #60a5fa);
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes featuredIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(-6px); }
  }

  .pay-featured-badges {
    display: flex;
    gap: 6px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .pay-badge-recommended {
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    background: var(--color-blue);
    color: white;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .pay-badge-affordable {
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    background: #dcfce7;
    color: #15803d;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .pay-card-name {
    font-size: 22px;
    font-weight: 800;
    color: var(--color-text-primary);
    margin-bottom: 6px;
    line-height: 1.2;
  }

  .pay-price-strike {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-decoration: line-through;
    margin-bottom: 4px;
  }

  .pay-pricing {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    margin-bottom: 6px;
  }

  .pay-price-current {
    font-size: 34px;
    font-weight: 800;
    color: var(--color-text-primary);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .pay-card.featured .pay-price-current {
    font-size: 38px;
    color: var(--color-blue);
  }

  .pay-price-currency {
    font-size: 18px;
    font-weight: 700;
    vertical-align: super;
    line-height: 1.6;
  }

  .pay-card-divider {
    height: 1px;
    background: var(--color-border);
    margin: 16px 0;
  }

  .pay-features {
    display: flex;
    flex-direction: column;
    gap: 9px;
    flex: 1;
    margin-bottom: 22px;
  }

  .pay-feature-item {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  .pay-feature-check {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #dcfce7;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
    color: #15803d;
  }

  .pay-card.featured .pay-feature-check {
    background: #dbeafe;
    color: var(--color-blue);
  }

  .pay-cta-btn {
    width: 100%;
    padding: 12px 0;
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
    letter-spacing: 0.01em;
  }

  .pay-cta-btn.default {
    background: #c9caca;
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
  }

  .pay-cta-btn.default:hover { background: #e2e8f0; }

  .pay-cta-btn.primary {
    background: #252525;
    color: white;
    box-shadow: 0 4px 14px rgba(137,138,139,0.28);
  }

  .pay-cta-btn.primary:hover {
    background: #202020;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(37,99,235,0.35);
  }

  .pay-cta-btn.primary:active { transform: scale(0.98); }

  .pay-cta-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  .pay-card-validity {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
    justify-content: center;
  }

  .pay-card-validity span {
    font-weight: 700;
    color: #16582e;
  }

  .pay-trust-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--color-border);
  }

  .pay-trust-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .pay-trust-item svg { flex-shrink: 0; }

  .pay-error-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: #f87171;
    font-size: 13px;
    font-weight: 600;
    padding: 12px 22px;
    border-radius: var(--radius-md);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 9999;
    white-space: nowrap;
    animation: toastIn 0.22s ease-out both;
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ── Confirmation Dialog ── */
  .pay-dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: backdropIn 0.2s ease-out both;
  }

  @keyframes backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .pay-dialog {
    background: #ffffff;
    border-radius: 16px;
    padding: 0;
    max-width: 440px;
    width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,0.18);
    animation: dialogIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    overflow: hidden;
  }

  @keyframes dialogIn {
    from { opacity: 0; transform: scale(0.92) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .pay-dialog-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 20px 24px 18px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .pay-dialog-header-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pay-dialog-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #94a3b8;
    margin-bottom: 2px;
  }

  .pay-dialog-plan-name {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.01em;
  }

  .pay-dialog-plan-price {
    font-size: 14px;
    font-weight: 600;
    color: #2563eb;
    margin-top: 2px;
  }

  .pay-dialog-close {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748b;
    flex-shrink: 0;
    transition: background 0.15s ease;
    font-family: inherit;
  }

  .pay-dialog-close:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .pay-dialog-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Order summary row */
  .pay-dialog-summary {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .pay-dialog-summary-label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  .pay-dialog-summary-amount {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
  }

  .pay-dialog-summary-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: #dcfce7;
    color: #15803d;
    padding: 2px 8px;
    border-radius: 999px;
    margin-top: 3px;
  }

  /* Terms consent box */
  .pay-dialog-consent {
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px;
    transition: border-color 0.15s ease;
  }

  .pay-dialog-consent.is-checked {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .pay-dialog-consent-inner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
  }

  .pay-dialog-checkbox-wrap {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    border: 2px solid #cbd5e1;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
    transition: all 0.15s ease;
  }

  .pay-dialog-consent.is-checked .pay-dialog-checkbox-wrap {
    background: #2563eb;
    border-color: #2563eb;
  }

  .pay-dialog-consent-text {
    font-size: 13px;
    font-weight: 500;
    color: #475569;
    line-height: 1.6;
    user-select: none;
  }

  .pay-dialog-consent-text a {
    color: #2563eb;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .pay-dialog-consent-text a:hover {
    color: #1d4ed8;
  }

  .pay-dialog-consent-warning {
    font-size: 11px;
    font-weight: 600;
    color: #ef4444;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #fecaca;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Final pay button */
  .pay-dialog-pay-btn {
    width: 100%;
    padding: 14px;
    border-radius: var(--radius-sm);
    font-size: 15px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.01em;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .pay-dialog-pay-btn.enabled {
    background: #2563eb;
    color: white;
    box-shadow: 0 4px 16px rgba(37,99,235,0.32);
  }

  .pay-dialog-pay-btn.enabled:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37,99,235,0.4);
  }

  .pay-dialog-pay-btn.enabled:active { transform: scale(0.98); }

  .pay-dialog-pay-btn.disabled {
    background: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
  }

  .pay-dialog-footer-note {
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-top: -8px;
  }

  @media (max-width: 768px) {
    .pay-hero { padding: 28px 16px 32px; }
    .pay-divider { padding: 0 16px; }
    .pay-cards-section { padding: 0 16px 40px; }

    .pay-cards-grid {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .pay-card.featured {
      order: -1;
      transform: translateY(0);
      animation: cardIn 0.4s ease-out 0.12s both;
    }

    .pay-card.featured:hover { transform: translateY(-3px); }

    .pay-dialog {
      max-width: 100%;
    }
  }

  @media (max-width: 420px) {
    .pay-hero-headline { font-size: 26px; }
  }
`;

const PLANS = [
  {
    id: "josaa",
    name: "JOSAA Only",
    priceStrike: "299",
    priceCurrent: "119",
    featured: false,
    features: [
      "All 6 counselling rounds",
      "Round-wise chance analysis",
      "Opening & closing rank data",
      "Branch-level filtering",
      // "Non-refundable",
    ],
  },
  {
    id: "josaa_and_csab",
    name: "JOSAA and CSAB",
    priceStrike: "599",
    priceCurrent: "149",
    featured: true,
    features: [
      "Everything of JOSAA Only Plan",
      "CSAB special round",
      "Best value",
      // "Non-refundable",
    ],
  },
  {
    id: "csab",
    name: "CSAB Only",
    priceStrike: "199",
    priceCurrent: "99",
    featured: false,
    features: [
      "CSAB special round predictor",
      "NIT, IIIT & GFTI coverage",
      "Category-wise filtering",
      "Home state quota analysis",
      // "Non-refundable",
    ],
  },
];

function CheckIcon() {
  return (
    <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CheckIconWhite() {
  return (
    <svg width="11" height="11" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ── Confirmation Dialog ──────────────────────────────────────────
function ConfirmDialog({ plan, onClose, onConfirm, loading }) {
  const [agreed, setAgreed] = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="pay-dialog-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="pay-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">

        {/* Header */}
        <div className="pay-dialog-header">
          <div className="pay-dialog-header-left">
            <p className="pay-dialog-label">Confirm Purchase</p>
            <p className="pay-dialog-plan-name" id="dialog-title">{plan.name}</p>
            <p className="pay-dialog-plan-price">Rs.{plan.priceCurrent}/- &nbsp;·&nbsp; One-time</p>
          </div>
          <button className="pay-dialog-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="pay-dialog-body">

          {/* Order summary */}
          <div className="pay-dialog-summary">
            <div>
              <p className="pay-dialog-summary-label">You are purchasing</p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>{plan.name} Plan</p>
              <span className="pay-dialog-summary-badge">Valid till November 2026</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "11px", color: "#94a3b8", textDecoration: "line-through", marginBottom: "2px" }}>Rs.{plan.priceStrike}/-</p>
              <p className="pay-dialog-summary-amount">Rs.{plan.priceCurrent}/-</p>
            </div>
          </div>

          {/* Consent checkbox */}
          <div className={`pay-dialog-consent${agreed ? " is-checked" : ""}`}>
            <label className="pay-dialog-consent-inner">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(v => !v)}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
              />
              <div className="pay-dialog-checkbox-wrap">
                {agreed && <CheckIconWhite />}
              </div>
              <span className="pay-dialog-consent-text">
                I have read and agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
                {" "}and the{" "}
                <a href="/refund" target="_blank" rel="noopener noreferrer">Cancellation &amp; Refund Policy</a>.
                {/* I understand this purchase is <strong>non-refundable</strong> once access is granted. */}
              </span>
            </label>

            {/* Refund warning — always visible */}
            {/* <p className="pay-dialog-consent-warning">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              No Refund Policy
            </p> */}
          </div>

          {/* Pay button */}
          <button
            className={`pay-dialog-pay-btn${agreed ? " enabled" : " disabled"}`}
            onClick={() => agreed && onConfirm()}
            disabled={!agreed || loading}
          >
            {loading ? (
              <>
                <svg style={{ animation: "spin 0.8s linear infinite" }} width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                  <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <path strokeLinecap="round" d="M1 10h22" />
                </svg>
                Pay Rs.{plan.priceCurrent}/- Securely
              </>
            )}
          </button>

          {/* Razorpay note */}
          <p className="pay-dialog-footer-note">
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secured by Razorpay &nbsp;·&nbsp; 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function PaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [dialogPlan, setDialogPlan] = useState(null); // plan object or null

  // Load Razorpay script once on mount
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function showError(msg) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  }

  // Step 1: user clicks plan CTA → open dialog
  function handlePlanClick(plan) {
    setDialogPlan(plan);
  }

  // Step 2: user ticks consent in dialog and hits Pay
  async function handleConfirmedPay() {
    if (!dialogPlan) return;
    const planId = dialogPlan.id;

    try {
      const user = auth.currentUser;
      if (!user) {
        showError("Please log in to continue.");
        return;
      }

      setLoading(true);

      const idToken = await user.getIdToken(true);

      const res = await fetch("/api/create_order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create order");
      }

      const data = await res.json();

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "JOSAA Master",
        description: data.planLabel,
        handler: function () {
          setDialogPlan(null);
          router.push("/set-user-rank");
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        prefill: {
          name: user.displayName || "Student",
          email: user.email || "",
          contact: user.phoneNumber || "",
        },
        theme: {
          color: "#2563EB",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        showError("Payment failed. Please try again.");
        setLoading(false);
        console.error("Razorpay payment.failed:", response.error);
      });

      rzp.open();

    } catch (err) {
      console.error("handleConfirmedPay error:", err);
      showError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="pay-root">

        <div className="pay-hero">
          <h1 className="pay-hero-headline">
            Your rank is valuable.<br />
            <span className="accent">Don't waste it.</span>
          </h1>

          <div className="pay-hero-alert">
            <div className="pay-hero-alert-icon">
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="pay-hero-alert-text">
              <strong>Stop spending ₹4,000 to ₹10,000 on counseling</strong>
              when real data can provide you immediate guidance
            </div>
          </div>
        </div>

        <div className="pay-divider">
          <div className="pay-divider-line" />
          <span className="pay-divider-text">Choose your plan</span>
          <div className="pay-divider-line" />
        </div>

        <div className="pay-cards-section">
          <div className="pay-cards-grid">
            {PLANS.map(plan => (
              <div key={plan.id} className={`pay-card${plan.featured ? " featured" : ""}`}>

                {plan.featured && (
                  <div className="pay-featured-badges">
                    <span className="pay-badge-recommended">Recommended</span>
                    <span className="pay-badge-affordable">Affordable</span>
                  </div>
                )}

                <p className="pay-card-name">{plan.name}</p>

                <p className="pay-price-strike">Rs.{plan.priceStrike}/-</p>
                <div className="pay-pricing">
                  <p className="pay-price-current">
                    <span className="pay-price-currency">Rs.</span>
                    {plan.priceCurrent}
                    <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: 0 }}>/-</span>
                  </p>
                </div>

                <div className="pay-card-divider" />

                <div className="pay-features">
                  {plan.features.map((f, i) => (
                    <div key={i} className="pay-feature-item">
                      <div className="pay-feature-check"><CheckIcon /></div>
                      {f}
                    </div>
                  ))}
                </div>

                {/* Clean CTA — no checkbox here */}
                <button
                  className={`pay-cta-btn${plan.featured ? " primary" : " default"}`}
                  onClick={() => handlePlanClick(plan)}
                  disabled={loading}
                >
                  {`Get ${plan.name}`}
                </button>

                <div className="pay-card-validity">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  Valid till <span>November 2026</span>
                </div>

              </div>
            ))}
          </div>

          <div className="pay-trust-row">
            <div className="pay-trust-item">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Secure payment
            </div>
            <div className="pay-trust-item">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              One-time purchase
            </div>
            <div className="pay-trust-item">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
              </svg>
              No hidden charges
            </div>
            <div className="pay-trust-item">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <path strokeLinecap="round" d="M13 2v7h7" />
              </svg>
              Instant access
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      {dialogPlan && (
        <ConfirmDialog
          plan={dialogPlan}
          onClose={() => { setDialogPlan(null); setLoading(false); }}
          onConfirm={handleConfirmedPay}
          loading={loading}
        />
      )}

      {errorMsg && (
        <div className="pay-error-toast">{errorMsg}</div>
      )}
    </>
  );
}