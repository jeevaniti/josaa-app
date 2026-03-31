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

  /* ── Quick Actions ── */
  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
    margin-bottom: 24px;
  }

  .quick-action-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: var(--color-blue);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    letter-spacing: 0.01em;
    transition: opacity 0.15s, transform 0.1s;
    white-space: nowrap;
  }

  .quick-action-link:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  .quick-action-link:active {
    opacity: 1;
    transform: translateY(0);
  }

  .quick-action-link svg {
    flex-shrink: 0;
  }

  .quick-action-link--outline {
    background: transparent;
    color: var(--color-blue);
    border: 1.5px solid var(--color-blue);
  }

  .quick-action-link--outline:hover {
    background: #eff6ff;
    opacity: 1;
  }

  @media (max-width: 400px) {
    .quick-action-link {
      width: 100%;
      justify-content: center;
    }
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
    padding: 22px 20px 18px;
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .stat-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
  }

  .stat-value {
    font-size: 36px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .stat-value.blue  { color: var(--color-blue); }
  .stat-value.green { color: var(--color-green); }
  .stat-value.amber { color: #d97706; }

  .stat-divider {
    height: 1px;
    background: var(--color-border);
    margin: 0;
  }

  .stat-sub {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  /* ── Mid Row ── */
  .mid-row {
    display: grid;
    grid-template-columns: 1fr;
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
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-border);
  }

  /* ── Seats List ── */
  .seats-list {
    display: flex;
    flex-direction: column;
  }

  .seats-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 0;
    border-bottom: 1px solid var(--color-border);
  }

  .seats-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .seats-row:first-child {
    padding-top: 0;
  }

  .seats-branch {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .seats-count {
    font-size: 15px;
    font-weight: 800;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  /* ── Marks–Rank Table ── */
  .table-card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    margin-bottom: 20px;
    overflow: hidden;
  }

  .table-card-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border);
  }

  .rank-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .rank-table thead tr {
    background: #f8fafc;
  }

  .rank-table th {
    padding: 10px 16px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  .rank-table th:not(:first-child),
  .rank-table td:not(:first-child) {
    text-align: right;
  }

  .rank-table tbody tr {
    border-bottom: 1px solid var(--color-border);
    transition: background 0.1s;
  }

  .rank-table tbody tr:last-child {
    border-bottom: none;
  }

  .rank-table tbody tr:hover {
    background: #f8fafc;
  }

  .rank-table td {
    padding: 9px 16px;
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .rank-table td:first-child {
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .rank-table td:last-child {
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  /* ── Activity ── */
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

    .rank-table th, .rank-table td {
      padding: 9px 12px;
    }
  }

  @media (max-width: 400px) {
    .stats-grid { grid-template-columns: 1fr; }
    .stats-grid .stat-card:last-child { grid-column: span 1; }
  }
`;

const MARKS_RANK_DATA = [
  { marks: "300–290", percentile: "100 – 99.99989", rank: "1 – 15" },
  { marks: "289–280", percentile: "99.99908 – 99.99745", rank: "16 – 36" },
  { marks: "279–270", percentile: "99.99417 – 99.99347", rank: "37 – 100" },
  { marks: "269–260", percentile: "99.99016 – 99.98881", rank: "101 – 160" },
  { marks: "259–250", percentile: "99.97720 – 99.96976", rank: "161 – 428" },
  { marks: "249–240", percentile: "99.95028 – 99.94664", rank: "429 – 755" },
  { marks: "239–230", percentile: "99.91595 – 99.93498", rank: "756 – 1,189" },
  { marks: "229–220", percentile: "99.86623 – 99.90111", rank: "1,190 – 1,893" },
  { marks: "219–210", percentile: "99.80777 – 99.85161", rank: "1,894 – 2,720" },
  { marks: "209–200", percentile: "99.73129 – 99.79506", rank: "2,721 – 3,803" },
  { marks: "199–190", percentile: "99.62402 – 99.71083", rank: "3,804 – 5,320" },
  { marks: "189–180", percentile: "99.48033 – 99.59739", rank: "5,321 – 7,354" },
  { marks: "179–170", percentile: "99.29558 – 99.45693", rank: "7,355 – 9,968" },
  { marks: "169–160", percentile: "99.06985 – 99.27208", rank: "9,969 – 13,163" },
  { marks: "159–150", percentile: "98.77819 – 99.02861", rank: "13,164 – 17,290" },
  { marks: "149–140", percentile: "98.40768 – 98.73238", rank: "17,291 – 22,533" },
  { marks: "139–130", percentile: "97.94047 – 98.31741", rank: "22,534 – 29,145" },
  { marks: "129–120", percentile: "97.35425 – 97.81126", rank: "29,146 – 37,440" },
  { marks: "119–110", percentile: "96.60949 – 97.14293", rank: "37,441 – 47,979" },
  { marks: "109–100", percentile: "95.64338 – 96.20455", rank: "47,980 – 61,651" },
  { marks: "99–90", percentile: "94.39636 – 94.99859", rank: "61,652 – 79,298" },
  { marks: "89–80", percentile: "92.76234 – 93.47123", rank: "79,299 – 1,02,421" },
  { marks: "79–70", percentile: "90.41098 – 91.07212", rank: "1,02,422 – 1,35,695" },
  { marks: "69–60", percentile: "87.06073 – 87.51222", rank: "1,35,696 – 1,83,105" },
  { marks: "59–50", percentile: "81.57582 – 82.01606", rank: "1,83,106 – 2,60,722" },
  { marks: "49–40", percentile: "73.08140 – 73.28780", rank: "2,60,723 – 3,80,928" },
  { marks: "39–30", percentile: "59.84001 – 58.15149", rank: "3,80,929 – 5,68,308" },
  { marks: "29–20", percentile: "40.34692 – 37.69452", rank: "5,68,309 – 8,44,157" },
  { marks: "19–10", percentile: "20.95045 – 13.49584", rank: "8,44,158 – 11,18,638" },
  { marks: "9–0", percentile: "6.59980 – 0.84351", rank: "11,18,639 – 12,00,000+" },
];

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
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            {user?.email ? `Signed in as ${user.email}` : ""}
          </p>
          <div className="quick-actions">
            <a href="/set-user-rank" className="quick-action-link">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Set Your Rank
            </a>
            <a href="/college-finder" className="quick-action-link quick-action-link--outline">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Find Colleges
            </a>
          </div>
        </div>

        {/* <div className="info-banner">
          <div className="info-banner-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div>
            <p className="info-banner-title">JOSAA 2026 Counselling is Live</p>
          </div>
        </div> */}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">IITs</p>
            <p className="stat-value blue">23</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">NITs</p>
            <p className="stat-value green">31</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">IIITs & Others</p>
            <p className="stat-value amber">45</p>
          </div>
        </div>

        {/* Total Seats */}
        <div className="mid-row">
          <div className="card">
            <p className="card-section-title">Total Seat Count in Year 2026</p>
            <div className="seats-list">
              <div className="seats-row">
                <span className="seats-branch">Computer Science & Engineering</span>
                <span className="seats-count">10,201+</span>
              </div>
              <div className="seats-row">
                <span className="seats-branch">Electronics & Communications Engineering</span>
                <span className="seats-count">18,000+</span>
              </div>
              <div className="seats-row">
                <span className="seats-branch">Electrical Engineering</span>
                <span className="seats-count">20,222+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Marks → Rank Table */}
        <div className="table-card">
          <div style={{ overflowX: "auto" }}>
            <table className="rank-table">
              <thead>
                <tr>
                  <th>Marks Range</th>
                  <th>Expected Percentile</th>
                  <th>Estimated Rank</th>
                </tr>
              </thead>
              <tbody>
                {MARKS_RANK_DATA.map((row) => (
                  <tr key={row.marks}>
                    <td>{row.marks}</td>
                    <td>{row.percentile}</td>
                    <td>{row.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}