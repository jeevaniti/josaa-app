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
      "CSAB special round predictor",
      "Dual rank support",
      "Priority result generation",
      "Best value for most students",
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

export default function PaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load Razorpay script once on mount
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // If user already paid, redirect to services
  // useEffect(() => {
  //     const checkIfPaid = async () => {
  //         try {
  //             const user = auth.currentUser;
  //             if (!user) return;
  //             const idToken = await user.getIdToken(true);
  //             const res = await fetch("/api/has-paid-verify", {
  //                 method: "POST",
  //                 headers: { "Content-Type": "application/json" },
  //                 body: JSON.stringify({ token: idToken }),
  //             });
  //             if (res.status === 200) router.push("/dashboard");
  //         } catch (err) {
  //             console.error("Payment check error:", err);
  //         }
  //     };
  //     checkIfPaid();
  // }, [router]);

  function showError(msg) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  }

  async function handleBuy(planId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        showError("Please log in to continue.");
        return;
      }

      setLoading(planId);

      const idToken = await user.getIdToken(true);

      // Create Razorpay order via our API
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

      // Open Razorpay checkout modal
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "JOSAA Master",
        description: data.planLabel,
        handler: function () {
          // Called on successful payment capture
          // router.push("/payment-success");
          router.push("/set-user-rank");
        },
        modal: {
          ondismiss: function () {
            // User closed modal without paying
            setLoading(null);
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
        setLoading(null);
        console.error("Razorpay payment.failed:", response.error);
      });

      rzp.open();

    } catch (err) {
      console.error("handleBuy error:", err);
      showError(err.message || "Something went wrong. Please try again.");
      setLoading(null);
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

                <button
                  className={`pay-cta-btn${plan.featured ? " primary" : " default"}`}
                  onClick={() => handleBuy(plan.id)}
                  disabled={loading !== null}
                >
                  {loading === plan.id ? "Processing..." : `Get ${plan.name}`}
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

      {errorMsg && (
        <div className="pay-error-toast">{errorMsg}</div>
      )}
    </>
  );
}