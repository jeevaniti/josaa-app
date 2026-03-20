"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const styles = `
  .dashboard-root {
    padding: 32px 28px;
    max-width: 960px;
    margin: 0 auto;
  }

  .dashboard-welcome {
    margin-bottom: 28px;
  }

  .dashboard-eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: 6px;
  }

  .dashboard-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: clamp(24px, 3vw, 34px);
    font-weight: 800;
    color: var(--color-text-primary);
    line-height: 1.2;
    margin-bottom: 6px;
  }

  .dashboard-subtitle {
    font-size: 14px;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .info-banner {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: var(--radius-md);
    padding: 14px 18px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 28px;
  }

  .info-banner-icon { color: var(--color-blue); flex-shrink: 0; margin-top: 1px; }

  .info-banner-title {
    font-size: 13px;
    font-weight: 700;
    color: #1d4ed8;
    margin-bottom: 2px;
  }

  .info-banner-text {
    font-size: 13px;
    color: #3b82f6;
    font-weight: 500;
    line-height: 1.5;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 18px 20px;
    box-shadow: var(--shadow-card);
  }

  .stat-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-value.blue  { color: var(--color-blue); }
  .stat-value.green { color: var(--color-green); }
  .stat-value.amber { color: #d97706; }

  .stat-sub {
    font-size: 12px;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .mid-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 20px;
    box-shadow: var(--shadow-card);
  }

  .card-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-border);
  }

  .rank-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 14px;
    border-radius: var(--radius-sm);
    background: #f8fafc;
    border: 1px solid var(--color-border);
    margin-bottom: 10px;
  }

  .rank-chip:last-child { margin-bottom: 0; }

  .rank-chip-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    margin-bottom: 2px;
  }

  .rank-chip-value {
    font-size: 19px;
    font-weight: 800;
    color: var(--color-text-primary);
  }

  .rank-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: var(--radius-full);
  }

  .badge-josaa  { background: #dbeafe; color: #1d4ed8; }
  .badge-csab   { background: #fef9c3; color: #a16207; }
  .badge-adv    { background: #f3e8ff; color: #7c3aed; }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .activity-item:last-child { border-bottom: none; }

  .activity-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }

  .dot-blue  { background: var(--color-blue); }
  .dot-green { background: var(--color-green); }
  .dot-amber { background: #d97706; }

  .activity-text {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  .activity-time {
    font-size: 11px;
    color: var(--color-text-muted);
    margin-top: 2px;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .dashboard-root { padding: 20px 16px; }

    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }

    .stats-grid .stat-card:last-child {
      grid-column: span 2;
    }

    .mid-row { grid-template-columns: 1fr; }
  }

  @media (max-width: 400px) {
    .stats-grid { grid-template-columns: 1fr; }
    .stats-grid .stat-card:last-child { grid-column: span 1; }
  }
`;

const ACTIVITIES = [
  { dot: "dot-blue", text: "You set your JEE Mains rank for JOSAA", time: "2 hours ago" },
  { dot: "dot-green", text: "Find Colleges returned 24 results for CSE", time: "Yesterday" },
  { dot: "dot-amber", text: "JOSAA Round 1 seat allotment expected soon", time: "System" },
];

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Derive a friendly first name
  const firstName = user?.displayName
    ? user.displayName.trim().split(" ")[0]
    : user?.email
      ? user.email.split("@")[0]
      : null;

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-root">

        <div className="dashboard-welcome">
          {/* {firstName && (
            <p className="dashboard-eyebrow">Hey, {firstName} 👋</p>
          )} */}
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            {user?.email
              ? `Signed in as ${user.email}`
              : ""
            }
          </p>
        </div>

        <div className="info-banner">
          <div className="info-banner-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div>
            <p className="info-banner-title">JOSAA 2026 Counselling is Live</p>
            {/* <p className="info-banner-text">Round 1 seat allotment results are expected soon. Keep your ranks updated and run a college search to prepare.</p> */}
            {/* <p className="info-banner-text">Round 1 seat allotment results are expected soon. Keep your ranks updated and run a college search to prepare.</p> */}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">JEE Mains Rank</p>
            <p className="stat-value blue">29,212</p>
            <p className="stat-sub">EWS</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Colleges Matched</p>
            <p className="stat-value green">47</p>
            <p className="stat-sub">Across all rounds</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">High Chance</p>
            <p className="stat-value amber">12</p>
            <p className="stat-sub">In your Category</p>
          </div>
        </div>

        <div className="mid-row">
          <div className="card">
            <p className="card-section-title">Saved Ranks</p>
            <div className="rank-chip">
              <div>
                <p className="rank-chip-label">JEE Mains</p>
                <p className="rank-chip-value">29,212</p>
              </div>
              <span className="rank-badge badge-josaa">JOSAA</span>
            </div>
            <div className="rank-chip">
              <div>
                <p className="rank-chip-label">JEE Mains</p>
                <p className="rank-chip-value">31,500</p>
              </div>
              <span className="rank-badge badge-csab">CSAB</span>
            </div>
            <div className="rank-chip">
              <div>
                <p className="rank-chip-label">JEE Advanced</p>
                <p className="rank-chip-value">10,222</p>
              </div>
              <span className="rank-badge badge-adv">Advanced</span>
            </div>
          </div>
        </div>

        <div className="card">
          <p className="card-section-title">Recent Activity</p>
          {ACTIVITIES.map((a, i) => (
            <div key={i} className="activity-item">
              <div className={`activity-dot ${a.dot}`} />
              <div>
                <p className="activity-text">{a.text}</p>
                <p className="activity-time">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}