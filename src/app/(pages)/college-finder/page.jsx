


// "use client";

// import { useState, useEffect, useRef } from "react";
// import { auth } from "@/lib/firebase";
// import { getIdToken } from "firebase/auth";

// // ─────────────────────────────────────────────────────────────────────────────
// // ID MAPS — mirrors exactly what the backend uses.
// // Frontend stores label strings; IDs are only assembled at generate time.
// // ─────────────────────────────────────────────────────────────────────────────

// const COLLEGE_TYPE_MAP = {
//   IIT: 1001,
//   IIIT: 1002,
//   NIT: 1003,
//   "Other Govt": 1004,
// };

// const DEGREE_TYPE_MAP = {
//   "BTech (4 Years)": 2001,
//   "Dual - BTech+MTech (5 Years)": 2002,
// };

// const BRANCH_MAP = {
//   CSE: 3001,
//   Chemical: 3002,
//   Aerospace: 3003,
//   Aeronautical: 3004,
//   "AI": 3005,
//   "Data Science": 3006,
//   Civil: 3007,
//   ECE: 3008,
//   EEE: 3009,
//   Metallurgy: 3010,
//   Mechanical: 3011,
//   "Bio Technology": 3012
// };

// const VALID_MODE_IDS = ["TEST", "JOSAA", "CSAB"];

// const ROUND_LIMITS = {
//   TEST: { min: 1, max: 6 },
//   JOSAA: { min: 1, max: 6 },
//   CSAB: { min: 1, max: 3 },
// };

// const COLLEGE_TYPES_PER_MODE = {
//   TEST: ["NIT", "IIIT", "Other Govt"],
//   JOSAA: ["IIT", "NIT", "IIIT", "Other Govt"],
//   CSAB: ["NIT", "IIIT", "Other Govt"],
// };

// const DEGREE_OPTIONS = Object.keys(DEGREE_TYPE_MAP);
// const BRANCH_OPTIONS = Object.keys(BRANCH_MAP);

// const CHANCE_CLASS = {
//   Strong: "chance-high",
//   Good: "chance-moderate",
//   Satisfactory: "chance-low",
//   Low: "chance-verylow",
// };

// const QUOTA_LABEL = {
//   HS: "Home State",
//   OS: "Other State",
//   AI: "All India",
// };


// // ─────────────────────────────────────────────────────────────────────────────
// // CSS
// // ─────────────────────────────────────────────────────────────────────────────
// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

//   .fc-root {
//     padding: 32px 28px;
//     max-width: 960px;
//     margin: 0 auto;
//     font-family: 'DM Sans', sans-serif;
//   }

//   .fc-eyebrow {
//     font-size: 11px;
//     font-weight: 600;
//     letter-spacing: 0.12em;
//     text-transform: uppercase;
//     color: #94a3b8;
//     margin-bottom: 6px;
//   }

//   .fc-title {
//     font-family: 'Instrument Serif', Georgia, serif;
//     font-size: clamp(22px, 3vw, 32px);
//     font-weight: 600;
//     color: #0f172a;
//     line-height: 1.2;
//     margin-bottom: 6px;
//   }

//   .fc-subtitle {
//     font-size: 14px;
//     color: #64748b;
//     font-weight: 400;
//     margin-bottom: 24px;
//     line-height: 1.6;
//   }

//   .fc-warn-banner {
//     display: flex;
//     align-items: center;
//     gap: 10px;
//     background: #e0e0e0ff;
//     border-radius: 6px;
//     padding: 10px 14px;
//     margin-bottom: 20px;
//     font-size: 12.5px;
//     font-weight: 600;
//     color: #4e3120ff;
//     font-family: 'DM Sans', sans-serif;
//   }

//   .fc-form-card {
//     background: #ffffff;
//     border: 1px solid #e2e8f0;
//     border-radius: 10px;
//     padding: 22px;
//     box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
//     margin-bottom: 20px;
//   }

//   .fc-overview-table {
//     width: 100%;
//     border: 1px solid #e2e8f0;
//     border-radius: 8px;
//     border-collapse: separate;
//     border-spacing: 0;
//     overflow: hidden;
//     margin-bottom: 20px;
//     font-size: 13px;
//   }

//   .fc-overview-table th {
//     background: #f8fafc;
//     color: #94a3b8;
//     font-size: 10px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.08em;
//     padding: 9px 16px;
//     border-bottom: 1px solid #e2e8f0;
//     text-align: left;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-overview-table td {
//     padding: 11px 16px;
//     color: #1e293b;
//     font-weight: 600;
//     font-size: 13px;
//     background: white;
//   }

//   .fc-overview-table tr:last-child td { border-bottom: none; }

//   .fc-overview-table td.not-set {
//     color: #94a3b8;
//     font-weight: 400;
//     font-style: italic;
//   }

//   .fc-section-label {
//     font-size: 10.5px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.09em;
//     color: #94a3b8;
//     margin-bottom: 10px;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-mode-row {
//     display: flex;
//     border: 1px solid #e2e8f0;
//     border-radius: 8px;
//     overflow: hidden;
//     margin-bottom: 22px;
//     background: #f8fafc;
//   }

//   .fc-mode-btn {
//     flex: 1;
//     padding: 11px 0;
//     font-size: 12.5px;
//     font-weight: 600;
//     border: none;
//     background: transparent;
//     cursor: pointer;
//     color: #94a3b8;
//     transition: all 0.15s ease;
//     letter-spacing: 0.04em;
//     font-family: 'DM Sans', sans-serif;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 6px;
//     position: relative;
//   }

//   .fc-mode-btn + .fc-mode-btn { border-left: 1px solid #e2e8f0; }

//   .fc-mode-btn.active {
//     background: #0f172a;
//     color: #f8fafc;
//   }

//   .fc-lock-icon {
//     opacity: 0.4;
//     display: flex;
//     align-items: center;
//   }

//   .fc-rank-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 12px;
//     margin-bottom: 18px;
//   }

//   .fc-rank-grid--single {
//     grid-template-columns: 1fr;
//     max-width: 320px;
//   }

//   .fc-field {
//     display: flex;
//     flex-direction: column;
//     gap: 5px;
//   }

//   .fc-label {
//     font-size: 10px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.08em;
//     color: #94a3b8;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-rank-display {
//     height: 40px;
//     border: 1px solid #e2e8f0;
//     border-radius: 7px;
//     background: #f8fafc;
//     padding: 0 12px;
//     font-size: 13px;
//     font-weight: 600;
//     color: #1e293b;
//     display: flex;
//     align-items: center;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-rank-display.not-set {
//     color: #cbd5e1;
//     font-style: italic;
//     font-weight: 400;
//     font-family: 'DM Sans', sans-serif;
//   }

//   .fc-generate-row {
//     display: flex;
//     justify-content: flex-end;
//   }

//   .fc-btn-generate {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     background: #0f172a;
//     color: #f8fafc;
//     font-size: 13.5px;
//     font-weight: 600;
//     padding: 11px 26px;
//     border-radius: 7px;
//     border: none;
//     cursor: pointer;
//     transition: background 0.15s ease, transform 0.1s ease;
//     font-family: 'DM Sans', sans-serif;
//     letter-spacing: 0.01em;
//   }

//   .fc-btn-generate:hover  { background: #1e293b; transform: translateY(-1px); }
//   .fc-btn-generate:active { transform: scale(0.97); }
//   .fc-btn-generate:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

//   .fc-error-banner {
//     background: #fef2f2;
//     border: 1px solid #fecaca;
//     border-left: 3px solid #ef4444;
//     border-radius: 6px;
//     padding: 11px 14px;
//     font-size: 13px;
//     font-weight: 500;
//     color: #991b1b;
//     margin-bottom: 16px;
//     display: flex;
//     align-items: flex-start;
//     gap: 8px;
//     line-height: 1.5;
//   }

//   .fc-filters-card {
//     background: #ffffff;
//     border: 1px solid #e2e8f0;
//     border-radius: 10px;
//     padding: 18px 20px;
//     box-shadow: 0 1px 3px rgba(0,0,0,0.05);
//     margin-bottom: 16px;
//   }

//   .fc-filter-header {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     cursor: default;
//   }

//   .fc-filter-title {
//     font-size: 10.5px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.09em;
//     color: #94a3b8;
//     margin-bottom: 0;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-filter-toggle-btn {
//     display: none;
//     background: none;
//     border: none;
//     cursor: pointer;
//     padding: 4px;
//     color: #94a3b8;
//     transition: transform 0.2s ease;
//     flex-shrink: 0;
//   }

//   .fc-filter-toggle-btn.open { transform: rotate(180deg); }
//   .fc-filter-body { margin-top: 14px; }

//   .fc-filter-groups {
//     display: grid;
//     grid-template-columns: repeat(3, 1fr);
//     gap: 20px;
//   }

//   .fc-filter-group-label {
//     font-size: 10px;
//     font-weight: 800;
//     text-transform: uppercase;
//     letter-spacing: 0.08em;
//     color: #000000ff;
//     margin-bottom: 9px;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-checkbox-list {
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
//   }

//   .fc-checkbox-item {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     font-size: 13px;
//     font-weight: 500;
//     color: #334155;
//     cursor: pointer;
//     user-select: none;
//   }

//   .fc-checkbox-item:hover { color: #0f172a; }

//   .fc-checkbox-item input[type="checkbox"] {
//     accent-color: #0f172a;
//     width: 14px;
//     height: 14px;
//     flex-shrink: 0;
//     cursor: pointer;
//   }

//   .fc-round-bar {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     gap: 12px;
//     padding: 12px 20px;
//     border-bottom: 1px solid #f1f5f9;
//     flex-wrap: wrap;
//   }

//   .fc-round-bar-left {
//     display: flex;
//     align-items: center;
//     gap: 12px;
//     flex-wrap: wrap;
//   }

//   .fc-round-label {
//     font-size: 10px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.09em;
//     color: #94a3b8;
//     white-space: nowrap;
//     flex-shrink: 0;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-round-btns {
//     display: flex;
//     border: 1px solid #e2e8f0;
//     border-radius: 7px;
//     overflow: hidden;
//     background: white;
//   }

//   .fc-round-btn {
//     padding: 6px 14px;
//     font-size: 12px;
//     font-weight: 600;
//     border: none;
//     border-right: 1px solid #e2e8f0;
//     background: transparent;
//     cursor: pointer;
//     color: #94a3b8;
//     transition: all 0.12s ease;
//     font-family: 'DM Sans', sans-serif;
//     white-space: nowrap;
//     letter-spacing: 0.02em;
//   }

//   .fc-round-btn:last-child { border-right: none; }
//   .fc-round-btn.active     { background: #0f172a; color: white; }
//   .fc-round-btn:hover:not(.active) { background: #f1f5f9; color: #334155; }

//   .fc-round-btn.locked {
//     color: #cbd5e1;
//     cursor: pointer;
//     background: #f8fafc;
//     position: relative;
//   }
//   .fc-round-btn.locked:hover { background: #f1f5f9; color: #94a3b8; }
//   .fc-round-btn.locked .fc-round-lock {
//     display: inline-flex;
//     align-items: center;
//     margin-left: 4px;
//     opacity: 0.5;
//     vertical-align: middle;
//   }

//   /* Locked filter group overlay */
//   .fc-filter-group-locked {
//     position: relative;
//     user-select: none;
//   }
//   .fc-filter-group-locked-overlay {
//     position: absolute;
//     inset: -8px;
//     background: rgba(248,250,252,0.85);
//     border-radius: 8px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     cursor: pointer;
//     z-index: 2;
//     gap: 6px;
//     font-size: 11px;
//     font-weight: 600;
//     color: #94a3b8;
//     font-family: 'DM Mono', monospace;
//     letter-spacing: 0.04em;
//     border: 1.5px dashed #e2e8f0;
//     transition: background 0.15s ease;
//   }
//   .fc-filter-group-locked-overlay:hover {
//     background: rgba(241,245,249,0.92);
//     color: #64748b;
//   }

//   .fc-btn-generate-inline {
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     background: #0f172a;
//     color: #f8fafc;
//     font-size: 12px;
//     font-weight: 600;
//     padding: 7px 16px;
//     border-radius: 7px;
//     border: none;
//     cursor: pointer;
//     transition: background 0.15s ease, transform 0.1s ease;
//     font-family: 'DM Sans', sans-serif;
//     white-space: nowrap;
//     flex-shrink: 0;
//   }

//   .fc-btn-generate-inline:hover  { background: #1e293b; transform: translateY(-1px); }
//   .fc-btn-generate-inline:active { transform: scale(0.97); }
//   .fc-btn-generate-inline:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

//   .fc-results {
//     background: #ffffff;
//     border: 1px solid #e2e8f0;
//     border-radius: 10px;
//     box-shadow: 0 1px 3px rgba(0,0,0,0.05);
//     overflow: hidden;
//   }

//   .fc-results-header {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     padding: 13px 20px;
//     border-bottom: 1px solid #f1f5f9;
//     background: #fafafa;
//   }

//   .fc-results-title {
//     font-size: 11px;
//     font-weight: 600;
//     color: #475569;
//     text-transform: uppercase;
//     letter-spacing: 0.07em;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-results-count {
//     font-size: 11px;
//     font-weight: 600;
//     color: #64748b;
//     background: #f1f5f9;
//     padding: 3px 10px;
//     border-radius: 20px;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-table-head {
//     display: grid;
//     grid-template-columns: 2fr 2fr 100px 100px 36px;
//     padding: 9px 20px;
//     border-bottom: 1px solid #f1f5f9;
//   }

//   .fc-th {
//     font-size: 11.5px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.09em;
//     color: #94a3b8;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-result-row { border-bottom: 1px solid #f8fafc; overflow: hidden; }
//   .fc-result-row:last-child { border-bottom: none; }

//   .fc-result-main {
//     display: grid;
//     grid-template-columns: 2fr 2fr 100px 100px 36px;
//     align-items: center;
//     padding: 13px 20px;
//     transition: background 0.1s ease;
//   }

//   .fc-result-row:hover .fc-result-main { background: #fdfdfdff; }

//   .fc-college-cell { display: flex; align-items: center; gap: 10px; }

//   .fc-college-name {
//     font-size: 13px;
//     font-weight: 600;
//     color: #0f172a;
//     line-height: 1.3;
//   }

//   .fc-branch-name {
//     font-size: 12.5px;
//     font-weight: 400;
//     color: #64748b;
//     padding-right: 10px;
//     line-height: 1.4;
//   }

//   .fc-chance-badge {
//     font-size: 10px;
//     font-weight: 700;
//     padding: 4px 10px;
//     border-radius: 20px;
//     width: fit-content;
//     white-space: nowrap;
//     letter-spacing: 0.03em;
//     text-transform: uppercase;
//     font-family: 'DM Mono', monospace;
//   }

//   .chance-high     { background: #dcfce7; color: #166534; }
//   .chance-moderate { background: #fef9c3; color: #854d0e; }
//   .chance-low      { background: #ffedd5; color: #9a3412; }
//   .chance-verylow  { background: #fee2e2; color: #991b1b; }

//   .fc-expand-btn {
//     width: 26px; height: 26px;
//     border-radius: 6px;
//     border: 1px solid #e2e8f0;
//     background: white;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     cursor: pointer;
//     color: #94a3b8;
//     transition: all 0.12s ease;
//     justify-self: center;
//   }

//   .fc-expand-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #475569; }
//   .fc-expand-btn.open  { transform: rotate(180deg); }

//   .fc-result-details {
//     padding: 0 20px 16px 58px;
//     animation: detailOpen 0.15s ease-out both;
//     background: #fafafa;
//     border-top: 1px solid #f1f5f9;
//   }

//   .fc-result-details-inner { padding-top: 14px; }

//   .fc-cutoff-table {
//     width: 100%;
//     border-collapse: separate;
//     border-spacing: 0;
//     border: 1px solid #e2e8f0;
//     border-radius: 7px;
//     overflow: hidden;
//     font-size: 12px;
//   }

//   .fc-cutoff-table th {
//     background: #f8fafc;
//     padding: 7px 12px;
//     text-align: left;
//     font-size: 9.5px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.08em;
//     color: #94a3b8;
//     border-bottom: 1px solid #e2e8f0;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-cutoff-table td {
//     padding: 8px 12px;
//     font-weight: 500;
//     color: #334155;
//     border-bottom: 1px solid #f8fafc;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-cutoff-table tr:last-child td { border-bottom: none; }

//   @keyframes detailOpen {
//     from { opacity: 0; transform: translateY(-4px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }

//   /* ── Pagination ── */
//   .fc-pagination {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     padding: 12px 20px;
//     border-top: 1px solid #f1f5f9;
//     background: #fafafa;
//     gap: 12px;
//   }

//   .fc-pagination-info {
//     font-size: 11px;
//     font-weight: 600;
//     color: #64748b;
//     font-family: 'DM Mono', monospace;
//     white-space: nowrap;
//   }

//   .fc-pagination-btns {
//     display: flex;
//     gap: 6px;
//     align-items: center;
//   }

//   .fc-page-btn {
//     display: flex;
//     align-items: center;
//     gap: 5px;
//     padding: 6px 14px;
//     font-size: 12px;
//     font-weight: 600;
//     border: 1px solid #e2e8f0;
//     border-radius: 7px;
//     background: white;
//     color: #334155;
//     cursor: pointer;
//     font-family: 'DM Sans', sans-serif;
//     transition: all 0.12s ease;
//     white-space: nowrap;
//   }

//   .fc-page-btn:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
//   .fc-page-btn:disabled {
//     opacity: 0.35;
//     cursor: not-allowed;
//   }

//   /* Empty / loading */
//   .fc-state-center { padding: 52px 20px; text-align: center; }

//   .fc-state-icon {
//     width: 44px; height: 44px;
//     background: #f8fafc;
//     border: 1px solid #e2e8f0;
//     border-radius: 10px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     margin: 0 auto 12px;
//     color: #94a3b8;
//   }

//   .fc-state-text { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 4px; }
//   .fc-state-sub  { font-size: 12.5px; color: #94a3b8; font-weight: 400; }

//   .fc-spinner {
//     width: 16px; height: 16px;
//     border: 2px solid #e2e8f0;
//     border-top-color: #0f172a;
//     border-radius: 50%;
//     animation: spin 0.7s linear infinite;
//     display: inline-block;
//     flex-shrink: 0;
//   }

//   .fc-loading-row {
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 10px;
//     padding: 44px 20px;
//     font-size: 13px;
//     font-weight: 500;
//     color: #64748b;
//   }

//   @keyframes spin { to { transform: rotate(360deg); } }

//   /* ── Paywall Popup ── */
//   .fc-overlay {
//     position: fixed;
//     inset: 0;
//     background: rgba(15,23,42,0.5);
//     z-index: 1000;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     padding: 20px;
//     backdrop-filter: blur(2px);
//   }

//   .fc-popup {
//     background: white;
//     border-radius: 12px;
//     padding: 32px 28px;
//     max-width: 380px;
//     width: 100%;
//     box-shadow: 0 20px 60px rgba(0,0,0,0.15);
//     text-align: center;
//     animation: popIn 0.2s ease-out both;
//     border: 1px solid #e2e8f0;
//   }

//   @keyframes popIn {
//     from { opacity: 0; transform: scale(0.94) translateY(8px); }
//     to   { opacity: 1; transform: scale(1) translateY(0); }
//   }

//   .fc-popup-icon {
//     width: 48px; height: 48px;
//     background: #fef3c7;
//     border-radius: 10px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     margin: 0 auto 16px;
//     color: #d97706;
//   }

//   .fc-popup-title {
//    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
//     font-size: 20px;
//     font-weight: 600;
//     color: #0f172a;
//     margin-bottom: 8px;
//   }

//   .fc-popup-sub {
//     font-size: 13px;
//     color: #989ba0ff;
//     font-weight: 400;
//     margin-bottom: 22px;
//     line-height: 1.6;
//   }

//   .fc-popup-actions { display: flex; flex-direction: column; gap: 8px; }

//   .fc-popup-buy {
//     background: #0f172a;
//     color: white;
//     font-size: 13.5px;
//     font-weight: 600;
//     padding: 12px 20px;
//     border-radius: 7px;
//     border: none;
//     cursor: pointer;
//     font-family: 'DM Sans', sans-serif;
//     transition: background 0.15s ease;
//   }

//   .fc-popup-buy:hover { background: #1e293b; }

//   .fc-popup-cancel {
//     background: none;
//     border: 1px solid #e2e8f0;
//     color: #64748b;
//     font-size: 13px;
//     font-weight: 500;
//     padding: 10px 20px;
//     border-radius: 7px;
//     cursor: pointer;
//     font-family: 'DM Sans', sans-serif;
//     transition: background 0.12s ease;
//   }

//   .fc-popup-cancel:hover { background: #f8fafc; }

//   /* ── Responsive ── */
//   @media (max-width: 768px) {
//     .fc-root { padding: 20px 16px; }
//     .fc-rank-grid { grid-template-columns: 1fr; }
//     .fc-filter-groups { grid-template-columns: 1fr 1fr; }
//     .fc-generate-row { justify-content: stretch; }
//     .fc-btn-generate { width: 100%; justify-content: center; }
//     .fc-table-head { display: none; }

//     .fc-result-main {
//       display: grid;
//       grid-template-columns: 1fr auto;
//       grid-template-rows: auto auto auto;
//       gap: 4px 8px;
//       padding: 12px 16px;
//     }

//     .fc-college-cell  { grid-column: 1; grid-row: 1; min-width: 0; }
//     .fc-expand-btn    { grid-column: 2; grid-row: 1; align-self: start; margin-top: 2px; }

//     .fc-branch-name {
//       grid-column: 1 / 3;
//       grid-row: 2;
//       font-size: 11.5px;
//       padding-right: 0;
//       color: #64748b;
//     }

//     .fc-mobile-meta {
//       grid-column: 1 / 3;
//       grid-row: 3;
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       flex-wrap: wrap;
//       margin-top: 2px;
//     }

//     .fc-category-cell { display: none; }
//     .fc-badge-cell    { display: none; }

//     .fc-result-details { padding-left: 16px; }

//     .fc-overview-table th,
//     .fc-overview-table td { padding: 8px 12px; font-size: 12px; }

//     .fc-mode-btn { font-size: 12px; padding: 10px 0; }

//     .fc-filter-header { cursor: pointer; }
//     .fc-filter-toggle-btn { display: flex; }
//     .fc-filter-body { margin-top: 0; }
//     .fc-filter-body.collapsed { display: none; }
//     .fc-filter-body.expanded {
//       display: block;
//       margin-top: 14px;
//       animation: detailOpen 0.15s ease-out both;
//     }

//     .fc-round-btn .round-full  { display: none; }
//     .fc-round-btn .round-short { display: inline; }
//     .fc-round-btn { padding: 9px 14px; font-size: 13px; }
//     .fc-round-bar { gap: 8px; padding: 10px 16px; }
//     .fc-btn-generate-inline { font-size: 11px; padding: 6px 12px; }

//     .fc-pagination { flex-wrap: wrap; gap: 8px; padding: 10px 16px; }
//     .fc-pagination-info { font-size: 10.5px; }
//     .fc-page-btn { padding: 6px 10px; font-size: 11px; }
//   }

//   @media (min-width: 769px) {
//     .fc-round-btn .round-full  { display: inline; }
//     .fc-round-btn .round-short { display: none; }
//     .fc-filter-body.collapsed,
//     .fc-filter-body.expanded { display: block; margin-top: 14px; }

//     .fc-mobile-meta   { display: none; }
//     .fc-category-cell { display: block; }
//     .fc-badge-cell    { display: block; }
//     .fc-filter-title--mobile { display: none; }
//   }

//   @media (max-width: 480px) {
//     .fc-filter-groups { grid-template-columns: 1fr; }
//     .fc-popup { padding: 24px 18px; }
//     .fc-round-btn { padding: 9px 12px; font-size: 13px; }
//     .fc-round-bar { flex-wrap: wrap; row-gap: 8px; }
//     .fc-btn-generate-inline { width: 100%; justify-content: center; }
//   }
// `;

// // ─────────────────────────────────────────────────────────────────────────────
// // Small components
// // ─────────────────────────────────────────────────────────────────────────────
// const LockIcon = () => (
//   <span className="fc-lock-icon">
//     <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
//       <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//       <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
//     </svg>
//   </span>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // Utility helpers
// // ─────────────────────────────────────────────────────────────────────────────
// const val = (v) =>
//   v !== undefined && v !== null && String(v).trim() !== "" && String(v) !== "0"
//     ? v
//     : null;

// const buildCheckboxState = (keys) => Object.fromEntries(keys.map(k => [k, false]));

// function checkedToIds(checkedObj, idMap) {
//   return Object.entries(checkedObj)
//     .filter(([, isChecked]) => isChecked)
//     .map(([label]) => idMap[label])
//     .filter(Boolean);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Main page component
// // ─────────────────────────────────────────────────────────────────────────────
// export default function FindCollegePage() {

//   // ── Core UI state ─────────────────────────────────────────────────────────
//   const [mode, setMode] = useState("JOSAA");
//   const [selectedRound, setSelectedRound] = useState(1);

//   // ── User profile ──────────────────────────────────────────────────────────
//   const [userDetails, setUserDetails] = useState(null);
//   const [detailsLoading, setDetailsLoading] = useState(true);

//   // ── Filter checkboxes ─────────────────────────────────────────────────────
//   const [collegeTypes, setCollegeTypes] = useState(() => buildCheckboxState(COLLEGE_TYPES_PER_MODE["JOSAA"]));
//   const [degreeTypes, setDegreeTypes] = useState(() => buildCheckboxState(DEGREE_OPTIONS));
//   const [branches, setBranches] = useState(() => buildCheckboxState(BRANCH_OPTIONS));
//   const [filterOpen, setFilterOpen] = useState(false);

//   // ── Results & loading ─────────────────────────────────────────────────────
//   const [results, setResults] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [apiError, setApiError] = useState(null);
//   const [expanded, setExpanded] = useState({});

//   // ── Pagination ────────────────────────────────────────────────────────────
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalCount, setTotalCount] = useState(0);

//   // ── Paywall ───────────────────────────────────────────────────────────────
//   const [paywallFor, setPaywallFor] = useState(null);

//   // ── Generate cooldown (4s disable after click) ────────────────────────────
//   const [generateCooldown, setGenerateCooldown] = useState(0);
//   const cooldownRef = useRef(null);

//   // ── Fetch user profile on mount ───────────────────────────────────────────
//   useEffect(() => {
//     async function fetchDetails() {
//       try {
//         const user = auth.currentUser;
//         if (!user) { setUserDetails({}); setDetailsLoading(false); return; }

//         const jwt = await getIdToken(user);
//         const res = await fetch("/api/fetch_user_details", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ jwt }),
//         });
//         const data = await res.json();
//         setUserDetails(data);
//       } catch (e) {
//         console.error("Failed to fetch user details", e);
//         setUserDetails({});
//       } finally {
//         setDetailsLoading(false);
//       }
//     }
//     fetchDetails();
//   }, []);

//   // ── Subscription flags ────────────────────────────────────────────────────
//   const josaaUnlocked = userDetails?.josaa_credits === true;
//   const csabUnlocked = userDetails?.csab_credits === true;
//   // TEST is unlocked when EITHER josaa OR csab credit is active
//   const testUnlocked = josaaUnlocked || csabUnlocked;
//   // Full filters/advanced rounds in TEST mode require any credit
//   const testFiltersUnlocked = josaaUnlocked || csabUnlocked;

//   // ── Mode switch: reset filters + results ─────────────────────────────────
//   function handleModeClick(m) {
//     const isLocked =
//       (m === "JOSAA" && !josaaUnlocked) ||
//       (m === "CSAB" && !csabUnlocked);
//     // TEST is always accessible — restrictions are on rounds/filters inside

//     if (isLocked) { setPaywallFor(m); return; }

//     setMode(m);
//     setCollegeTypes(buildCheckboxState(COLLEGE_TYPES_PER_MODE[m]));
//     setSelectedRound(1);
//     setResults(null);
//     setApiError(null);
//     setExpanded({});
//     setPage(1);
//     setTotalPages(1);
//     setTotalCount(0);
//   }

//   // ── Filter / expand toggles ───────────────────────────────────────────────
//   function toggleFilter(setter, key) {
//     setter(prev => ({ ...prev, [key]: !prev[key] }));
//   }

//   function toggleExpand(idx) {
//     setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
//   }

//   // ── Build API payload ─────────────────────────────────────────────────────
//   function buildPayload(jwt, targetPage) {
//     const collegeIds = checkedToIds(collegeTypes, COLLEGE_TYPE_MAP);
//     const degreeIds = checkedToIds(degreeTypes, DEGREE_TYPE_MAP);
//     const branchIds = checkedToIds(branches, BRANCH_MAP);

//     return {
//       jwt,
//       mode,
//       round: selectedRound,
//       page: targetPage,
//       ...(collegeIds.length > 0 && { college_type: collegeIds }),
//       ...(degreeIds.length > 0 && { degree_type: degreeIds }),
//       ...(branchIds.length > 0 && { branch: branchIds }),
//     };
//   }

//   // ── Core fetch — called by Generate button and both pagination buttons ────
//   async function fetchPage(targetPage) {
//     setLoading(true);
//     setApiError(null);
//     setExpanded({});

//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         setApiError("You must be logged in to search colleges.");
//         return;
//       }

//       const jwt = await getIdToken(user);
//       const payload = buildPayload(jwt, targetPage);

//       const res = await fetch("/api/college_search", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setApiError(data?.error ?? `Server error (${res.status})`);
//         return;
//       }

//       setResults(data.results ?? []);
//       setTotalCount(data.total_count ?? 0);
//       setTotalPages(data.total_pages ?? 1);
//       setPage(data.current_page ?? targetPage);

//     } catch (e) {
//       console.error("[fetchPage]", e);
//       setApiError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ── Cooldown helper ───────────────────────────────────────────────────────
//   function startCooldown() {
//     if (cooldownRef.current) clearInterval(cooldownRef.current);
//     setGenerateCooldown(4);
//     cooldownRef.current = setInterval(() => {
//       setGenerateCooldown(prev => {
//         if (prev <= 1) {
//           clearInterval(cooldownRef.current);
//           cooldownRef.current = null;
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   }

//   // ── Generate: always starts from page 1 ──────────────────────────────────
//   function handleGenerate() {
//     startCooldown();
//     setResults(null);
//     setPage(1);
//     setTotalPages(1);
//     setTotalCount(0);
//     fetchPage(1);
//   }

//   // ── Pagination handlers ───────────────────────────────────────────────────
//   function handlePrev() {
//     if (page > 1) fetchPage(page - 1);
//   }

//   function handleNext() {
//     if (page < totalPages) fetchPage(page + 1);
//   }

//   // ── canGenerate ───────────────────────────────────────────────────────────
//   const modeUnlocked =
//     mode === "TEST" ||   // TEST rank is unlocked for everyone
//     (mode === "JOSAA" && josaaUnlocked) ||
//     (mode === "CSAB" && csabUnlocked);

//   const d = userDetails || {};

//   const rankFields = {
//     TEST: [{ label: "Test Mains CRL (estimated only)", value: d.test_mains_crl }],
//     JOSAA: [
//       { label: "Mains CRL Rank", value: d.crl_mains_rank },
//       { label: "Mains Category Rank", value: d.category_mains_rank },
//       { label: "Advanced CRL Rank", value: d.crl_adv_rank },
//       { label: "Advanced Category Rank", value: d.category_adv_rank },
//     ],
//     CSAB: [
//       { label: "Mains CRL Rank", value: d.crl_mains_rank },
//       { label: "Mains Category Rank", value: d.category_mains_rank },
//     ],
//   };

//   const canGenerate = modeUnlocked && rankFields[mode]?.some(f => val(f.value));

//   const display = (v) => (val(v) ? v : <span className="not-set">NOT SET</span>);
//   const roundOptions = Array.from({ length: ROUND_LIMITS[mode].max }, (_, i) => i + 1);

//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <>
//       <style>{styles}</style>
//       <div className="fc-root">

//         <h1 className="fc-title">Find Your Colleges</h1>

//         {/* ── Overview table ── */}
//         {detailsLoading ? (
//           <div style={{ marginBottom: 24, display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "var(--color-text-muted)" }}>
//             <div className="fc-spinner" /> Loading your profile...
//           </div>
//         ) : (
//           <table className="fc-overview-table">
//             <thead>
//               <tr>
//                 <th>Home State</th>
//                 <th>Category</th>
//                 <th>Gender</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td className={!val(d.home_state) ? "not-set" : ""}>{display(d.home_state)}</td>
//                 <td className={!val(d.category) ? "not-set" : ""}>{display(d.category)}</td>
//                 <td className={!val(d.gender) ? "not-set" : ""}>{display(d.gender)}</td>
//               </tr>
//             </tbody>
//           </table>
//         )}

//         <div className="fc-form-card">

//           {/* ── Counselling type ── */}
//           <div className="fc-mode-row">
//             {[
//               { key: "TEST", locked: false },
//               { key: "JOSAA", locked: !josaaUnlocked },
//               { key: "CSAB", locked: !csabUnlocked },
//             ].map(({ key, locked }) => (
//               <button
//                 key={key}
//                 className={`fc-mode-btn${mode === key ? " active" : ""}${locked ? " locked" : ""}`}
//                 onClick={() => handleModeClick(key)}
//               >
//                 {locked && <LockIcon />}
//                 {key}
//               </button>
//             ))}
//           </div>

//           {/* ── Read-only rank display ── */}
//           <div className={`fc-rank-grid${mode === "TEST" ? " fc-rank-grid--single" : ""}`}>
//             {rankFields[mode].map(field => (
//               <div className="fc-field" key={field.label}>
//                 <label className="fc-label">{field.label}</label>
//                 <div className={`fc-rank-display${!val(field.value) ? " not-set" : ""}`}>
//                   {val(field.value) ? field.value : "NOT SET"}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* ── Generate button ── */}
//           <div className="fc-generate-row">
//             <button
//               className="fc-btn-generate"
//               onClick={handleGenerate}
//               disabled={loading || !canGenerate || generateCooldown > 0}
//             >
//               {loading ? (
//                 <><div className="fc-spinner" /> Searching...</>
//               ) : generateCooldown > 0 ? (
//                 <>{generateCooldown}s</>
//               ) : (
//                 <>
//                   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                     <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
//                   </svg>
//                   Generate
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* ── Error banner ── */}
//         {apiError && (
//           <div className="fc-error-banner">
//             <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
//               <circle cx="12" cy="12" r="10" />
//               <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
//             </svg>
//             {apiError}
//           </div>
//         )}

//         {/* ── Permanent warning ── */}
//         <div className="fc-warn-banner">
//           <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
//           </svg>
//           Don&apos;t forget to HIT Generate after Choosing Options
//         </div>

//         {/* ── Empty state ── */}
//         {!results && !loading && !apiError && (
//           <div className="fc-results">
//             <div className="fc-state-center">
//               <div className="fc-state-icon">
//                 <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
//                   <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
//                 </svg>
//               </div>
//               <p className="fc-state-text">No results yet</p>
//               <p className="fc-state-sub">Select your counselling type above and hit Generate.</p>
//             </div>
//           </div>
//         )}

//         {/* ── Filters + Results ── */}
//         {(results !== null || loading) && (
//           <>
//             {/* Filters card */}
//             <div className="fc-filters-card">
//               <p className="fc-filter-title fc-filter-title--mobile">Filters</p>
//               <div className="fc-filter-header" onClick={() => setFilterOpen(o => !o)}>
//                 <button
//                   className={`fc-filter-toggle-btn${filterOpen ? " open" : ""}`}
//                   aria-label={filterOpen ? "Collapse filters" : "Expand filters"}
//                   tabIndex={-1}
//                 >
//                   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>
//               </div>

//               <div className={`fc-filter-body${filterOpen ? " expanded" : " collapsed"}`}>
//                 <div className="fc-filter-groups">

//                   {/* College type */}
//                   <div className={mode === "TEST" && !testFiltersUnlocked ? "fc-filter-group-locked" : ""}>
//                     {mode === "TEST" && !testFiltersUnlocked && (
//                       <div
//                         className="fc-filter-group-locked-overlay"
//                         onClick={() => setPaywallFor("JOSAA and CSAB Counselling")}
//                         role="button"
//                         tabIndex={0}
//                         onKeyDown={e => e.key === "Enter" && setPaywallFor("JOSAA and CSAB Counselling")}
//                       >
//                         <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                           <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                           <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
//                         </svg>
//                         Locked
//                       </div>
//                     )}
//                     <p className="fc-filter-group-label">College Type</p>
//                     <div className="fc-checkbox-list">
//                       {COLLEGE_TYPES_PER_MODE[mode].map(label => (
//                         <label className="fc-checkbox-item" key={label}>
//                           <input
//                             type="checkbox"
//                             checked={collegeTypes[label] ?? false}
//                             onChange={() => toggleFilter(setCollegeTypes, label)}
//                             disabled={mode === "TEST" && !testFiltersUnlocked}
//                           />
//                           {label}
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Degree type */}
//                   <div>
//                     <p className="fc-filter-group-label">Degree Type</p>
//                     <div className="fc-checkbox-list">
//                       {DEGREE_OPTIONS.map(label => (
//                         <label className="fc-checkbox-item" key={label}>
//                           <input
//                             type="checkbox"
//                             checked={degreeTypes[label] ?? false}
//                             onChange={() => toggleFilter(setDegreeTypes, label)}
//                           />
//                           {label}
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Branch */}
//                   <div className={mode === "TEST" && !testFiltersUnlocked ? "fc-filter-group-locked" : ""}>
//                     {mode === "TEST" && !testFiltersUnlocked && (
//                       <div
//                         className="fc-filter-group-locked-overlay"
//                         onClick={() => setPaywallFor("JOSAA and CSAB Counselling")}
//                         role="button"
//                         tabIndex={0}
//                         onKeyDown={e => e.key === "Enter" && setPaywallFor("JOSAA and CSAB Counselling")}
//                       >
//                         <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                           <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                           <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
//                         </svg>
//                         Locked
//                       </div>
//                     )}
//                     <p className="fc-filter-group-label">Branch</p>
//                     <div className="fc-checkbox-list">
//                       {BRANCH_OPTIONS.map(label => (
//                         <label className="fc-checkbox-item" key={label}>
//                           <input
//                             type="checkbox"
//                             checked={branches[label] ?? false}
//                             onChange={() => toggleFilter(setBranches, label)}
//                             disabled={mode === "TEST" && !testFiltersUnlocked}
//                           />
//                           {label}
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                 </div>
//               </div>
//             </div>

//             {/* Results card */}
//             <div className="fc-results">
//               <div className="fc-results-header">
//                 {results && (
//                   <span className="fc-results-count">
//                     {totalCount} result{totalCount !== 1 ? "s" : ""}
//                   </span>
//                 )}
//               </div>

//               {/* Round selector + inline generate */}
//               {results && (
//                 <div className="fc-round-bar">
//                   <div className="fc-round-bar-left">
//                     <div className="fc-round-btns">
//                       {roundOptions.map(r => {
//                         const isRoundLocked = mode === "TEST" && r > 1 && !testFiltersUnlocked;
//                         return (
//                           <button
//                             key={r}
//                             className={`fc-round-btn${selectedRound === r ? " active" : ""}${isRoundLocked ? " locked" : ""}`}
//                             onClick={() => {
//                               if (isRoundLocked) { setPaywallFor("JOSAA and CSAB Counselling"); return; }
//                               setSelectedRound(r);
//                             }}
//                             title={isRoundLocked ? "Requires JOSAA or CSAB subscription" : `Round ${r}`}
//                           >
//                             <span className="round-full">Round {r}</span>
//                             <span className="round-short">R{r}</span>
//                             {isRoundLocked && (
//                               <span className="fc-round-lock">
//                                 <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                                   <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                                   <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
//                                 </svg>
//                               </span>
//                             )}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                   <button
//                     className="fc-btn-generate-inline"
//                     onClick={handleGenerate}
//                     disabled={loading || !canGenerate || generateCooldown > 0}
//                   >
//                     {loading ? (
//                       <><div className="fc-spinner" style={{ width: 13, height: 13 }} /> Searching...</>
//                     ) : generateCooldown > 0 ? (
//                       <>{generateCooldown}s</>
//                     ) : (
//                       <>
//                         <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                           <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
//                         </svg>
//                         Generate
//                       </>
//                     )}
//                   </button>
//                 </div>
//               )}

//               {/* Loading */}
//               {loading && (
//                 <div className="fc-loading-row">
//                   <div className="fc-spinner" />
//                   Analysing your rank across all institutes...
//                 </div>
//               )}

//               {/* Zero results */}
//               {!loading && results && results.length === 0 && (
//                 <div className="fc-state-center">
//                   <div className="fc-state-icon">
//                     <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
//                       <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
//                     </svg>
//                   </div>
//                   <p className="fc-state-text">No colleges found</p>
//                   <p className="fc-state-sub">Try adjusting your filters or selecting a different round.</p>
//                 </div>
//               )}

//               {/* Result rows */}
//               {!loading && results && results.length > 0 && (
//                 <>
//                   <div className="fc-table-head">
//                     <div className="fc-th">College</div>
//                     <div className="fc-th">Branch</div>
//                     <div className="fc-th">Category</div>
//                     <div className="fc-th">Probability</div>
//                     <div className="fc-th"></div>
//                   </div>

//                   {results.map((r, idx) => {
//                     const chanceClass = CHANCE_CLASS[r.probability] ?? "chance-verylow";
//                     const isExpanded = !!expanded[idx];

//                     return (
//                       <div key={idx} className="fc-result-row">
//                         <div className="fc-result-main">

//                           <div className="fc-college-cell">
//                             <span className="fc-college-name">{r.college_name}</span>
//                           </div>

//                           <div className="fc-branch-name">{r.branch}</div>

//                           <div className="fc-category-cell">
//                             <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', fontFamily: "'DM Mono', monospace", background: '#f1f5f9', padding: '3px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>
//                               {r.category ?? '—'}
//                             </span>
//                           </div>

//                           <div className="fc-badge-cell">
//                             <span className={`fc-chance-badge ${chanceClass}`}>
//                               {r.probability}
//                             </span>
//                           </div>

//                           {/* Mobile only: category + badge shown together */}
//                           <div className="fc-mobile-meta">
//                             <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', fontFamily: "'DM Mono', monospace", background: '#f1f5f9', padding: '3px 8px', borderRadius: 5 }}>
//                               {r.category ?? '—'}
//                             </span>
//                             <span className={`fc-chance-badge ${chanceClass}`}>
//                               {r.probability}
//                             </span>
//                           </div>

//                           <button
//                             className={`fc-expand-btn${isExpanded ? " open" : ""}`}
//                             onClick={() => toggleExpand(idx)}
//                             aria-label="Show historical cutoffs"
//                           >
//                             <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//                             </svg>
//                           </button>
//                         </div>

//                         {isExpanded && (
//                           <div className="fc-result-details">
//                             <div className="fc-result-details-inner">

//                               <table className="fc-cutoff-table">
//                                 <thead>
//                                   <tr>
//                                     <th>Year</th>
//                                     <th>Opening Rank</th>
//                                     <th>Closing Rank</th>
//                                     <th>Quota</th>
//                                     <th>Round</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {(r.opening != null && r.closing != null) ? (
//                                     <tr>
//                                       <td>{r.year}</td>
//                                       <td>{r.opening?.toLocaleString()}</td>
//                                       <td>{r.closing?.toLocaleString()}</td>
//                                       <td>{QUOTA_LABEL[r.quota] ?? r.quota ?? '—'}</td>
//                                       <td>R{r.round}</td>
//                                     </tr>
//                                   ) : (
//                                     <tr>
//                                       <td colSpan={5} style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontWeight: 400 }}>
//                                         Historical cutoff data not available
//                                       </td>
//                                     </tr>
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}

//                   {/* ── Pagination controls ── */}
//                   <div className="fc-pagination">
//                     <span className="fc-pagination-info">
//                       Page {page} of {totalPages} &nbsp;·&nbsp; {totalCount} result{totalCount !== 1 ? "s" : ""}
//                     </span>
//                     <div className="fc-pagination-btns">
//                       <button
//                         className="fc-page-btn"
//                         onClick={handlePrev}
//                         disabled={page === 1 || loading}
//                       >
//                         <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
//                         </svg>
//                         Back
//                       </button>
//                       <button
//                         className="fc-page-btn"
//                         onClick={handleNext}
//                         disabled={page === totalPages || loading}
//                       >
//                         Next
//                         <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </>
//         )}

//         {/* ── Paywall popup ── */}
//         {paywallFor && (
//           <div className="fc-overlay" onClick={() => setPaywallFor(null)}>
//             <div className="fc-popup" onClick={e => e.stopPropagation()}>
//               {/* <div className="fc-popup-icon">
//                 <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                   <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                   <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
//                 </svg>
//               </div> */}
//               <p className="fc-popup-title">Unlock {paywallFor}</p>
//               <p className="fc-popup-sub">
//                 {paywallFor === "JOSAA and CSAB Counselling"
//                   ? <>Access to <strong>JOSAA and CSAB Counselling</strong> predictions requires an active subscription. Upgrade to get full college predictor access.</>
//                   : <>Access to <strong>{paywallFor}</strong> counselling predictions requires an active subscription. Upgrade to get full college predictor access.</>
//                 }
//               </p>
//               <div className="fc-popup-actions">
//                 <button className="fc-popup-buy" onClick={() => { window.location.href = "/payments"; }}>
//                   View Plans &amp; Pricing
//                 </button>
//                 <button className="fc-popup-cancel" onClick={() => setPaywallFor(null)}>
//                   Maybe Later
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </>
//   );
// }








// "use client";

// import { useState, useEffect } from "react";
// import { auth } from "@/lib/firebase";
// import { getIdToken } from "firebase/auth";

// // ─────────────────────────────────────────────────────────────────────────────
// // ID MAPS — mirrors exactly what the backend uses.
// // Frontend stores label strings; IDs are only assembled at generate time.
// // ─────────────────────────────────────────────────────────────────────────────

// const COLLEGE_TYPE_MAP = {
//   IIT: 1001,
//   IIIT: 1002,
//   NIT: 1003,
//   "Other Govt": 1004,
// };

// const DEGREE_TYPE_MAP = {
//   "BTech (4 Years)": 2001,
//   "Dual - BTech+MTech (5 Years)": 2002,
// };

// const BRANCH_MAP = {
//   CSE: 3001,
//   Chemical: 3002,
//   Aerospace: 3003,
//   Aeronautical: 3004,
//   "AI": 3005,
//   "Data Science": 3006,
//   Civil: 3007,
//   ECE: 3008,
//   EEE: 3009,
//   Metallurgy: 3010,
//   Mechanical: 3011,
//   "Bio Technology": 3012,
//   Others: 3013,
// };

// // Valid modes (same set as backend VALID_MODE_IDS)
// const VALID_MODE_IDS = ["TEST", "JOSAA", "CSAB"];

// // Round limits per mode (mirrors backend ROUND_LIMITS)
// const ROUND_LIMITS = {
//   TEST: { min: 1, max: 6 },
//   JOSAA: { min: 1, max: 6 },
//   CSAB: { min: 1, max: 3 },
// };

// // College type labels shown per mode
// const COLLEGE_TYPES_PER_MODE = {
//   TEST: ["NIT", "IIIT", "Other Govt"],
//   JOSAA: ["IIT", "NIT", "IIIT", "Other Govt"],
//   CSAB: ["NIT", "IIIT", "Other Govt"],
// };

// const DEGREE_OPTIONS = Object.keys(DEGREE_TYPE_MAP);
// const BRANCH_OPTIONS = Object.keys(BRANCH_MAP);

// // API probability string → badge CSS class
// const CHANCE_CLASS = {
//   Strong: "chance-high",
//   Good: "chance-moderate",
//   Satisfactory: "chance-low",
//   Low: "chance-verylow",
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // CSS
// // ─────────────────────────────────────────────────────────────────────────────
// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

//   .fc-root {
//     padding: 32px 28px;
//     max-width: 960px;
//     margin: 0 auto;
//     font-family: 'DM Sans', sans-serif;
//   }

//   .fc-eyebrow {
//     font-size: 11px;
//     font-weight: 600;
//     letter-spacing: 0.12em;
//     text-transform: uppercase;
//     color: #94a3b8;
//     margin-bottom: 6px;
//   }

//   .fc-title {
//     font-family: 'Instrument Serif', Georgia, serif;
//     font-size: clamp(22px, 3vw, 32px);
//     font-weight: 600;
//     color: #0f172a;
//     line-height: 1.2;
//     margin-bottom: 6px;
//   }

//   .fc-subtitle {
//     font-size: 14px;
//     color: #64748b;
//     font-weight: 400;
//     margin-bottom: 24px;
//     line-height: 1.6;
//   }

//   /* ── Permanent warning banner ── */
//   .fc-warn-banner {
//     display: flex;
//     align-items: center;
//     gap: 10px;
//     background: #e0e0e0ff;
//     border-radius: 6px;
//     padding: 10px 14px;
//     margin-bottom: 20px;
//     font-size: 12.5px;
//     font-weight: 600;
//     color: #4e3120ff;
//     font-family: 'DM Sans', sans-serif;
//   }


//   .fc-form-card {
//     background: #ffffff;
//     border: 1px solid #e2e8f0;
//     border-radius: 10px;
//     padding: 22px;
//     box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
//     margin-bottom: 20px;
//   }

//   /* ── User overview table ── */
//   .fc-overview-table {
//     width: 100%;
//     border: 1px solid #e2e8f0;
//     border-radius: 8px;
//     border-collapse: separate;
//     border-spacing: 0;
//     overflow: hidden;
//     margin-bottom: 20px;
//     font-size: 13px;
//   }

//   .fc-overview-table th {
//     background: #f8fafc;
//     color: #94a3b8;
//     font-size: 10px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.08em;
//     padding: 9px 16px;
//     border-bottom: 1px solid #e2e8f0;
//     text-align: left;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-overview-table td {
//     padding: 11px 16px;
//     color: #1e293b;
//     font-weight: 600;
//     font-size: 13px;
//     background: white;
//   }

//   .fc-overview-table tr:last-child td { border-bottom: none; }

//   .fc-overview-table td.not-set {
//     color: #94a3b8;
//     font-weight: 400;
//     font-style: italic;
//   }

//   /* ── Section label ── */
//   .fc-section-label {
//     font-size: 10.5px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.09em;
//     color: #94a3b8;
//     margin-bottom: 10px;
//     font-family: 'DM Mono', monospace;
//   }

//   /* ── Mode row ── */
//   .fc-mode-row {
//     display: flex;
//     border: 1px solid #e2e8f0;
//     border-radius: 8px;
//     overflow: hidden;
//     margin-bottom: 22px;
//     background: #f8fafc;
//   }

//   .fc-mode-btn {
//     flex: 1;
//     padding: 11px 0;
//     font-size: 12.5px;
//     font-weight: 600;
//     border: none;
//     background: transparent;
//     cursor: pointer;
//     color: #94a3b8;
//     transition: all 0.15s ease;
//     letter-spacing: 0.04em;
//     font-family: 'DM Sans', sans-serif;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 6px;
//     position: relative;
//   }

//   .fc-mode-btn + .fc-mode-btn { border-left: 1px solid #e2e8f0; }

//   .fc-mode-btn.active {
//     background: #0f172a;
//     color: #f8fafc;
//   }

//   .fc-lock-icon {
//     opacity: 0.4;
//     display: flex;
//     align-items: center;
//   }

//   /* ── Rank fields ── */
//   .fc-rank-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 12px;
//     margin-bottom: 18px;
//   }

//   .fc-rank-grid--single {
//     grid-template-columns: 1fr;
//     max-width: 320px;
//   }

//   .fc-field {
//     display: flex;
//     flex-direction: column;
//     gap: 5px;
//   }

//   .fc-label {
//     font-size: 10px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.08em;
//     color: #94a3b8;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-rank-display {
//     height: 40px;
//     border: 1px solid #e2e8f0;
//     border-radius: 7px;
//     background: #f8fafc;
//     padding: 0 12px;
//     font-size: 13px;
//     font-weight: 600;
//     color: #1e293b;
//     display: flex;
//     align-items: center;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-rank-display.not-set {
//     color: #cbd5e1;
//     font-style: italic;
//     font-weight: 400;
//     font-family: 'DM Sans', sans-serif;
//   }

//   /* ── Generate row ── */
//   .fc-generate-row {
//     display: flex;
//     justify-content: flex-end;
//   }

//   .fc-btn-generate {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     background: #0f172a;
//     color: #f8fafc;
//     font-size: 13.5px;
//     font-weight: 600;
//     padding: 11px 26px;
//     border-radius: 7px;
//     border: none;
//     cursor: pointer;
//     transition: background 0.15s ease, transform 0.1s ease;
//     font-family: 'DM Sans', sans-serif;
//     letter-spacing: 0.01em;
//   }

//   .fc-btn-generate:hover { background: #1e293b; transform: translateY(-1px); }
//   .fc-btn-generate:active { transform: scale(0.97); }
//   .fc-btn-generate:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

//   /* ── Error banner ── */
//   .fc-error-banner {
//     background: #fef2f2;
//     border: 1px solid #fecaca;
//     border-left: 3px solid #ef4444;
//     border-radius: 6px;
//     padding: 11px 14px;
//     font-size: 13px;
//     font-weight: 500;
//     color: #991b1b;
//     margin-bottom: 16px;
//     display: flex;
//     align-items: flex-start;
//     gap: 8px;
//     line-height: 1.5;
//   }

//   /* ── Filters ── */
//   .fc-filters-card {
//     background: #ffffff;
//     border: 1px solid #e2e8f0;
//     border-radius: 10px;
//     padding: 18px 20px;
//     box-shadow: 0 1px 3px rgba(0,0,0,0.05);
//     margin-bottom: 16px;
//   }

//   .fc-filter-header {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     cursor: default;
//   }

//   .fc-filter-title {
//     font-size: 10.5px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.09em;
//     color: #94a3b8;
//     margin-bottom: 0;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-filter-toggle-btn {
//     display: none;
//     background: none;
//     border: none;
//     cursor: pointer;
//     padding: 4px;
//     color: #94a3b8;
//     transition: transform 0.2s ease;
//     flex-shrink: 0;
//   }

//   .fc-filter-toggle-btn.open { transform: rotate(180deg); }
//   .fc-filter-body { margin-top: 14px; }

//   .fc-filter-groups {
//     display: grid;
//     grid-template-columns: repeat(3, 1fr);
//     gap: 20px;
//   }

//   .fc-filter-group-label {
//     font-size: 10px;
//     font-weight: 800;
//     text-transform: uppercase;
//     letter-spacing: 0.08em;
//     color: #000000ff;
//     margin-bottom: 9px;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-checkbox-list {
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
//   }

//   .fc-checkbox-item {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     font-size: 13px;
//     font-weight: 500;
//     color: #334155;
//     cursor: pointer;
//     user-select: none;
//   }

//   .fc-checkbox-item:hover { color: #0f172a; }

//   .fc-checkbox-item input[type="checkbox"] {
//     accent-color: #0f172a;
//     width: 14px;
//     height: 14px;
//     flex-shrink: 0;
//     cursor: pointer;
//   }

//   /* ── Round selector ── */
//   .fc-round-bar {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     gap: 12px;
//     padding: 12px 20px;
//     border-bottom: 1px solid #f1f5f9;
//     flex-wrap: wrap;
//   }

//   .fc-round-bar-left {
//     display: flex;
//     align-items: center;
//     gap: 12px;
//     flex-wrap: wrap;
//   }

//   .fc-round-label {
//     font-size: 10px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.09em;
//     color: #94a3b8;
//     white-space: nowrap;
//     flex-shrink: 0;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-round-btns {
//     display: flex;
//     border: 1px solid #e2e8f0;
//     border-radius: 7px;
//     overflow: hidden;
//     background: white;
//   }

//   .fc-round-btn {
//     padding: 6px 14px;
//     font-size: 12px;
//     font-weight: 600;
//     border: none;
//     border-right: 1px solid #e2e8f0;
//     background: transparent;
//     cursor: pointer;
//     color: #94a3b8;
//     transition: all 0.12s ease;
//     font-family: 'DM Sans', sans-serif;
//     white-space: nowrap;
//     letter-spacing: 0.02em;
//   }

//   .fc-round-btn:last-child { border-right: none; }
//   .fc-round-btn.active { background: #0f172a; color: white; }
//   .fc-round-btn:hover:not(.active) { background: #f1f5f9; color: #334155; }

//   /* Inline generate button inside round bar */
//   .fc-btn-generate-inline {
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     background: #0f172a;
//     color: #f8fafc;
//     font-size: 12px;
//     font-weight: 600;
//     padding: 7px 16px;
//     border-radius: 7px;
//     border: none;
//     cursor: pointer;
//     transition: background 0.15s ease, transform 0.1s ease;
//     font-family: 'DM Sans', sans-serif;
//     white-space: nowrap;
//     flex-shrink: 0;
//   }

//   .fc-btn-generate-inline:hover { background: #1e293b; transform: translateY(-1px); }
//   .fc-btn-generate-inline:active { transform: scale(0.97); }
//   .fc-btn-generate-inline:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

//   /* ── Results ── */
//   .fc-results {
//     background: #ffffff;
//     border: 1px solid #e2e8f0;
//     border-radius: 10px;
//     box-shadow: 0 1px 3px rgba(0,0,0,0.05);
//     overflow: hidden;
//   }

//   .fc-results-header {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     padding: 13px 20px;
//     border-bottom: 1px solid #f1f5f9;
//     background: #fafafa;
//   }

//   .fc-results-title {
//     font-size: 11px;
//     font-weight: 600;
//     color: #475569;
//     text-transform: uppercase;
//     letter-spacing: 0.07em;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-results-count {
//     font-size: 11px;
//     font-weight: 600;
//     color: #64748b;
//     background: #f1f5f9;
//     padding: 3px 10px;
//     border-radius: 20px;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-table-head {
//     display: grid;
//     grid-template-columns: 2fr 2fr 100px 100px 36px;
//     padding: 9px 20px;
//     border-bottom: 1px solid #f1f5f9;
//   }

//   .fc-th {
//     font-size: 11.5px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.09em;
//     color: #94a3b8;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-result-row { border-bottom: 1px solid #f8fafc; overflow: hidden; }
//   .fc-result-row:last-child { border-bottom: none; }

//   .fc-result-main {
//     display: grid;
//     grid-template-columns: 2fr 2fr 100px 100px 36px;
//     align-items: center;
//     padding: 13px 20px;
//     transition: background 0.1s ease;
//   }

//   .fc-result-row:hover .fc-result-main { background: #fdfdfdff; }

//   .fc-college-cell { display: flex; align-items: center; gap: 10px; }



//   .fc-college-name {
//     font-size: 13px;
//     font-weight: 600;
//     color: #0f172a;
//     line-height: 1.3;
//   }

//   .fc-branch-name {
//     font-size: 12.5px;
//     font-weight: 400;
//     color: #64748b;
//     padding-right: 10px;
//     line-height: 1.4;
//   }

//   .fc-chance-badge {
//     font-size: 10px;
//     font-weight: 700;
//     padding: 4px 10px;
//     border-radius: 20px;
//     width: fit-content;
//     white-space: nowrap;
//     letter-spacing: 0.03em;
//     text-transform: uppercase;
//     font-family: 'DM Mono', monospace;
//   }

//   .chance-high     { background: #dcfce7; color: #166534; }
//   .chance-moderate { background: #fef9c3; color: #854d0e; }
//   .chance-low      { background: #ffedd5; color: #9a3412; }
//   .chance-verylow  { background: #fee2e2; color: #991b1b; }

//   .fc-expand-btn {
//     width: 26px; height: 26px;
//     border-radius: 6px;
//     border: 1px solid #e2e8f0;
//     background: white;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     cursor: pointer;
//     color: #94a3b8;
//     transition: all 0.12s ease;
//     justify-self: center;
//   }

//   .fc-expand-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #475569; }
//   .fc-expand-btn.open { transform: rotate(180deg); }

//   .fc-result-details {
//     padding: 0 20px 16px 58px;
//     animation: detailOpen 0.15s ease-out both;
//     background: #fafafa;
//     border-top: 1px solid #f1f5f9;
//   }

//   .fc-result-details-inner { padding-top: 14px; }

//   .fc-cutoff-table {
//     width: 100%;
//     border-collapse: separate;
//     border-spacing: 0;
//     border: 1px solid #e2e8f0;
//     border-radius: 7px;
//     overflow: hidden;
//     font-size: 12px;
//   }

//   .fc-cutoff-table th {
//     background: #f8fafc;
//     padding: 7px 12px;
//     text-align: left;
//     font-size: 9.5px;
//     font-weight: 600;
//     text-transform: uppercase;
//     letter-spacing: 0.08em;
//     color: #94a3b8;
//     border-bottom: 1px solid #e2e8f0;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-cutoff-table td {
//     padding: 8px 12px;
//     font-weight: 500;
//     color: #334155;
//     border-bottom: 1px solid #f8fafc;
//     font-family: 'DM Mono', monospace;
//   }

//   .fc-cutoff-table tr:last-child td { border-bottom: none; }

//   @keyframes detailOpen {
//     from { opacity: 0; transform: translateY(-4px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }

//   /* Empty / loading */
//   .fc-state-center { padding: 52px 20px; text-align: center; }

//   .fc-state-icon {
//     width: 44px; height: 44px;
//     background: #f8fafc;
//     border: 1px solid #e2e8f0;
//     border-radius: 10px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     margin: 0 auto 12px;
//     color: #94a3b8;
//   }

//   .fc-state-text { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 4px; }
//   .fc-state-sub  { font-size: 12.5px; color: #94a3b8; font-weight: 400; }

//   .fc-spinner {
//     width: 16px; height: 16px;
//     border: 2px solid #e2e8f0;
//     border-top-color: #0f172a;
//     border-radius: 50%;
//     animation: spin 0.7s linear infinite;
//     display: inline-block;
//     flex-shrink: 0;
//   }

//   .fc-loading-row {
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 10px;
//     padding: 44px 20px;
//     font-size: 13px;
//     font-weight: 500;
//     color: #64748b;
//   }

//   @keyframes spin { to { transform: rotate(360deg); } }

//   /* ── Paywall Popup ── */
//   .fc-overlay {
//     position: fixed;
//     inset: 0;
//     background: rgba(15,23,42,0.5);
//     z-index: 1000;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     padding: 20px;
//     backdrop-filter: blur(2px);
//   }

//   .fc-popup {
//     background: white;
//     border-radius: 12px;
//     padding: 32px 28px;
//     max-width: 380px;
//     width: 100%;
//     box-shadow: 0 20px 60px rgba(0,0,0,0.15);
//     text-align: center;
//     animation: popIn 0.2s ease-out both;
//     border: 1px solid #e2e8f0;
//   }

//   @keyframes popIn {
//     from { opacity: 0; transform: scale(0.94) translateY(8px); }
//     to   { opacity: 1; transform: scale(1) translateY(0); }
//   }

//   .fc-popup-icon {
//     width: 48px; height: 48px;
//     background: #fef3c7;
//     border-radius: 10px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     margin: 0 auto 16px;
//     color: #d97706;
//   }

//   .fc-popup-title {
//     font-family: 'Instrument Serif', Georgia, serif;
//     font-size: 20px;
//     font-weight: 400;
//     color: #0f172a;
//     margin-bottom: 8px;
//   }

//   .fc-popup-sub {
//     font-size: 13px;
//     color: #64748b;
//     font-weight: 400;
//     margin-bottom: 22px;
//     line-height: 1.6;
//   }

//   .fc-popup-actions { display: flex; flex-direction: column; gap: 8px; }

//   .fc-popup-buy {
//     background: #0f172a;
//     color: white;
//     font-size: 13.5px;
//     font-weight: 600;
//     padding: 12px 20px;
//     border-radius: 7px;
//     border: none;
//     cursor: pointer;
//     font-family: 'DM Sans', sans-serif;
//     transition: background 0.15s ease;
//   }

//   .fc-popup-buy:hover { background: #1e293b; }

//   .fc-popup-cancel {
//     background: none;
//     border: 1px solid #e2e8f0;
//     color: #64748b;
//     font-size: 13px;
//     font-weight: 500;
//     padding: 10px 20px;
//     border-radius: 7px;
//     cursor: pointer;
//     font-family: 'DM Sans', sans-serif;
//     transition: background 0.12s ease;
//   }

//   .fc-popup-cancel:hover { background: #f8fafc; }

//   /* ── Responsive ── */
//   @media (max-width: 768px) {
//     .fc-root { padding: 20px 16px; }
//     .fc-rank-grid { grid-template-columns: 1fr; }
//     .fc-filter-groups { grid-template-columns: 1fr 1fr; }
//     .fc-generate-row { justify-content: stretch; }
//     .fc-btn-generate { width: 100%; justify-content: center; }
//     .fc-table-head { display: none; }

//     /* Mobile: 2-row card layout for results */
//     .fc-result-main {
//       display: grid;
//       grid-template-columns: 1fr auto;
//       grid-template-rows: auto auto auto;
//       gap: 4px 8px;
//       padding: 12px 16px;
//     }

//     /* Row 1: college name + expand button */
//     .fc-college-cell  { grid-column: 1; grid-row: 1; min-width: 0; }
//     .fc-expand-btn    { grid-column: 2; grid-row: 1; align-self: start; margin-top: 2px; }

//     /* Row 2: branch (full width) */
//     .fc-branch-name   {
//       grid-column: 1 / 3;
//       grid-row: 2;
//       font-size: 11.5px;
//       padding-right: 0;
//       color: #64748b;
//     }

//     /* Row 3: quota tag + chance badge side by side */
//     .fc-mobile-meta {
//       grid-column: 1 / 3;
//       grid-row: 3;
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       flex-wrap: wrap;
//       margin-top: 2px;
//     }

//     /* Hide individual quota/badge cells — shown via fc-mobile-meta instead */
//     .fc-quota-cell  { display: none; }
//     .fc-badge-cell  { display: none; }

//     .fc-result-details { padding-left: 16px; }

//     .fc-overview-table th,
//     .fc-overview-table td { padding: 8px 12px; font-size: 12px; }

//     .fc-mode-btn { font-size: 12px; padding: 10px 0; }

//     .fc-filter-header { cursor: pointer; }
//     .fc-filter-toggle-btn { display: flex; }
//     .fc-filter-body { margin-top: 0; }
//     .fc-filter-body.collapsed { display: none; }
//     .fc-filter-body.expanded {
//       display: block;
//       margin-top: 14px;
//       animation: detailOpen 0.15s ease-out both;
//     }

//     .fc-round-btn .round-full  { display: none; }
//     .fc-round-btn .round-short { display: inline; }
//     .fc-round-btn { padding: 6px 10px; }
//     .fc-round-bar { gap: 8px; padding: 10px 16px; }
//     .fc-btn-generate-inline { font-size: 11px; padding: 6px 12px; }
//   }

//   @media (min-width: 769px) {
//     .fc-round-btn .round-full  { display: inline; }
//     .fc-round-btn .round-short { display: none; }
//     .fc-filter-body.collapsed,
//     .fc-filter-body.expanded { display: block; margin-top: 14px; }

//     /* Desktop: quota + badge shown in their grid columns */
//     .fc-mobile-meta { display: none; }
//     .fc-quota-cell  { display: block; }
//     .fc-badge-cell  { display: block; }
//   }

//   @media (max-width: 480px) {
//     .fc-filter-groups { grid-template-columns: 1fr; }
//     .fc-popup { padding: 24px 18px; }
//     .fc-round-btn { padding: 6px 8px; font-size: 11px; }
//     .fc-round-bar { flex-wrap: wrap; row-gap: 8px; }
//     .fc-btn-generate-inline { width: 100%; justify-content: center; }
//   }
// `;

// // ─────────────────────────────────────────────────────────────────────────────
// // Small components
// // ─────────────────────────────────────────────────────────────────────────────
// const LockIcon = () => (
//   <span className="fc-lock-icon">
//     <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
//       <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//       <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
//     </svg>
//   </span>
// );

// const CollegeIcon = ({ isIIT }) => (
//   <div className="fc-college-icon">
//     {/* {isIIT ? (
//       <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round"
//           d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//       </svg>
//     ) : (
//       <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//         <path d="M12 14l9-5-9-5-9 5 9 5z" />
//         <path strokeLinecap="round"
//           d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055" />
//       </svg>
//     )} */}
//   </div>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // Utility helpers
// // ─────────────────────────────────────────────────────────────────────────────

// // Truthy value: non-empty, non-zero string/number
// const val = (v) =>
//   v !== undefined && v !== null && String(v).trim() !== "" && String(v) !== "0"
//     ? v
//     : null;

// const buildCheckboxState = (keys) => Object.fromEntries(keys.map(k => [k, false]));

// // Convert checked-label map → array of backend IDs
// // e.g. { CSE: true, ECE: false } + BRANCH_MAP → [3001]
// function checkedToIds(checkedObj, idMap) {
//   return Object.entries(checkedObj)
//     .filter(([, isChecked]) => isChecked)
//     .map(([label]) => idMap[label])
//     .filter(Boolean);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Main page component
// // ─────────────────────────────────────────────────────────────────────────────
// export default function FindCollegePage() {

//   // ── Core UI state ─────────────────────────────────────────────────────────
//   const [mode, setMode] = useState("JOSAA");
//   const [selectedRound, setSelectedRound] = useState(1);

//   // ── User profile (fetched once on mount) ──────────────────────────────────
//   const [userDetails, setUserDetails] = useState(null);
//   const [detailsLoading, setDetailsLoading] = useState(true);

//   // ── Filter checkboxes — store labels; IDs resolved at generate time ───────
//   const [collegeTypes, setCollegeTypes] = useState(() => buildCheckboxState(COLLEGE_TYPES_PER_MODE["JOSAA"]));
//   const [degreeTypes, setDegreeTypes] = useState(() => buildCheckboxState(DEGREE_OPTIONS));
//   const [branches, setBranches] = useState(() => buildCheckboxState(BRANCH_OPTIONS));
//   const [filterOpen, setFilterOpen] = useState(false);

//   // ── Results & loading ─────────────────────────────────────────────────────
//   const [results, setResults] = useState(null);   // null = not yet fetched
//   const [loading, setLoading] = useState(false);
//   const [apiError, setApiError] = useState(null);
//   const [expanded, setExpanded] = useState({});     // row expand state

//   // ── Paywall ───────────────────────────────────────────────────────────────
//   const [paywallFor, setPaywallFor] = useState(null);

//   // ── Fetch user profile on mount ───────────────────────────────────────────
//   useEffect(() => {
//     async function fetchDetails() {
//       try {
//         const user = auth.currentUser;
//         if (!user) { setUserDetails({}); setDetailsLoading(false); return; }

//         const jwt = await getIdToken(user);
//         const res = await fetch("/api/fetch_user_details", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ jwt }),
//         });
//         const data = await res.json();
//         setUserDetails(data);
//       } catch (e) {
//         console.error("Failed to fetch user details", e);
//         setUserDetails({});
//       } finally {
//         setDetailsLoading(false);
//       }
//     }
//     fetchDetails();
//   }, []);

//   // ── Subscription flags ────────────────────────────────────────────────────
//   const josaaUnlocked = userDetails?.josaa_credits === true;
//   const csabUnlocked = userDetails?.csab_credits === true;
//   const testUnlocked = josaaUnlocked || csabUnlocked;

//   // ── Mode switch: reset filters + results ─────────────────────────────────
//   function handleModeClick(m) {
//     const isLocked =
//       (m === "TEST" && !testUnlocked) ||
//       (m === "JOSAA" && !josaaUnlocked) ||
//       (m === "CSAB" && !csabUnlocked);

//     if (isLocked) { setPaywallFor(m); return; }

//     setMode(m);
//     setCollegeTypes(buildCheckboxState(COLLEGE_TYPES_PER_MODE[m]));
//     setSelectedRound(1);
//     setResults(null);
//     setApiError(null);
//     setExpanded({});
//   }

//   // ── Filter / expand toggles ───────────────────────────────────────────────
//   function toggleFilter(setter, key) {
//     setter(prev => ({ ...prev, [key]: !prev[key] }));
//   }

//   function toggleExpand(idx) {
//     setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
//   }

//   // ── Build API payload — called ONLY by handleGenerate ────────────────────
//   // Checkbox/round changes only update local state, not the API.
//   function buildPayload(jwt) {
//     const collegeIds = checkedToIds(collegeTypes, COLLEGE_TYPE_MAP);
//     const degreeIds = checkedToIds(degreeTypes, DEGREE_TYPE_MAP);
//     const branchIds = checkedToIds(branches, BRANCH_MAP);

//     return {
//       jwt,
//       mode,
//       round: selectedRound,
//       // Only include a filter key if the user actually selected something.
//       // Absent key = "no restriction on this dimension".
//       ...(collegeIds.length > 0 && { college_type: collegeIds }),
//       ...(degreeIds.length > 0 && { degree_type: degreeIds }),
//       ...(branchIds.length > 0 && { branch: branchIds }),
//     };
//   }

//   // ── Generate: hit /api/college_search ────────────────────────────────────
//   async function handleGenerate() {
//     setLoading(true);
//     setResults(null);
//     setApiError(null);
//     setExpanded({});

//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         setApiError("You must be logged in to search colleges.");
//         setLoading(false);
//         return;
//       }

//       const jwt = await getIdToken(user);
//       const payload = buildPayload(jwt);

//       const res = await fetch("/api/college_search", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setApiError(data?.error ?? `Server error (${res.status})`);
//         return;
//       }

//       setResults(data.results ?? []);
//     } catch (e) {
//       console.error("[handleGenerate]", e);
//       setApiError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ── canGenerate: mode must be unlocked AND at least one rank must be set ──
//   const modeUnlocked =
//     (mode === "TEST" && testUnlocked) ||
//     (mode === "JOSAA" && josaaUnlocked) ||
//     (mode === "CSAB" && csabUnlocked);

//   const d = userDetails || {};

//   const rankFields = {
//     TEST: [{ label: "Test Mains CRL (estimated only)", value: d.test_mains_crl }],
//     JOSAA: [
//       { label: "Mains CRL Rank", value: d.crl_mains_rank },
//       { label: "Mains Category Rank", value: d.category_mains_rank },
//       { label: "Advanced CRL Rank", value: d.crl_adv_rank },
//       { label: "Advanced Category Rank", value: d.category_adv_rank },
//     ],
//     CSAB: [
//       { label: "Mains CRL Rank", value: d.crl_mains_rank },
//       { label: "Mains Category Rank", value: d.category_mains_rank },
//     ],
//   };

//   const canGenerate = modeUnlocked && rankFields[mode]?.some(f => val(f.value));

//   const display = (v) => (val(v) ? v : <span className="not-set">NOT SET</span>);

//   // Round buttons for the current mode
//   const roundOptions = Array.from({ length: ROUND_LIMITS[mode].max }, (_, i) => i + 1);

//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <>
//       <style>{styles}</style>
//       <div className="fc-root">

//         <h1 className="fc-title">Find Your Colleges</h1>



//         {/* ── Overview table ── */}
//         {detailsLoading ? (
//           <div style={{ marginBottom: 24, display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "var(--color-text-muted)" }}>
//             <div className="fc-spinner" /> Loading your profile...
//           </div>
//         ) : (
//           <table className="fc-overview-table">
//             <thead>
//               <tr>
//                 <th>Home State</th>
//                 <th>Category</th>
//                 <th>Gender</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td className={!val(d.home_state) ? "not-set" : ""}>{display(d.home_state)}</td>
//                 <td className={!val(d.category) ? "not-set" : ""}>{display(d.category)}</td>
//                 <td className={!val(d.gender) ? "not-set" : ""}>{display(d.gender)}</td>
//               </tr>
//             </tbody>
//           </table>
//         )}

//         <div className="fc-form-card">

//           {/* ── Counselling type ── */}
//           <div className="fc-mode-row">
//             {[
//               { key: "TEST", locked: !testUnlocked },
//               { key: "JOSAA", locked: !josaaUnlocked },
//               { key: "CSAB", locked: !csabUnlocked },
//             ].map(({ key, locked }) => (
//               <button
//                 key={key}
//                 className={`fc-mode-btn${mode === key ? " active" : ""}${locked ? " locked" : ""}`}
//                 onClick={() => handleModeClick(key)}
//               >
//                 {locked && <LockIcon />}
//                 {key}
//               </button>
//             ))}
//           </div>

//           {/* ── Read-only rank display ── */}
//           <div className={`fc-rank-grid${mode === "TEST" ? " fc-rank-grid--single" : ""}`}>
//             {rankFields[mode].map(field => (
//               <div className="fc-field" key={field.label}>
//                 <label className="fc-label">{field.label}</label>
//                 <div className={`fc-rank-display${!val(field.value) ? " not-set" : ""}`}>
//                   {val(field.value) ? field.value : "NOT SET"}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* ── Generate button ── */}
//           <div className="fc-generate-row">
//             <button
//               className="fc-btn-generate"
//               onClick={handleGenerate}
//               disabled={loading || !canGenerate}
//             >
//               {loading ? (
//                 <><div className="fc-spinner" /> Searching...</>
//               ) : (
//                 <>
//                   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                     <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
//                   </svg>
//                   Generate
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* ── Error banner ── */}
//         {apiError && (
//           <div className="fc-error-banner">
//             <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
//               <circle cx="12" cy="12" r="10" />
//               <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
//             </svg>
//             {apiError}
//           </div>
//         )}

//         {/* ── Permanent warning ── */}
//         <div className="fc-warn-banner">
//           <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
//           </svg>
//           Don't forget to HIT Generate after Choosing Options
//         </div>

//         {/* ── Empty state ── */}
//         {!results && !loading && !apiError && (
//           <div className="fc-results">
//             <div className="fc-state-center">
//               <div className="fc-state-icon">
//                 <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
//                   <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
//                 </svg>
//               </div>
//               <p className="fc-state-text">No results yet</p>
//               <p className="fc-state-sub">Select your counselling type above and hit Generate.</p>
//             </div>
//           </div>
//         )}



//         {/* ── Filters + Results (only visible after Generate is hit) ── */}
//         {(results !== null || loading) && (
//           <>
//             {/* Filters card */}
//             <div className="fc-filters-card">
//               <div className="fc-filter-header" onClick={() => setFilterOpen(o => !o)}>
//                 {/* <p className="fc-filter-title">Filters</p> */}
//                 <button
//                   className={`fc-filter-toggle-btn${filterOpen ? " open" : ""}`}
//                   aria-label={filterOpen ? "Collapse filters" : "Expand filters"}
//                   tabIndex={-1}
//                 >
//                   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>
//               </div>

//               <div className={`fc-filter-body${filterOpen ? " expanded" : " collapsed"}`}>
//                 <div className="fc-filter-groups">

//                   {/* College type — varies per mode */}
//                   <div>
//                     <p className="fc-filter-group-label">College Type</p>
//                     <div className="fc-checkbox-list">
//                       {COLLEGE_TYPES_PER_MODE[mode].map(label => (
//                         <label className="fc-checkbox-item" key={label}>
//                           <input
//                             type="checkbox"
//                             checked={collegeTypes[label] ?? false}
//                             onChange={() => toggleFilter(setCollegeTypes, label)}
//                           />
//                           {label}
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Degree type */}
//                   <div>
//                     <p className="fc-filter-group-label">Degree Type</p>
//                     <div className="fc-checkbox-list">
//                       {DEGREE_OPTIONS.map(label => (
//                         <label className="fc-checkbox-item" key={label}>
//                           <input
//                             type="checkbox"
//                             checked={degreeTypes[label] ?? false}
//                             onChange={() => toggleFilter(setDegreeTypes, label)}
//                           />
//                           {label}
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Branch */}
//                   <div>
//                     <p className="fc-filter-group-label">Branch</p>
//                     <div className="fc-checkbox-list">
//                       {BRANCH_OPTIONS.map(label => (
//                         <label className="fc-checkbox-item" key={label}>
//                           <input
//                             type="checkbox"
//                             checked={branches[label] ?? false}
//                             onChange={() => toggleFilter(setBranches, label)}
//                           />
//                           {label}
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                 </div>
//               </div>
//             </div>

//             {/* Results card */}
//             <div className="fc-results">
//               <div className="fc-results-header">
//                 {/* <span className="fc-results-title">College Name &nbsp;/&nbsp; Branch Name</span> */}
//                 {results && (
//                   <span className="fc-results-count">
//                     {results.length} result{results.length !== 1 ? "s" : ""}
//                   </span>
//                 )}
//               </div>

//               {/* Round selector — shown once results are loaded */}
//               {results && (
//                 <div className="fc-round-bar">
//                   <div className="fc-round-bar-left">
//                     {/* <span className="fc-round-label">Round</span> */}
//                     <div className="fc-round-btns">
//                       {roundOptions.map(r => (
//                         <button
//                           key={r}
//                           className={`fc-round-btn${selectedRound === r ? " active" : ""}`}
//                           onClick={() => setSelectedRound(r)}
//                           title={`Round ${r}`}
//                         >
//                           <span className="round-full">Round {r}</span>
//                           <span className="round-short">R{r}</span>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                   <button
//                     className="fc-btn-generate-inline"
//                     onClick={handleGenerate}
//                     disabled={loading || !canGenerate}
//                   >
//                     {loading ? (
//                       <><div className="fc-spinner" style={{ width: 13, height: 13 }} /> Searching...</>
//                     ) : (
//                       <>
//                         <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                           <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
//                         </svg>
//                         Generate
//                       </>
//                     )}
//                   </button>
//                 </div>
//               )}

//               {/* Loading */}
//               {loading && (
//                 <div className="fc-loading-row">
//                   <div className="fc-spinner" />
//                   Analysing your rank across all institutes...
//                 </div>
//               )}

//               {/* Zero results */}
//               {!loading && results && results.length === 0 && (
//                 <div className="fc-state-center">
//                   <div className="fc-state-icon">
//                     <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
//                       <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
//                     </svg>
//                   </div>
//                   <p className="fc-state-text">No colleges found</p>
//                   <p className="fc-state-sub">Try adjusting your filters or selecting a different round.</p>
//                 </div>
//               )}

//               {/* Result rows */}
//               {!loading && results && results.length > 0 && (
//                 <>
//                   <div className="fc-table-head">
//                     <div className="fc-th">College</div>
//                     <div className="fc-th">Branch</div>
//                     <div className="fc-th">Quota</div>
//                     <div className="fc-th">Probability</div>
//                     <div className="fc-th"></div>
//                   </div>

//                   {results.map((r, idx) => {
//                     const isIIT = r.college_name?.toLowerCase().includes("iit");
//                     const chanceClass = CHANCE_CLASS[r.probability] ?? "chance-verylow";
//                     const isExpanded = !!expanded[idx];

//                     return (
//                       <div key={idx} className="fc-result-row">
//                         <div className="fc-result-main">

//                           <div className="fc-college-cell">
//                             <span className="fc-college-name">{r.college_name}</span>
//                           </div>

//                           <div className="fc-branch-name">{r.branch}</div>

//                           <div className="fc-quota-cell">
//                             <span style={{ fontSize: 11, fontWeight: 800, color: '#272c33ff', fontFamily: "'DM Mono', monospace" }}>
//                               {r.category ?? '—'}
//                             </span>
//                           </div>

//                           <div className="fc-badge-cell">
//                             <span className={`fc-chance-badge ${chanceClass}`}>
//                               {r.probability}
//                             </span>
//                           </div>

//                           {/* Mobile only: quota + badge shown together */}
//                           <div className="fc-mobile-meta">
//                             <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', fontFamily: "'DM Mono', monospace", background: '#f1f5f9', padding: '3px 8px', borderRadius: 5 }}>
//                               {r.category ?? '—'}
//                             </span>
//                             <span className={`fc-chance-badge ${chanceClass}`}>
//                               {r.probability}
//                             </span>
//                           </div>

//                           <button
//                             className={`fc-expand-btn${isExpanded ? " open" : ""}`}
//                             onClick={() => toggleExpand(idx)}
//                             aria-label="Show historical cutoffs"
//                           >
//                             <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//                             </svg>
//                           </button>
//                         </div>

//                         {isExpanded && (
//                           <div className="fc-result-details">
//                             <div className="fc-result-details-inner">
//                               <table className="fc-cutoff-table">
//                                 <thead>
//                                   <tr>
//                                     <th>Year</th>
//                                     <th>Opening Rank</th>
//                                     <th>Closing Rank</th>
//                                     <th>Round</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {(r.opening != null && r.closing != null) ? (
//                                     <tr>
//                                       <td>{r.year}</td>
//                                       <td>{r.opening?.toLocaleString()}</td>
//                                       <td>{r.closing?.toLocaleString()}</td>
//                                       <td>R{r.round}</td>
//                                     </tr>
//                                   ) : (
//                                     <tr>
//                                       <td colSpan={4} style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontWeight: 400 }}>
//                                         Historical cutoff data not available
//                                       </td>
//                                     </tr>
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </>
//               )}
//             </div>
//           </>
//         )}

//         {/* ── Paywall popup ── */}
//         {paywallFor && (
//           <div className="fc-overlay" onClick={() => setPaywallFor(null)}>
//             <div className="fc-popup" onClick={e => e.stopPropagation()}>
//               <div className="fc-popup-icon">
//                 <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                   <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                   <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
//                 </svg>
//               </div>
//               <p className="fc-popup-title">Unlock {paywallFor}</p>
//               <p className="fc-popup-sub">
//                 Access to <strong>{paywallFor}</strong> counselling predictions requires an active subscription.
//                 Upgrade to get full college predictor access.
//               </p>
//               <div className="fc-popup-actions">
//                 <button className="fc-popup-buy" onClick={() => { window.location.href = "/payments"; }}>
//                   View Plans &amp; Pricing
//                 </button>
//                 <button className="fc-popup-cancel" onClick={() => setPaywallFor(null)}>
//                   Maybe Later
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </>
//   );
// }



"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";

// ─────────────────────────────────────────────────────────────────────────────
// ID MAPS — mirrors exactly what the backend uses.
// Frontend stores label strings; IDs are only assembled at generate time.
// ─────────────────────────────────────────────────────────────────────────────

const COLLEGE_TYPE_MAP = {
  IIT: 1001,
  IIIT: 1002,
  NIT: 1003,
  "Other Govt": 1004,
};

const DEGREE_TYPE_MAP = {
  "BTech (4 Years)": 2001,
  "Dual - BTech+MTech (5 Years)": 2002,
};

const BRANCH_MAP = {
  CSE: 3001,
  Chemical: 3002,
  Aerospace: 3003,
  Aeronautical: 3004,
  "AI": 3005,
  "Data Science": 3006,
  Civil: 3007,
  ECE: 3008,
  EEE: 3009,
  Metallurgy: 3010,
  Mechanical: 3011,
  "Bio Technology": 3012
};

const VALID_MODE_IDS = ["TEST", "JOSAA", "CSAB"];

const ROUND_LIMITS = {
  TEST: { min: 1, max: 6 },
  JOSAA: { min: 1, max: 6 },
  CSAB: { min: 1, max: 3 },
};

const COLLEGE_TYPES_PER_MODE = {
  TEST: ["NIT", "IIIT", "Other Govt"],
  JOSAA: ["IIT", "NIT", "IIIT", "Other Govt"],
  CSAB: ["NIT", "IIIT", "Other Govt"],
};

const DEGREE_OPTIONS = Object.keys(DEGREE_TYPE_MAP);
const BRANCH_OPTIONS = Object.keys(BRANCH_MAP);

const CHANCE_CLASS = {
  Strong: "chance-high",
  Good: "chance-moderate",
  Satisfactory: "chance-low",
  Low: "chance-verylow",
};

const QUOTA_LABEL = {
  HS: "Home State",
  OS: "Other State",
  AI: "All India",
};


// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  .fc-root {
    padding: 32px 28px;
    max-width: 960px;
    margin: 0 auto;
    font-family: 'DM Sans', sans-serif;
  }

  .fc-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  .fc-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 600;
    color: #0f172a;
    line-height: 1.2;
    margin-bottom: 6px;
  }

  .fc-subtitle {
    font-size: 14px;
    color: #64748b;
    font-weight: 400;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .fc-warn-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #e0e0e0ff;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 20px;
    font-size: 12.5px;
    font-weight: 600;
    color: #4e3120ff;
    font-family: 'DM Sans', sans-serif;
  }

  .fc-form-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 22px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    margin-bottom: 20px;
  }

  .fc-overview-table {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    border-collapse: separate;
    border-spacing: 0;
    overflow: hidden;
    margin-bottom: 20px;
    font-size: 13px;
  }

  .fc-overview-table th {
    background: #f8fafc;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 9px 16px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
    font-family: 'DM Mono', monospace;
  }

  .fc-overview-table td {
    padding: 11px 16px;
    color: #1e293b;
    font-weight: 600;
    font-size: 13px;
    background: white;
  }

  .fc-overview-table tr:last-child td { border-bottom: none; }

  .fc-overview-table td.not-set {
    color: #94a3b8;
    font-weight: 400;
    font-style: italic;
  }

  .fc-section-label {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #94a3b8;
    margin-bottom: 10px;
    font-family: 'DM Mono', monospace;
  }

  .fc-mode-row {
    display: flex;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 22px;
    background: #f8fafc;
  }

  .fc-mode-btn {
    flex: 1;
    padding: 11px 0;
    font-size: 12.5px;
    font-weight: 600;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.15s ease;
    letter-spacing: 0.04em;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    position: relative;
  }

  .fc-mode-btn + .fc-mode-btn { border-left: 1px solid #e2e8f0; }

  .fc-mode-btn.active {
    background: #0f172a;
    color: #f8fafc;
  }

  .fc-lock-icon {
    opacity: 0.4;
    display: flex;
    align-items: center;
  }

  .fc-rank-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 18px;
  }

  .fc-rank-grid--single {
    grid-template-columns: 1fr;
    max-width: 320px;
  }

  .fc-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .fc-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
    font-family: 'DM Mono', monospace;
  }

  .fc-rank-display {
    height: 40px;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    background: #f8fafc;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    font-family: 'DM Mono', monospace;
  }

  .fc-rank-display.not-set {
    color: #cbd5e1;
    font-style: italic;
    font-weight: 400;
    font-family: 'DM Sans', sans-serif;
  }

  .fc-generate-row {
    display: flex;
    justify-content: flex-end;
  }

  .fc-btn-generate {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #0f172a;
    color: #f8fafc;
    font-size: 13.5px;
    font-weight: 600;
    padding: 11px 26px;
    border-radius: 7px;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.01em;
  }

  .fc-btn-generate:hover  { background: #1e293b; transform: translateY(-1px); }
  .fc-btn-generate:active { transform: scale(0.97); }
  .fc-btn-generate:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .fc-error-banner {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-left: 3px solid #ef4444;
    border-radius: 6px;
    padding: 11px 14px;
    font-size: 13px;
    font-weight: 500;
    color: #991b1b;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.5;
  }

  .fc-filters-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 18px 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    margin-bottom: 16px;
  }

  .fc-filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: default;
  }

  .fc-filter-title {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #94a3b8;
    margin-bottom: 0;
    font-family: 'DM Mono', monospace;
  }

  .fc-filter-toggle-btn {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #94a3b8;
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .fc-filter-toggle-btn.open { transform: rotate(180deg); }
  .fc-filter-body { margin-top: 14px; }

  .fc-filter-groups {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .fc-filter-group-label {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #000000ff;
    margin-bottom: 9px;
    font-family: 'DM Mono', monospace;
  }

  .fc-checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .fc-checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #334155;
    cursor: pointer;
    user-select: none;
  }

  .fc-checkbox-item:hover { color: #0f172a; }

  .fc-checkbox-item input[type="checkbox"] {
    accent-color: #0f172a;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    cursor: pointer;
  }

  .fc-round-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 20px;
    border-bottom: 1px solid #f1f5f9;
    flex-wrap: wrap;
  }

  .fc-round-bar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .fc-round-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #94a3b8;
    white-space: nowrap;
    flex-shrink: 0;
    font-family: 'DM Mono', monospace;
  }

  .fc-round-btns {
    display: flex;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    overflow: hidden;
    background: white;
  }

  .fc-round-btn {
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border: none;
    border-right: 1px solid #e2e8f0;
    background: transparent;
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.12s ease;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
    letter-spacing: 0.02em;
  }

  .fc-round-btn:last-child { border-right: none; }
  .fc-round-btn.active     { background: #0f172a; color: white; }
  .fc-round-btn:hover:not(.active) { background: #f1f5f9; color: #334155; }

  .fc-round-btn.locked {
    color: #cbd5e1;
    cursor: pointer;
    background: #f8fafc;
    position: relative;
  }
  .fc-round-btn.locked:hover { background: #f1f5f9; color: #94a3b8; }
  .fc-round-btn.locked .fc-round-lock {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
    opacity: 0.5;
    vertical-align: middle;
  }

  /* Locked filter group overlay */
  .fc-filter-group-locked {
    position: relative;
    user-select: none;
  }
  .fc-filter-group-locked-overlay {
    position: absolute;
    inset: -8px;
    background: rgba(248,250,252,0.85);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.04em;
    border: 1.5px dashed #e2e8f0;
    transition: background 0.15s ease;
  }
  .fc-filter-group-locked-overlay:hover {
    background: rgba(241,245,249,0.92);
    color: #64748b;
  }

  .fc-btn-generate-inline {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #0f172a;
    color: #f8fafc;
    font-size: 12px;
    font-weight: 600;
    padding: 7px 16px;
    border-radius: 7px;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .fc-btn-generate-inline:hover  { background: #1e293b; transform: translateY(-1px); }
  .fc-btn-generate-inline:active { transform: scale(0.97); }
  .fc-btn-generate-inline:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .fc-results {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    overflow: hidden;
  }

  .fc-results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 20px;
    border-bottom: 1px solid #f1f5f9;
    background: #fafafa;
  }

  .fc-results-title {
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-family: 'DM Mono', monospace;
  }

  .fc-results-count {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    background: #f1f5f9;
    padding: 3px 10px;
    border-radius: 20px;
    font-family: 'DM Mono', monospace;
  }

  .fc-table-head {
    display: grid;
    grid-template-columns: 2fr 2fr 100px 100px 36px;
    padding: 9px 20px;
    border-bottom: 1px solid #f1f5f9;
  }

  .fc-th {
    font-size: 11.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: #94a3b8;
    font-family: 'DM Mono', monospace;
  }

  .fc-result-row { border-bottom: 1px solid #f8fafc; overflow: hidden; }
  .fc-result-row:last-child { border-bottom: none; }

  .fc-result-main {
    display: grid;
    grid-template-columns: 2fr 2fr 100px 100px 36px;
    align-items: center;
    padding: 13px 20px;
    transition: background 0.1s ease;
  }

  .fc-result-row:hover .fc-result-main { background: #fdfdfdff; }

  .fc-college-cell { display: flex; align-items: center; gap: 10px; }

  .fc-college-name {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    line-height: 1.3;
  }

  .fc-branch-name {
    font-size: 12.5px;
    font-weight: 400;
    color: #64748b;
    padding-right: 10px;
    line-height: 1.4;
  }

  .fc-chance-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    width: fit-content;
    white-space: nowrap;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    font-family: 'DM Mono', monospace;
  }

  .chance-high     { background: #dcfce7; color: #166534; }
  .chance-moderate { background: #fef9c3; color: #854d0e; }
  .chance-low      { background: #ffedd5; color: #9a3412; }
  .chance-verylow  { background: #fee2e2; color: #991b1b; }

  .fc-expand-btn {
    width: 26px; height: 26px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.12s ease;
    justify-self: center;
  }

  .fc-expand-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #475569; }
  .fc-expand-btn.open  { transform: rotate(180deg); }

  .fc-result-details {
    padding: 0 20px 16px 58px;
    animation: detailOpen 0.15s ease-out both;
    background: #fafafa;
    border-top: 1px solid #f1f5f9;
  }

  .fc-result-details-inner { padding-top: 14px; }

  .fc-cutoff-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    overflow: hidden;
    font-size: 12px;
  }

  .fc-cutoff-table th {
    background: #f8fafc;
    padding: 7px 12px;
    text-align: left;
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
    border-bottom: 1px solid #e2e8f0;
    font-family: 'DM Mono', monospace;
  }

  .fc-cutoff-table td {
    padding: 8px 12px;
    font-weight: 500;
    color: #334155;
    border-bottom: 1px solid #f8fafc;
    font-family: 'DM Mono', monospace;
  }

  .fc-cutoff-table tr:last-child td { border-bottom: none; }

  @keyframes detailOpen {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Pagination ── */
  .fc-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid #f1f5f9;
    background: #fafafa;
    gap: 12px;
  }

  .fc-pagination-info {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    font-family: 'DM Mono', monospace;
    white-space: nowrap;
  }

  .fc-pagination-btns {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .fc-page-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    background: white;
    color: #334155;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.12s ease;
    white-space: nowrap;
  }

  .fc-page-btn:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
  .fc-page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* Empty / loading */
  .fc-state-center { padding: 52px 20px; text-align: center; }

  .fc-state-icon {
    width: 44px; height: 44px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    color: #94a3b8;
  }

  .fc-state-text { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 4px; }
  .fc-state-sub  { font-size: 12.5px; color: #94a3b8; font-weight: 400; }

  .fc-spinner {
    width: 16px; height: 16px;
    border: 2px solid #e2e8f0;
    border-top-color: #0f172a;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }

  .fc-loading-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 44px 20px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Paywall Popup ── */
  .fc-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(2px);
  }

  .fc-popup {
    background: white;
    border-radius: 12px;
    padding: 32px 28px;
    max-width: 380px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    text-align: center;
    animation: popIn 0.2s ease-out both;
    border: 1px solid #e2e8f0;
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.94) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .fc-popup-icon {
    width: 48px; height: 48px;
    background: #fef3c7;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: #d97706;
  }

  .fc-popup-title {
   font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .fc-popup-sub {
    font-size: 13px;
    color: #989ba0ff;
    font-weight: 400;
    margin-bottom: 22px;
    line-height: 1.6;
  }

  .fc-popup-actions { display: flex; flex-direction: column; gap: 8px; }

  .fc-popup-buy {
    background: #0f172a;
    color: white;
    font-size: 13.5px;
    font-weight: 600;
    padding: 12px 20px;
    border-radius: 7px;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.15s ease;
  }

  .fc-popup-buy:hover { background: #1e293b; }

  .fc-popup-cancel {
    background: none;
    border: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 20px;
    border-radius: 7px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.12s ease;
  }

  .fc-popup-cancel:hover { background: #f8fafc; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .fc-root { padding: 20px 16px; }
    .fc-rank-grid { grid-template-columns: 1fr; }
    .fc-filter-groups { grid-template-columns: 1fr 1fr; }
    .fc-generate-row { justify-content: stretch; }
    .fc-btn-generate { width: 100%; justify-content: center; }
    .fc-table-head { display: none; }

    .fc-result-main {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto auto;
      gap: 4px 8px;
      padding: 12px 16px;
    }

    .fc-college-cell  { grid-column: 1; grid-row: 1; min-width: 0; }
    .fc-expand-btn    { grid-column: 2; grid-row: 1; align-self: start; margin-top: 2px; }

    .fc-branch-name {
      grid-column: 1 / 3;
      grid-row: 2;
      font-size: 11.5px;
      padding-right: 0;
      color: #64748b;
    }

    .fc-mobile-meta {
      grid-column: 1 / 3;
      grid-row: 3;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 2px;
    }

    .fc-category-cell { display: none; }
    .fc-badge-cell    { display: none; }

    .fc-result-details { padding-left: 16px; }

    .fc-overview-table th,
    .fc-overview-table td { padding: 8px 12px; font-size: 12px; }

    .fc-mode-btn { font-size: 12px; padding: 10px 0; }

    .fc-filter-header { cursor: pointer; }
    .fc-filter-toggle-btn { display: flex; }
    .fc-filter-body { margin-top: 0; }
    .fc-filter-body.collapsed { display: none; }
    .fc-filter-body.expanded {
      display: block;
      margin-top: 14px;
      animation: detailOpen 0.15s ease-out both;
    }

    .fc-round-btn .round-full  { display: none; }
    .fc-round-btn .round-short { display: inline; }
    .fc-round-btn { padding: 9px 14px; font-size: 13px; }
    .fc-round-bar { gap: 8px; padding: 10px 16px; }
    .fc-btn-generate-inline { font-size: 11px; padding: 6px 12px; }

    .fc-pagination { flex-wrap: wrap; gap: 8px; padding: 10px 16px; }
    .fc-pagination-info { font-size: 10.5px; }
    .fc-page-btn { padding: 6px 10px; font-size: 11px; }
  }

  @media (min-width: 769px) {
    .fc-round-btn .round-full  { display: inline; }
    .fc-round-btn .round-short { display: none; }
    .fc-filter-body.collapsed,
    .fc-filter-body.expanded { display: block; margin-top: 14px; }

    .fc-mobile-meta   { display: none; }
    .fc-category-cell { display: block; }
    .fc-badge-cell    { display: block; }
    .fc-filter-title--mobile { display: none; }
  }

  @media (max-width: 480px) {
    .fc-filter-groups { grid-template-columns: 1fr; }
    .fc-popup { padding: 24px 18px; }
    .fc-round-btn { padding: 9px 12px; font-size: 13px; }
    .fc-round-bar { flex-wrap: wrap; row-gap: 8px; }
    .fc-btn-generate-inline { width: 100%; justify-content: center; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Small components
// ─────────────────────────────────────────────────────────────────────────────
const LockIcon = () => (
  <span className="fc-lock-icon">
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────
const val = (v) =>
  v !== undefined && v !== null && String(v).trim() !== "" && String(v) !== "0"
    ? v
    : null;

const buildCheckboxState = (keys) => Object.fromEntries(keys.map(k => [k, false]));

function checkedToIds(checkedObj, idMap) {
  return Object.entries(checkedObj)
    .filter(([, isChecked]) => isChecked)
    .map(([label]) => idMap[label])
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────────────────────────────────────
export default function FindCollegePage() {

  // ── Core UI state ─────────────────────────────────────────────────────────
  const [mode, setMode] = useState("JOSAA");
  const [selectedRound, setSelectedRound] = useState(1);

  // ── User profile ──────────────────────────────────────────────────────────
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  // ── Filter checkboxes ─────────────────────────────────────────────────────
  const [collegeTypes, setCollegeTypes] = useState(() => buildCheckboxState(COLLEGE_TYPES_PER_MODE["JOSAA"]));
  const [degreeTypes, setDegreeTypes] = useState(() => buildCheckboxState(DEGREE_OPTIONS));
  const [branches, setBranches] = useState(() => buildCheckboxState(BRANCH_OPTIONS));
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Results & loading ─────────────────────────────────────────────────────
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [expanded, setExpanded] = useState({});

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ── Paywall ───────────────────────────────────────────────────────────────
  const [paywallFor, setPaywallFor] = useState(null);

  // ── Generate cooldown (4s disable after click) ────────────────────────────
  const [generateCooldown, setGenerateCooldown] = useState(0);
  const cooldownRef = useRef(null);

  // ── Fetch user profile on mount ───────────────────────────────────────────
  useEffect(() => {
    async function fetchDetails() {
      try {
        const user = auth.currentUser;
        if (!user) { setUserDetails({}); setDetailsLoading(false); return; }

        const jwt = await getIdToken(user);
        const res = await fetch("/api/fetch_user_details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jwt }),
        });
        const data = await res.json();
        setUserDetails(data);
      } catch (e) {
        console.error("Failed to fetch user details", e);
        setUserDetails({});
      } finally {
        setDetailsLoading(false);
      }
    }
    fetchDetails();
  }, []);

  // ── Subscription flags ────────────────────────────────────────────────────
  const josaaUnlocked = userDetails?.josaa_credits === true;
  const csabUnlocked = userDetails?.csab_credits === true;
  // TEST is unlocked when EITHER josaa OR csab credit is active
  const testUnlocked = josaaUnlocked || csabUnlocked;
  // Full filters/advanced rounds in TEST mode require any credit
  const testFiltersUnlocked = josaaUnlocked || csabUnlocked;

  // ── Mode switch: reset filters + results ─────────────────────────────────
  function handleModeClick(m) {
    const isLocked =
      (m === "JOSAA" && !josaaUnlocked) ||
      (m === "CSAB" && !csabUnlocked);
    // TEST is always accessible — restrictions are on rounds/filters inside

    if (isLocked) { setPaywallFor(m); return; }

    setMode(m);
    setCollegeTypes(buildCheckboxState(COLLEGE_TYPES_PER_MODE[m]));
    setSelectedRound(1);
    setResults(null);
    setApiError(null);
    setExpanded({});
    setPage(1);
    setTotalPages(1);
    setTotalCount(0);
  }

  // ── Filter / expand toggles ───────────────────────────────────────────────
  function toggleFilter(setter, key) {
    setter(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleExpand(idx) {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  // ── Build API payload ─────────────────────────────────────────────────────
  function buildPayload(jwt, targetPage) {
    const collegeIds = checkedToIds(collegeTypes, COLLEGE_TYPE_MAP);
    const degreeIds = checkedToIds(degreeTypes, DEGREE_TYPE_MAP);
    const branchIds = checkedToIds(branches, BRANCH_MAP);

    return {
      jwt,
      mode,
      round: selectedRound,
      page: targetPage,
      ...(collegeIds.length > 0 && { college_type: collegeIds }),
      ...(degreeIds.length > 0 && { degree_type: degreeIds }),
      ...(branchIds.length > 0 && { branch: branchIds }),
    };
  }

  // ── Core fetch — called by Generate button and both pagination buttons ────
  async function fetchPage(targetPage) {
    setLoading(true);
    setApiError(null);
    setExpanded({});

    try {
      const user = auth.currentUser;
      if (!user) {
        setApiError("You must be logged in to search colleges.");
        return;
      }

      const jwt = await getIdToken(user);
      const payload = buildPayload(jwt, targetPage);

      const res = await fetch("/api/college_search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data?.error ?? `Server error (${res.status})`);
        return;
      }

      setResults(data.results ?? []);
      setTotalCount(data.total_count ?? 0);
      setTotalPages(data.total_pages ?? 1);
      setPage(data.current_page ?? targetPage);

    } catch (e) {
      console.error("[fetchPage]", e);
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Cooldown helper ───────────────────────────────────────────────────────
  function startCooldown() {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setGenerateCooldown(4);
    cooldownRef.current = setInterval(() => {
      setGenerateCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // ── Generate: always starts from page 1 ──────────────────────────────────
  function handleGenerate() {
    startCooldown();
    setResults(null);
    setPage(1);
    setTotalPages(1);
    setTotalCount(0);
    fetchPage(1);
  }

  // ── Pagination handlers ───────────────────────────────────────────────────
  function handlePrev() {
    if (page > 1) fetchPage(page - 1);
  }

  function handleNext() {
    if (page < totalPages) fetchPage(page + 1);
  }

  // ── canGenerate ───────────────────────────────────────────────────────────
  const modeUnlocked =
    mode === "TEST" ||   // TEST rank is unlocked for everyone
    (mode === "JOSAA" && josaaUnlocked) ||
    (mode === "CSAB" && csabUnlocked);

  const d = userDetails || {};

  const rankFields = {
    TEST: [{ label: "Test Mains CRL (estimated only)", value: d.test_mains_crl }],
    JOSAA: [
      { label: "Mains CRL Rank", value: d.crl_mains_rank },
      { label: "Mains Category Rank", value: d.category_mains_rank },
      { label: "Advanced CRL Rank", value: d.crl_adv_rank },
      { label: "Advanced Category Rank", value: d.category_adv_rank },
    ],
    // CSAB DB stores cutoffs as CRL ranks — category rank is not used for comparison
    CSAB: [
      { label: "Mains CRL Rank (used for all categories)", value: d.crl_mains_rank },
    ],
  };

  const canGenerate = modeUnlocked && rankFields[mode]?.some(f => val(f.value));

  const display = (v) => (val(v) ? v : <span className="not-set">NOT SET</span>);
  const roundOptions = Array.from({ length: ROUND_LIMITS[mode].max }, (_, i) => i + 1);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="fc-root">

        <h1 className="fc-title">Find Your Colleges</h1>

        {/* ── Overview table ── */}
        {detailsLoading ? (
          <div style={{ marginBottom: 24, display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "var(--color-text-muted)" }}>
            <div className="fc-spinner" /> Loading your profile...
          </div>
        ) : (
          <table className="fc-overview-table">
            <thead>
              <tr>
                <th>Home State</th>
                <th>Category</th>
                <th>Gender</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={!val(d.home_state) ? "not-set" : ""}>{display(d.home_state)}</td>
                <td className={!val(d.category) ? "not-set" : ""}>{display(d.category)}</td>
                <td className={!val(d.gender) ? "not-set" : ""}>{display(d.gender)}</td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="fc-form-card">

          {/* ── Counselling type ── */}
          <div className="fc-mode-row">
            {[
              { key: "TEST", locked: false },
              { key: "JOSAA", locked: !josaaUnlocked },
              { key: "CSAB", locked: !csabUnlocked },
            ].map(({ key, locked }) => (
              <button
                key={key}
                className={`fc-mode-btn${mode === key ? " active" : ""}${locked ? " locked" : ""}`}
                onClick={() => handleModeClick(key)}
              >
                {locked && <LockIcon />}
                {key}
              </button>
            ))}
          </div>

          {/* ── Read-only rank display ── */}
          <div className={`fc-rank-grid${(mode === "TEST" || mode === "CSAB") ? " fc-rank-grid--single" : ""}`}>
            {rankFields[mode].map(field => (
              <div className="fc-field" key={field.label}>
                <label className="fc-label">{field.label}</label>
                <div className={`fc-rank-display${!val(field.value) ? " not-set" : ""}`}>
                  {val(field.value) ? field.value : "NOT SET"}
                </div>
              </div>
            ))}
          </div>

          {/* ── Generate button ── */}
          <div className="fc-generate-row">
            <button
              className="fc-btn-generate"
              onClick={handleGenerate}
              disabled={loading || !canGenerate || generateCooldown > 0}
            >
              {loading ? (
                <><div className="fc-spinner" /> Searching...</>
              ) : generateCooldown > 0 ? (
                <>{generateCooldown}s</>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                  </svg>
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {apiError && (
          <div className="fc-error-banner">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            {apiError}
          </div>
        )}

        {/* ── Permanent warning ── */}
        <div className="fc-warn-banner">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Don&apos;t forget to HIT Generate after Choosing Options
        </div>

        {/* ── Empty state ── */}
        {!results && !loading && !apiError && (
          <div className="fc-results">
            <div className="fc-state-center">
              <div className="fc-state-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <p className="fc-state-text">No results yet</p>
              <p className="fc-state-sub">Select your counselling type above and hit Generate.</p>
            </div>
          </div>
        )}

        {/* ── Filters + Results ── */}
        {(results !== null || loading) && (
          <>
            {/* Filters card */}
            <div className="fc-filters-card">
              <p className="fc-filter-title fc-filter-title--mobile">Filters</p>
              <div className="fc-filter-header" onClick={() => setFilterOpen(o => !o)}>
                <button
                  className={`fc-filter-toggle-btn${filterOpen ? " open" : ""}`}
                  aria-label={filterOpen ? "Collapse filters" : "Expand filters"}
                  tabIndex={-1}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className={`fc-filter-body${filterOpen ? " expanded" : " collapsed"}`}>
                <div className="fc-filter-groups">

                  {/* College type */}
                  <div className={mode === "TEST" && !testFiltersUnlocked ? "fc-filter-group-locked" : ""}>
                    {mode === "TEST" && !testFiltersUnlocked && (
                      <div
                        className="fc-filter-group-locked-overlay"
                        onClick={() => setPaywallFor("JOSAA and CSAB Counselling")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === "Enter" && setPaywallFor("JOSAA and CSAB Counselling")}
                      >
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        Locked
                      </div>
                    )}
                    <p className="fc-filter-group-label">College Type</p>
                    <div className="fc-checkbox-list">
                      {COLLEGE_TYPES_PER_MODE[mode].map(label => (
                        <label className="fc-checkbox-item" key={label}>
                          <input
                            type="checkbox"
                            checked={collegeTypes[label] ?? false}
                            onChange={() => toggleFilter(setCollegeTypes, label)}
                            disabled={mode === "TEST" && !testFiltersUnlocked}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Degree type */}
                  <div>
                    <p className="fc-filter-group-label">Degree Type</p>
                    <div className="fc-checkbox-list">
                      {DEGREE_OPTIONS.map(label => (
                        <label className="fc-checkbox-item" key={label}>
                          <input
                            type="checkbox"
                            checked={degreeTypes[label] ?? false}
                            onChange={() => toggleFilter(setDegreeTypes, label)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Branch */}
                  <div className={mode === "TEST" && !testFiltersUnlocked ? "fc-filter-group-locked" : ""}>
                    {mode === "TEST" && !testFiltersUnlocked && (
                      <div
                        className="fc-filter-group-locked-overlay"
                        onClick={() => setPaywallFor("JOSAA and CSAB Counselling")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === "Enter" && setPaywallFor("JOSAA and CSAB Counselling")}
                      >
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        Locked
                      </div>
                    )}
                    <p className="fc-filter-group-label">Branch</p>
                    <div className="fc-checkbox-list">
                      {BRANCH_OPTIONS.map(label => (
                        <label className="fc-checkbox-item" key={label}>
                          <input
                            type="checkbox"
                            checked={branches[label] ?? false}
                            onChange={() => toggleFilter(setBranches, label)}
                            disabled={mode === "TEST" && !testFiltersUnlocked}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Results card */}
            <div className="fc-results">
              <div className="fc-results-header">
                {results && (
                  <span className="fc-results-count">
                    {totalCount} result{totalCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Round selector + inline generate */}
              {results && (
                <div className="fc-round-bar">
                  <div className="fc-round-bar-left">
                    <div className="fc-round-btns">
                      {roundOptions.map(r => {
                        const isRoundLocked = mode === "TEST" && r > 1 && !testFiltersUnlocked;
                        return (
                          <button
                            key={r}
                            className={`fc-round-btn${selectedRound === r ? " active" : ""}${isRoundLocked ? " locked" : ""}`}
                            onClick={() => {
                              if (isRoundLocked) { setPaywallFor("JOSAA and CSAB Counselling"); return; }
                              setSelectedRound(r);
                            }}
                            title={isRoundLocked ? "Requires JOSAA or CSAB subscription" : `Round ${r}`}
                          >
                            <span className="round-full">Round {r}</span>
                            <span className="round-short">R{r}</span>
                            {isRoundLocked && (
                              <span className="fc-round-lock">
                                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    className="fc-btn-generate-inline"
                    onClick={handleGenerate}
                    disabled={loading || !canGenerate || generateCooldown > 0}
                  >
                    {loading ? (
                      <><div className="fc-spinner" style={{ width: 13, height: 13 }} /> Searching...</>
                    ) : generateCooldown > 0 ? (
                      <>{generateCooldown}s</>
                    ) : (
                      <>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                        </svg>
                        Generate
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="fc-loading-row">
                  <div className="fc-spinner" />
                  Analysing your rank across all institutes...
                </div>
              )}

              {/* Zero results */}
              {!loading && results && results.length === 0 && (
                <div className="fc-state-center">
                  <div className="fc-state-icon">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <p className="fc-state-text">No colleges found</p>
                  <p className="fc-state-sub">Try adjusting your filters or selecting a different round.</p>
                </div>
              )}

              {/* Result rows */}
              {!loading && results && results.length > 0 && (
                <>
                  <div className="fc-table-head">
                    <div className="fc-th">College</div>
                    <div className="fc-th">Branch</div>
                    <div className="fc-th">Category</div>
                    <div className="fc-th">Probability</div>
                    <div className="fc-th"></div>
                  </div>

                  {results.map((r, idx) => {
                    const chanceClass = CHANCE_CLASS[r.probability] ?? "chance-verylow";
                    const isExpanded = !!expanded[idx];

                    return (
                      <div key={idx} className="fc-result-row">
                        <div className="fc-result-main">

                          <div className="fc-college-cell">
                            <span className="fc-college-name">{r.college_name}</span>
                          </div>

                          <div className="fc-branch-name">{r.branch}</div>

                          <div className="fc-category-cell">
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', fontFamily: "'DM Mono', monospace", background: '#f1f5f9', padding: '3px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>
                              {r.category ?? '—'}
                            </span>
                          </div>

                          <div className="fc-badge-cell">
                            <span className={`fc-chance-badge ${chanceClass}`}>
                              {r.probability}
                            </span>
                          </div>

                          {/* Mobile only: category + badge shown together */}
                          <div className="fc-mobile-meta">
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', fontFamily: "'DM Mono', monospace", background: '#f1f5f9', padding: '3px 8px', borderRadius: 5 }}>
                              {r.category ?? '—'}
                            </span>
                            <span className={`fc-chance-badge ${chanceClass}`}>
                              {r.probability}
                            </span>
                          </div>

                          <button
                            className={`fc-expand-btn${isExpanded ? " open" : ""}`}
                            onClick={() => toggleExpand(idx)}
                            aria-label="Show historical cutoffs"
                          >
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="fc-result-details">
                            <div className="fc-result-details-inner">

                              <table className="fc-cutoff-table">
                                <thead>
                                  <tr>
                                    <th>Year</th>
                                    <th>Opening Rank</th>
                                    <th>Closing Rank</th>
                                    <th>Quota</th>
                                    <th>Round</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(r.opening != null && r.closing != null) ? (
                                    <tr>
                                      <td>{r.year}</td>
                                      <td>{r.opening?.toLocaleString()}</td>
                                      <td>{r.closing?.toLocaleString()}</td>
                                      <td>{QUOTA_LABEL[r.quota] ?? r.quota ?? '—'}</td>
                                      <td>R{r.round}</td>
                                    </tr>
                                  ) : (
                                    <tr>
                                      <td colSpan={5} style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontWeight: 400 }}>
                                        Historical cutoff data not available
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* ── Pagination controls ── */}
                  <div className="fc-pagination">
                    <span className="fc-pagination-info">
                      Page {page} of {totalPages} &nbsp;·&nbsp; {totalCount} result{totalCount !== 1 ? "s" : ""}
                    </span>
                    <div className="fc-pagination-btns">
                      <button
                        className="fc-page-btn"
                        onClick={handlePrev}
                        disabled={page === 1 || loading}
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button
                        className="fc-page-btn"
                        onClick={handleNext}
                        disabled={page === totalPages || loading}
                      >
                        Next
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* ── Paywall popup ── */}
        {paywallFor && (
          <div className="fc-overlay" onClick={() => setPaywallFor(null)}>
            <div className="fc-popup" onClick={e => e.stopPropagation()}>
              {/* <div className="fc-popup-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div> */}
              <p className="fc-popup-title">Unlock {paywallFor}</p>
              <p className="fc-popup-sub">
                {paywallFor === "JOSAA and CSAB Counselling"
                  ? <>Access to <strong>JOSAA and CSAB Counselling</strong> predictions requires an active subscription. Upgrade to get full college predictor access.</>
                  : <>Access to <strong>{paywallFor}</strong> counselling predictions requires an active subscription. Upgrade to get full college predictor access.</>
                }
              </p>
              <div className="fc-popup-actions">
                <button className="fc-popup-buy" onClick={() => { window.location.href = "/payments"; }}>
                  View Plans &amp; Pricing
                </button>
                <button className="fc-popup-cancel" onClick={() => setPaywallFor(null)}>
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}