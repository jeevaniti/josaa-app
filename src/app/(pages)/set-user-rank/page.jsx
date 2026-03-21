// src/app/(pages)/set-user-rank/page.jsx
"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import Link from "next/link";

const styles = `
  /* ── Quick Actions Bar ── */
  .sr-quick-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 28px;
    border-bottom: 1px solid var(--color-border);
    background: #f8fafc;
    flex-wrap: wrap;
  }

  .sr-quick-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    margin-right: 4px;
    white-space: nowrap;
  }

  .sr-quick-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background: white;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .sr-quick-link:hover {
    background: #eff6ff;
    border-color: var(--color-blue);
    color: var(--color-blue);
  }

  .sr-quick-link.primary {
    background: var(--color-blue);
    color: white;
    border-color: var(--color-blue);
    box-shadow: 0 2px 6px rgba(37,99,235,0.18);
  }

  .sr-quick-link.primary:hover {
    background: var(--color-blue-dark);
    border-color: var(--color-blue-dark);
    color: white;
  }

  /* Warning bar — no close, always visible */
  .sr-warning {
    padding: 11px 28px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #b91c1c;
    top: 0;
    z-index: 10;
  }
    
  .sr-warning-normal {
    padding: 11px 28px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    font-weight: 600;
    color: #474747ff;
    top: 0;
    z-index: 10;
    margin-bottom: 4px;
  }

  .sr-warning-normal span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sr-warning-icon { flex-shrink: 0; color: #ef4444; }

  .sr-body {
    padding: 32px 28px;
    max-width: 960px;
    margin: 0 auto;
  }

  .sr-eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: 6px;
  }

  .sr-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 800;
    color: var(--color-text-primary);
    line-height: 1.2;
    margin-bottom: 6px;
  }

  .sr-subtitle {
    font-size: 14px;
    color: var(--color-text-secondary);
    font-weight: 500;
    margin-bottom: 28px;
  }

  /* Saved ranks table */
  .sr-table-card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    overflow: hidden;
    margin-bottom: 24px;
  }

  .sr-table-header {
    padding: 13px 20px;
    border-bottom: 1px solid var(--color-border);
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sr-table-header-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .sr-table-header-count {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .sr-table-head {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    padding: 9px 20px;
    border-bottom: 1px solid var(--color-border);
    background: #fafafa;
  }

  .sr-table-head-2col {
    display: grid;
    grid-template-columns: 2fr 1fr;
    padding: 9px 20px;
    border-bottom: 1px solid var(--color-border);
    background: #fafafa;
  }

  .sr-setter-new-header{
    background: #f8fafc;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: #000000ff;
  }

  .sr-th {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
  }

  .sr-rank-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    align-items: center;
    padding: 14px 20px;
    transition: background 0.1s ease;
  }

  .sr-rank-row-2col {
    display: grid;
    grid-template-columns: 2fr 1fr;
    align-items: center;
    padding: 14px 20px;
    transition: background 0.1s ease;
  }

  .sr-rank-row:last-child { border-bottom: none; }
  .sr-rank-row:hover { background: #f8fafc; }
  .sr-rank-row-2col:last-child { border-bottom: none; }
  .sr-rank-row-2col:hover { background: #f8fafc; }

  .sr-rank-label {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sr-rank-sub {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 400;
  }

  .sr-tag {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .tag-josaa { background: #dbeafe; color: #1d4ed8; }
  .tag-csab  { background: #fef9c3; color: #a16207; }
  .tag-adv   { background: #f3e8ff; color: #7c3aed; }
  .tag-test  { background: #dcfce7; color: #15803d; }

  .sr-rank-value {
    font-size: 14px;
    font-weight: 800;
    color: var(--color-text-primary);
  }

  .sr-rank-value.empty {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-muted);
  }

  .sr-status-set   { font-size: 11px; font-weight: 600; color: #16a34a; }
  .sr-status-empty { font-size: 11px; font-weight: 600; color: var(--color-text-muted); }

  .sr-sub-active {
    font-size: 11px;
    font-weight: 700;
    color: #16a34a;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .sr-sub-inactive {
    font-size: 11px;
    font-weight: 600;
    color: #ef4444;
  }

  .sr-action-btn {
    font-size: 11px;
    font-weight: 700;
    padding: 5px 11px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background: white;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .sr-action-btn:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .sr-action-btn.clear {
    color: #ef4444;
    border-color: #fecaca;
    background: #fef2f2;
  }

  .sr-action-btn.clear:hover {
    background: #fee2e2;
    border-color: #fca5a5;
  }

  /* Set Rank table action buttons */
  .sr-set-btn {
    font-size: 15px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }

  .sr-set-btn.active {
    background: var(--color-blue);
    color: white;
    box-shadow: 0 2px 6px rgba(71, 129, 255, 0.18);
  }

  .sr-set-btn.active:hover {
    background: var(--color-blue-dark);
    transform: translateY(-1px);
  }

  .sr-set-btn.inactive {
    background: #acacacff;
    color: var(--color-text-muted);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .sr-set-btn.already-set {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
    cursor: not-allowed;
  }

  /* Section set button row */
  .sr-section-btn-row {
    padding: 10px 20px;
    display: flex;
    justify-content: flex-end;
    border-bottom: 1px solid var(--color-border);
    background: #fafcff;
  }

  /* Setter card */
  .sr-setter-card {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    overflow: hidden;
    margin-top: 0px;
  }

  .sr-setter-header {
    padding: 14px 22px;
    border-bottom: 1px solid var(--color-border);
    background: #f8fafc;
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .sr-setter-body { padding: 22px; }

  .sr-mode-row {
    display: flex;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    margin-bottom: 22px;
    background: #f8fafc;
  }

  .sr-mode-btn {
    flex: 1;
    padding: 10px 0;
    font-size: 13px;
    font-weight: 700;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-muted);
    transition: all 0.15s ease;
    letter-spacing: 0.02em;
    font-family: inherit;
  }

  .sr-mode-btn.active {
    background: var(--color-text-primary);
    color: white;
  }

  .sr-fields {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 22px;
  }

  .sr-field { display: flex; flex-direction: column; gap: 6px; }

  .sr-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sr-label-tag {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    text-transform: none;
    letter-spacing: 0;
  }

  .sr-label-opt {
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
    font-size: 10px;
    color: var(--color-text-muted);
  }

  .sr-input {
    height: 42px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0 14px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    background: #f8fafc;
    transition: border-color 0.15s ease, background 0.15s ease;
    font-family: inherit;
  }

  .sr-input:focus {
    outline: none;
    border-color: var(--color-blue);
    background: white;
  }

  .sr-input:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    background: #f1f5f9;
  }

  .sr-select {
    height: 42px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0 14px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    background: #f8fafc;
    transition: border-color 0.15s ease, background 0.15s ease;
    font-family: inherit;
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    cursor: pointer;
  }

  .sr-select:focus {
    outline: none;
    border-color: var(--color-blue);
    background-color: white;
  }

  .sr-select:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .sr-radio-group {
    display: flex;
    gap: 16px;
    margin-top: 4px;
  }

  .sr-radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    cursor: pointer;
    padding: 10px 18px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: #f8fafc;
    transition: all 0.15s ease;
    flex: 1;
    justify-content: center;
  }

  .sr-radio-label.selected {
    background: #eff6ff;
    border-color: var(--color-blue);
    color: var(--color-blue);
  }

  .sr-radio-label input[type="radio"] {
    accent-color: var(--color-blue);
    width: 15px;
    height: 15px;
  }

  .sr-input-hint {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .sr-input-hint.warn { color: #d97706; }

  .sr-btn-save {
    width: 100%;
    height: 44px;
    background: var(--color-blue);
    color: white;
    font-size: 14px;
    font-weight: 700;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;
    box-shadow: 0 4px 12px rgba(37,99,235,0.2);
    font-family: inherit;
  }

  .sr-btn-save:hover {
    background: var(--color-blue-dark);
    transform: translateY(-1px);
  }

  .sr-btn-save:active { transform: scale(0.97); }

  .sr-btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .sr-toast {
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

  /* Loading skeleton */
  .sr-skeleton {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 4px;
    height: 14px;
    display: inline-block;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .sr-error-banner {
    padding: 12px 20px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    color: #b91c1c;
    margin-bottom: 20px;
  }

  /* Dialog overlay */
  .sr-dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 16px;
    animation: fadeIn 0.18s ease-out both;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .sr-dialog {
    background: white;
    border-radius: var(--radius-md);
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    width: 100%;
    max-width: 440px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.2s ease-out both;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sr-dialog-header {
    padding: 16px 22px;
    border-bottom: 1px solid var(--color-border);
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .sr-dialog-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .sr-dialog-close {
    width: 26px;
    height: 26px;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    transition: background 0.15s;
    font-family: inherit;
  }

  .sr-dialog-close:hover { background: #f1f5f9; }

  .sr-dialog-body { padding: 22px; }

  .sr-dialog-warn {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 10px 13px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-weight: 600;
    color: #b91c1c;
    margin-bottom: 18px;
    line-height: 1.5;
  }

  .sr-dialog-warn svg { flex-shrink: 0; margin-top: 1px; }

  .sr-dialog-rank-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    margin-bottom: 8px;
  }

  .sr-dialog-field-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
  }

  .sr-dialog-field { display: flex; flex-direction: column; gap: 6px; }

  .sr-dialog-field-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
  }

  .sr-dialog-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .sr-dialog-btn-cancel {
    flex: 1;
    height: 40px;
    background: #f8fafc;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }

  .sr-dialog-btn-cancel:hover { background: #f1f5f9; }

  .sr-dialog-btn-confirm {
    flex: 1;
    height: 40px;
    background: var(--color-blue);
    border: none;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 700;
    color: white;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s, transform 0.1s;
    box-shadow: 0 3px 10px rgba(37,99,235,0.2);
  }

  .sr-dialog-btn-confirm:hover { background: var(--color-blue-dark); transform: translateY(-1px); }
  .sr-dialog-btn-confirm:active { transform: scale(0.97); }
  .sr-dialog-btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .sr-dialog-error {
    margin-top: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #b91c1c;
  }

  /* N/A badge */
  .sr-na {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
    font-style: italic;
  }

  /* Divider inside table */
  .sr-section-divider {
    height: 0px;
    background: var(--color-border);
    margin: 0;
  }

  @media (max-width: 768px) {
    .sr-quick-actions {
      padding: 10px 16px;
      gap: 6px;
    }

    .sr-quick-label {
      width: 100%;
      margin-bottom: 2px;
    }

    .sr-quick-link {
      font-size: 11px;
      padding: 5px 10px;
    }

    .sr-warning { padding: 11px 16px; }
    .sr-warning-normal { padding: 11px 16px; }
    .sr-body    { padding: 20px 16px; }

    .sr-table-head,
    .sr-table-head-2col { display: none; }

    .sr-rank-row {
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      gap: 5px;
      padding: 13px 16px;
    }

    .sr-rank-row > div:nth-child(1) { grid-column: 1; grid-row: 1; }
    .sr-rank-row > div:nth-child(2) { grid-column: 1; grid-row: 2; }
    .sr-rank-row > div:nth-child(3) { grid-column: 2; grid-row: 1; align-self: center; }

    .sr-rank-row-2col {
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      padding: 13px 16px;
    }

    .sr-section-btn-row {
      padding: 10px 16px;
    }

    .sr-set-btn {
      font-size: 14px;
      padding: 5px 10px;
    }

    .sr-radio-group {
      flex-direction: row;
    }

    .sr-dialog {
      max-width: 100%;
      max-height: 95vh;
      border-radius: 16px 16px 0 0;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
      margin: 0;
      animation: slideUpMobile 0.22s ease-out both;
    }

    @keyframes slideUpMobile {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }

    .sr-dialog-overlay {
      align-items: flex-end;
      padding: 0;
    }
  }
`;

const HOME_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Delhi', 'Diu (UT)',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal'
];

const CATEGORIES = [
  'EWS', 'EWS (PwD)', 'OBC-NCL', 'OBC-NCL (PwD)',
  'OPEN', 'OPEN (PwD)', 'SC', 'SC (PwD)', 'ST', 'ST (PwD)'
];

async function getJWT() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken(/* forceRefresh= */ true); // ← always get a fresh token
}

function PencilIcon() {
  return (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.364-6.364a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z" />
    </svg>
  );
}

export default function SetRankPage() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Dialog state
  const [dialog, setDialog] = useState(null);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState(null);
  const [dialogSuccess, setDialogSuccess] = useState(false);

  // Rank dialog inputs
  const [inputTestRank, setInputTestRank] = useState("");
  const [inputCrlMains, setInputCrlMains] = useState("");
  const [inputCategoryMains, setInputCategoryMains] = useState("");
  const [inputCrlAdv, setInputCrlAdv] = useState("");
  const [inputCategoryAdv, setInputCategoryAdv] = useState("");

  // Student details dialog inputs
  const [inputHomeState, setInputHomeState] = useState("");
  const [inputGender, setInputGender] = useState("");
  const [inputCategory, setInputCategory] = useState("");

  async function fetchUserDetails() {
    setLoading(true);
    setFetchError(null);
    try {
      // Wait for auth to be ready before grabbing the token
      await new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          if (user) resolve(user);
          else reject(new Error("Not authenticated"));
        });
      });

      const jwt = await getJWT();
      const res = await fetch("/api/fetch_user_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Server error: ${res.status}`);
      }

      setUserDetails(data);
    } catch (err) {
      setFetchError(err.message || "Failed to fetch user details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // ── Helpers ──
  function rankVal(num) {
    if (!num || num === 0) return { text: "Not set", empty: true };
    return { text: num.toLocaleString("en-IN"), empty: false };
  }

  const isGeneral = () => userDetails?.category === "OPEN";

  const detailsSet = () =>
    !!(userDetails?.home_state && userDetails?.gender && userDetails?.category);

  // ── Parsed values ──
  const josaa_credit = userDetails?.josaa_credits ?? false;
  const csab_credit = userDetails?.csab_credits ?? false;
  const test_mains_crl = userDetails?.test_mains_crl ?? 0;
  const crl_mains_rank = userDetails?.crl_mains_rank ?? 0;
  const category_mains_rank = userDetails?.category_mains_rank ?? 0;
  const crl_adv_rank = userDetails?.crl_adv_rank ?? 0;
  const category_adv_rank = userDetails?.category_adv_rank ?? 0;

  // ── Dialog open/close ──
  function openDialog(type) {
    setDialog(type);
    setDialogError(null);
    setDialogSuccess(false);
    if (type === "studentDetails") {
      setInputHomeState(userDetails?.home_state || "");
      setInputGender(userDetails?.gender || "");
      setInputCategory(userDetails?.category || "");
    } else {
      setInputTestRank("");
      setInputCrlMains("");
      setInputCategoryMains("");
      setInputCrlAdv("");
      setInputCategoryAdv("");
    }
  }

  function closeDialog() {
    if (dialogSubmitting) return;
    setDialog(null);
    setDialogError(null);
    setDialogSuccess(false);
  }

  // ── Submit handlers ──
  async function callSetRankAPI(payload) {
    setDialogSubmitting(true);
    setDialogError(null);
    try {
      const token = await getJWT();
      const res = await fetch("/api/set_user_rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Server error: ${res.status}`);
      setDialogSuccess(true);
      setTimeout(async () => {
        setDialog(null);
        setDialogSuccess(false);
        await fetchUserDetails();
      }, 1200);
    } catch (err) {
      setDialogError(err.message || "Failed to save. Please try again.");
    } finally {
      setDialogSubmitting(false);
    }
  }

  async function handleStudentDetailsSubmit() {
    if (!inputHomeState || !inputGender || !inputCategory) {
      setDialogError("Please fill all fields before confirming.");
      return;
    }
    setDialogSubmitting(true);
    setDialogError(null);
    try {
      const jwt = await getJWT();
      const res = await fetch("/api/set_user_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt, home_state: inputHomeState, gender: inputGender, category: inputCategory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Server error: ${res.status}`);
      setDialogSuccess(true);
      setTimeout(async () => {
        setDialog(null);
        setDialogSuccess(false);
        await fetchUserDetails();
      }, 1200);
    } catch (err) {
      setDialogError(err.message || "Failed to save. Please try again.");
    } finally {
      setDialogSubmitting(false);
    }
  }

  // ── Section 1 submit — type: TEST ──
  function submitSection1() {
    if (!detailsSet()) { setDialogError("Please set your Student Details (home state, gender, category) before setting ranks."); return; }
    const val = parseInt(inputTestRank, 10);
    if (isNaN(val) || val < 1 || val > 1500000) {
      setDialogError("Please enter a valid rank between 1 and 15,00,000.");
      return;
    }
    callSetRankAPI({ type: "TEST", test_mains_crl: val });
  }

  // ── Section 2 submit — type: MAINS ──
  function submitSection2() {
    if (!detailsSet()) { setDialogError("Please set your Student Details (home state, gender, category) before setting ranks."); return; }
    const needsBoth = !isGeneral();
    if (needsBoth && (inputCrlMains === "" || inputCategoryMains === "")) {
      setDialogError("You must enter both CRL and Category Rank."); return;
    }
    if (!needsBoth && inputCrlMains === "") {
      setDialogError("Please enter your CRL Mains rank."); return;
    }
    const payload = { type: "MAINS" };
    const crl = parseInt(inputCrlMains, 10);
    if (isNaN(crl) || crl < 1 || crl > 1500000) { setDialogError("Enter a valid CRL Mains rank (1 – 15,00,000)."); return; }
    payload.crl_mains_rank = crl;
    if (needsBoth) {
      const cat = parseInt(inputCategoryMains, 10);
      if (isNaN(cat) || cat < 1 || cat > 1500000) { setDialogError("Enter a valid Category Mains rank (1 – 15,00,000)."); return; }
      payload.category_mains_rank = cat;
    }
    callSetRankAPI(payload);
  }

  // ── Section 3 submit — type: ADVANCED ──
  function submitSection3() {
    if (!detailsSet()) { setDialogError("Please set your Student Details (home state, gender, category) before setting ranks."); return; }
    const needsBoth = !isGeneral();
    if (needsBoth && (inputCrlAdv === "" || inputCategoryAdv === "")) {
      setDialogError("You must enter both CRL and Category Rank."); return;
    }
    if (!needsBoth && inputCrlAdv === "") {
      setDialogError("Please enter your CRL Advanced rank."); return;
    }
    const payload = { type: "ADVANCED" };
    const crl = parseInt(inputCrlAdv, 10);
    if (isNaN(crl) || crl < 1 || crl > 100000) { setDialogError("Enter a valid CRL Advanced rank (1 – 1,00,000)."); return; }
    payload.crl_adv_rank = crl;
    if (needsBoth) {
      const cat = parseInt(inputCategoryAdv, 10);
      if (isNaN(cat) || cat < 1 || cat > 100000) { setDialogError("Enter a valid Category Advanced rank (1 – 1,00,000)."); return; }
      payload.category_adv_rank = cat;
    }
    callSetRankAPI(payload);
  }

  // ── Render ──
  return (
    <>
      <style>{styles}</style>

      {/* ── Dialog ── */}
      {dialog && (
        <div
          className="sr-dialog-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeDialog(); }}
        >
          <div className="sr-dialog">
            <div className="sr-dialog-header">
              <span className="sr-dialog-title">
                {dialog === "section1" && "Set Test Rank"}
                {dialog === "section2" && "JEE Mains"}
                {dialog === "section3" && "JEE Advanced"}
                {dialog === "studentDetails" && "Set Student Details"}
              </span>
              <button className="sr-dialog-close" onClick={closeDialog}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="sr-dialog-body">
              {dialog !== "studentDetails" && (
                <div className="sr-dialog-warn">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  Warning: You cannot edit your rank after it has been set. Please double check before confirming.
                </div>
              )}

              {dialog === "section1" && (
                <div className="sr-dialog-field-group">
                  <div className="sr-dialog-field">
                    <label className="sr-dialog-field-label">JEE Mains — Test Rank</label>
                    <input
                      className="sr-input"
                      type="number"
                      inputMode="numeric"
                      min="1" max="1000000"
                      placeholder="Enter Estimated CRL rank"
                      value={inputTestRank}
                      onChange={(e) => { setInputTestRank(e.target.value); setDialogError(null); }}
                      disabled={dialogSubmitting || dialogSuccess}
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              )}

              {dialog === "section2" && (
                <div className="sr-dialog-field-group">
                  <div className="sr-dialog-field">
                    <input
                      className="sr-input"
                      type="number"
                      inputMode="numeric"
                      min="1" max="1000000"
                      placeholder="CRL Rank"
                      value={inputCrlMains}
                      onChange={(e) => { setInputCrlMains(e.target.value); setDialogError(null); }}
                      disabled={dialogSubmitting || dialogSuccess || crl_mains_rank !== 0}
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                    {crl_mains_rank !== 0 && <span className="sr-input-hint warn">Already set — cannot be changed.</span>}
                  </div>
                  {!isGeneral() && (
                    <div className="sr-dialog-field">
                      <input
                        className="sr-input"
                        type="number"
                        inputMode="numeric"
                        min="1" max="1000000"
                        placeholder="Category Rank"
                        value={inputCategoryMains}
                        onChange={(e) => { setInputCategoryMains(e.target.value); setDialogError(null); }}
                        disabled={dialogSubmitting || dialogSuccess || category_mains_rank !== 0}
                        style={{ width: "100%", boxSizing: "border-box" }}
                      />
                      {category_mains_rank !== 0 && <span className="sr-input-hint warn">Already set — cannot be changed.</span>}
                    </div>
                  )}
                </div>
              )}

              {dialog === "section3" && (
                <div className="sr-dialog-field-group">
                  <div className="sr-dialog-field">
                    <input
                      className="sr-input"
                      type="number"
                      inputMode="numeric"
                      min="1" max="2000000"
                      placeholder="CRL Rank"
                      value={inputCrlAdv}
                      onChange={(e) => { setInputCrlAdv(e.target.value); setDialogError(null); }}
                      disabled={dialogSubmitting || dialogSuccess || crl_adv_rank !== 0}
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                    {crl_adv_rank !== 0 && <span className="sr-input-hint warn">Already set — cannot be changed.</span>}
                  </div>
                  {!isGeneral() && (
                    <div className="sr-dialog-field">
                      <input
                        className="sr-input"
                        type="number"
                        inputMode="numeric"
                        min="1" max="1000000"
                        placeholder="Category rank"
                        value={inputCategoryAdv}
                        onChange={(e) => { setInputCategoryAdv(e.target.value); setDialogError(null); }}
                        disabled={dialogSubmitting || dialogSuccess || category_adv_rank !== 0}
                        style={{ width: "100%", boxSizing: "border-box" }}
                      />
                      {category_adv_rank !== 0 && <span className="sr-input-hint warn">Already set, cannot be changed.</span>}
                    </div>
                  )}
                </div>
              )}

              {dialog === "studentDetails" && (
                <div className="sr-dialog-field-group">
                  <div className="sr-dialog-field">
                    <label className="sr-dialog-field-label">Home State</label>
                    <select
                      className="sr-select"
                      value={inputHomeState}
                      onChange={(e) => { setInputHomeState(e.target.value); setDialogError(null); }}
                      disabled={dialogSubmitting || dialogSuccess}
                    >
                      <option value="">— Select State —</option>
                      {HOME_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="sr-dialog-field">
                    <label className="sr-dialog-field-label">Category</label>
                    <select
                      className="sr-select"
                      value={inputCategory}
                      onChange={(e) => { setInputCategory(e.target.value); setDialogError(null); }}
                      disabled={dialogSubmitting || dialogSuccess}
                    >
                      <option value="">— Select Category —</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="sr-dialog-field">
                    <label className="sr-dialog-field-label">Gender</label>
                    <div className="sr-radio-group">
                      {["Male", "Female"].map(g => (
                        <label key={g} className={`sr-radio-label${inputGender === g ? " selected" : ""}`}>
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={inputGender === g}
                            onChange={() => { setInputGender(g); setDialogError(null); }}
                            disabled={dialogSubmitting || dialogSuccess}
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {dialogError && <div className="sr-dialog-error">{dialogError}</div>}

              {dialogSuccess && (
                <div className="sr-toast" style={{ marginTop: 12 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Saved successfully!
                </div>
              )}

              {!dialogSuccess && (
                <div className="sr-dialog-actions">
                  <button className="sr-dialog-btn-cancel" onClick={closeDialog} disabled={dialogSubmitting}>Cancel</button>
                  <button
                    className="sr-dialog-btn-confirm"
                    disabled={dialogSubmitting}
                    onClick={() => {
                      if (dialog === "section1") submitSection1();
                      else if (dialog === "section2") submitSection2();
                      else if (dialog === "section3") submitSection3();
                      else if (dialog === "studentDetails") handleStudentDetailsSubmit();
                    }}
                  >
                    {dialogSubmitting ? "Saving…" : "Confirm"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions Bar ── */}
      {/* <div className="sr-quick-actions">
        <span className="sr-quick-label">Quick Actions</span>
        <Link href="/payments" className="sr-quick-link primary">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Payments
        </Link>
        <Link href="/set-user-rank" className="sr-quick-link">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Set Rank
        </Link>
      </div> */}

      <div className="sr-body">
        <h1 className="sr-title">Set Rank</h1>

        <div className="sr-warning-normal">
          <span style={{ fontWeight: 600, color: "#3b3b3bff" }}>Use Test Rank before Before Your Counselling Starts.</span>
        </div>

        {fetchError && (
          <div className="sr-error-banner">
            {fetchError} &nbsp;
            <button
              onClick={fetchUserDetails}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c", textDecoration: "underline", fontWeight: 700, fontFamily: "inherit", fontSize: 13 }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ════════ TABLE 1 — Saved Ranks ════════ */}
        <div className="sr-table-card">
          {(() => {
            const { text, empty } = rankVal(test_mains_crl);
            return (
              <div className="sr-rank-row">
                <div>
                  <div className="sr-rank-label">
                    JEE Mains (CRL)
                    <span className="sr-tag tag-test">Test Rank</span>
                  </div>
                </div>
                <div className={`sr-rank-value${empty ? " empty" : ""}`}>
                  {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : text}
                </div>
                <div></div>
              </div>
            );
          })()}

          <div className="sr-section-divider" />

          {(() => {
            const { text, empty } = rankVal(crl_mains_rank);
            return (
              <div className="sr-rank-row">
                <div>
                  <div className="sr-rank-label">JEE Mains - CRL</div>
                </div>
                <div className={`sr-rank-value${empty ? " empty" : ""}`}>
                  {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : text}
                </div>
                <div></div>
              </div>
            );
          })()}

          {(() => {
            if (isGeneral()) {
              return (
                <div className="sr-rank-row">
                  <div><div className="sr-rank-label">JEE Mains - Category Rank</div></div>
                  <div><span className="sr-na">Not applicable</span></div>
                  <div></div>
                </div>
              );
            }
            const { text, empty } = rankVal(category_mains_rank);
            return (
              <div className="sr-rank-row">
                <div><div className="sr-rank-label">JEE Mains — Category Rank</div></div>
                <div className={`sr-rank-value${empty ? " empty" : ""}`}>
                  {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : text}
                </div>
                <div></div>
              </div>
            );
          })()}

          <div className="sr-section-divider" />

          {(() => {
            const { text, empty } = rankVal(crl_adv_rank);
            return (
              <div className="sr-rank-row">
                <div><div className="sr-rank-label">JEE Advanced - CRL</div></div>
                <div className={`sr-rank-value${empty ? " empty" : ""}`}>
                  {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : text}
                </div>
                <div></div>
              </div>
            );
          })()}

          {(() => {
            if (isGeneral()) {
              return (
                <div className="sr-rank-row">
                  <div><div className="sr-rank-label">JEE Advanced — Category Rank</div></div>
                  <div><span className="sr-na">Not applicable</span></div>
                  <div></div>
                </div>
              );
            }
            const { text, empty } = rankVal(category_adv_rank);
            return (
              <div className="sr-rank-row">
                <div><div className="sr-rank-label">JEE Advanced — Category Rank</div></div>
                <div className={`sr-rank-value${empty ? " empty" : ""}`}>
                  {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : text}
                </div>
                <div></div>
              </div>
            );
          })()}
        </div>

        {/* ════════ TABLE 2 — Student Details ════════ */}
        <div className="sr-warning">
          <span className="sr-warning-icon">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </span>
          Enter Your Details Carefully. You Can't Edit Your Choice.
        </div>

        <div className="sr-table-card" style={{ marginTop: 0 }}>
          <div className="sr-table-header">
            <span className="sr-table-header-title">Student Details</span>
            <button
              className="sr-set-btn active"
              disabled={loading}
              onClick={() => openDialog("studentDetails")}
            >
              <PencilIcon />
              Set
            </button>
          </div>

          <div className="sr-rank-row-2col">
            <div><div className="sr-rank-label" style={{ fontSize: 14 }}>Home State</div></div>
            <div className={`sr-rank-value${!userDetails?.home_state ? " empty" : ""}`}>
              {loading ? <span className="sr-skeleton" style={{ width: 80 }} /> : userDetails?.home_state || "Not set"}
            </div>
          </div>

          <div className="sr-rank-row-2col">
            <div><div className="sr-rank-label" style={{ fontSize: 14 }}>Gender</div></div>
            <div className={`sr-rank-value${!userDetails?.gender ? " empty" : ""}`}>
              {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : userDetails?.gender || "Not set"}
            </div>
          </div>

          <div className="sr-rank-row-2col">
            <div><div className="sr-rank-label" style={{ fontSize: 14 }}>Category</div></div>
            <div className={`sr-rank-value${!userDetails?.category ? " empty" : ""}`}>
              {loading ? <span className="sr-skeleton" style={{ width: 70 }} /> : userDetails?.category || "Not set"}
            </div>
          </div>
        </div>

        {/* ════════ TABLE 3 — Set Your Ranks ════════ */}
        <div className="sr-warning">
          <span className="sr-warning-icon">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </span>
          Enter Your Details Carefully. You Can't Edit Your Choice.
        </div>

        <div className="sr-setter-card">
          <div className="sr-table-head">
            <span className="sr-setter-new-header">Set Your Rank</span>
            <span className="sr-th">Rank</span>
          </div>

          {/* ── Section A: Test Rank ── */}
          <div className="sr-section-btn-row">
            {(() => {
              const active = josaa_credit || csab_credit;
              const alreadySet = test_mains_crl !== 0;
              return (
                <button
                  className={`sr-set-btn ${alreadySet ? "already-set" : active ? "active" : "inactive"}`}
                  disabled={alreadySet || !active || loading}
                  onClick={() => openDialog("section1")}
                >
                  <PencilIcon />
                  {alreadySet ? "Set ✓" : "Set"}
                </button>
              );
            })()}
          </div>

          {(() => {
            const { text, empty } = rankVal(test_mains_crl);
            return (
              <div className="sr-rank-row">
                <div>
                  <div className="sr-rank-label">
                    JEE Mains
                    <span className="sr-tag tag-test">Test Rank</span>
                  </div>
                </div>
                <div className={`sr-rank-value${empty ? " empty" : ""}`}>
                  {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : text}
                </div>
              </div>
            );
          })()}

          <div className="sr-section-divider" />

          {/* ── Section B: CRL Mains + Category Mains ── */}
          <div className="sr-section-btn-row">
            {(() => {
              const active = josaa_credit || csab_credit;
              const allSet = crl_mains_rank !== 0 && (isGeneral() || category_mains_rank !== 0);
              return (
                <button
                  className={`sr-set-btn ${allSet ? "already-set" : active ? "active" : "inactive"}`}
                  disabled={allSet || !active || loading}
                  onClick={() => openDialog("section2")}
                >
                  <PencilIcon />
                  {allSet ? "Set ✓" : "Set"}
                </button>
              );
            })()}
          </div>

          {(() => {
            const { text, empty } = rankVal(crl_mains_rank);
            return (
              <div className="sr-rank-row">
                <div><div className="sr-rank-label">JEE Mains — CRL</div></div>
                <div className={`sr-rank-value${empty ? " empty" : ""}`}>
                  {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : text}
                </div>
              </div>
            );
          })()}

          {(() => {
            const active = josaa_credit || csab_credit;
            const alreadySet = category_mains_rank !== 0;
            const { text, empty } = rankVal(category_mains_rank);
            return (
              <div className="sr-rank-row">
                <div><div className="sr-rank-label">JEE Mains — Category Rank</div></div>
                <div className={`sr-rank-value${empty ? " empty" : ""}`}>
                  {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : isGeneral() ? <span className="sr-na">Not applicable</span> : text}
                </div>
              </div>
            );
          })()}

          <div className="sr-section-divider" />

          {/* ── Section C: CRL Adv + Category Adv ── */}
          <div className="sr-section-btn-row">
            {(() => {
              const active = josaa_credit;
              const allSet = crl_adv_rank !== 0 && (isGeneral() || category_adv_rank !== 0);
              return (
                <button
                  className={`sr-set-btn ${allSet ? "already-set" : active ? "active" : "inactive"}`}
                  disabled={allSet || !active || loading}
                  onClick={() => openDialog("section3")}
                >
                  <PencilIcon />
                  {allSet ? "Set ✓" : "Set"}
                </button>
              );
            })()}
          </div>

          {(() => {
            const { text, empty } = rankVal(crl_adv_rank);
            return (
              <div className="sr-rank-row">
                <div><div className="sr-rank-label">JEE Advanced — CRL</div></div>
                <div className={`sr-rank-value${empty ? " empty" : ""}`}>
                  {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : text}
                </div>
              </div>
            );
          })()}

          {(() => {
            const alreadySet = category_adv_rank !== 0;
            const { text, empty } = rankVal(category_adv_rank);
            return (
              <div className="sr-rank-row">
                <div><div className="sr-rank-label">JEE Advanced — Category Rank</div></div>
                <div className={`sr-rank-value${empty ? " empty" : ""}`}>
                  {loading ? <span className="sr-skeleton" style={{ width: 60 }} /> : isGeneral() ? <span className="sr-na">Not applicable</span> : text}
                </div>
              </div>
            );
          })()}
        </div>

      </div>
    </>
  );
}