"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Footer from "@/components/Footer";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');

  *, *::before, *::after {
    margin: 0; padding: 0; box-sizing: border-box;
  }

  :root {
    --color-blue: #2563EB;
    --color-blue-dark: #1D4ED8;
    --color-text-primary: #0a101dff;
    --color-text-secondary: #282a2eff;
    --color-text-muted: #666666ff;
    --color-border: #E2E8F0;
    --color-bg: #F8FAFC;
    --color-card: #FFFFFF;
    --color-green: #16a34a;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-full: 9999px;
    --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05);
    --sidebar-w: 240px;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Open Sans', sans-serif;
    background-color: var(--color-bg);
    color: var(--color-text-primary);
    -webkit-font-smoothing: antialiased;
  }

  button { cursor: pointer; border: none; background: none; font-family: inherit; }
  a { text-decoration: none; color: inherit; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  .shell {
    display: flex;
    min-height: 100vh;
  }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: var(--sidebar-w);
    background: var(--color-card);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    z-index: 200;
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
  }

  .sidebar-top {
    padding: 20px 18px 0;
    flex-shrink: 0;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
    text-decoration: none;
  }

  .sidebar-logo-icon {
    width: 34px;
    height: 34px;
    background: rgb(37,37,37);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    font-size: 14px;
    flex-shrink: 0;
    font-style: Italic;
    font-family: 'Inter';
  }

  .sidebar-logo-text {
    font-weight: 800;
    font-size: 16px;
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
    line-height: 1.1;
  }

  .sidebar-nav-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
    padding: 0 10px;
    margin-bottom: 6px;
  }

  .sidebar-nav {
    flex: 1;
    padding: 0 10px;
    overflow-y: auto;
  }

  .sidebar-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease;
    margin-bottom: 2px;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }

  .sidebar-nav-item:hover {
    background: #f1f5f9;
    color: var(--color-text-primary);
  }

  .sidebar-nav-item.active {
    background: #eff6ff;
    color: var(--color-blue);
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .sidebar-nav-item.active .nav-icon { opacity: 1; }

  /* Profile */
  .sidebar-profile {
    padding: 14px 18px;
    border-top: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .sidebar-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    border: 2px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #1d4ed8;
    flex-shrink: 0;
    overflow: hidden;
  }

  .sidebar-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .sidebar-user-info {
    flex: 1;
    min-width: 0;
  }

  .sidebar-user-name {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-user-sub {
    font-size: 10px;
    color: var(--color-text-muted);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-logout-btn {
    padding: 5px 10px;
    border-radius: var(--radius-sm);
    font-size: 11px;
    font-weight: 700;
    color: #ef4444;
    border: 1px solid #fecaca;
    background: #fef2f2;
    transition: all 0.15s ease;
    flex-shrink: 0;
    cursor: pointer;
  }

  .sidebar-logout-btn:hover {
    background: #fee2e2;
    border-color: #fca5a5;
  }

  /* Mobile header */
  .mobile-header {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 54px;
    background: var(--color-card);
    border-bottom: 1px solid var(--color-border);
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 150;
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mobile-logo-icon {
    width: 28px;
    height: 28px;
    background: rgb(37,37,37);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    font-size: 12px;
    font-style: italic;
    font-family: serif;
  }

  .mobile-logo-text {
    font-weight: 800;
    font-size: 15px;
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
  }

  .mobile-hamburger {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    transition: background 0.15s ease;
  }

  .mobile-hamburger:hover { background: #f1f5f9; }

  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: 190;
    backdrop-filter: blur(2px);
  }

  .sidebar-overlay.open { display: block; }

  /* Main */
  .main-content {
    margin-left: var(--sidebar-w);
    flex: 1;
    min-height: 100vh;
    background: var(--color-bg);
    display: flex;
    flex-direction: column;
  }

  .main-content-inner {
    flex: 1;
  }

  /* Auth loading screen */
  .auth-loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
  }

  .auth-loading-spinner {
    width: 28px; height: 28px;
    border: 2.5px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
      box-shadow: 4px 0 24px rgba(0,0,0,0.12);
    }

    .sidebar.open { transform: translateX(0); }
    .mobile-header { display: flex; }

    .main-content {
      margin-left: 0;
      padding-top: 54px;
    }
  }
`;

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "payments",
    label: "Payments",
    path: "/payments",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <path strokeLinecap="round" d="M1 10h22" />
      </svg>
    ),
  },
  {
    id: "find-college",
    label: "Find Colleges",
    path: "/college-finder",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: "set-rank",
    label: "Set Rank",
    path: "/set-user-rank",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M9 12h6M9 16h6M13 4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-6-5z" />
      </svg>
    ),
  },
  {
    id: "help-support",
    label: "Help and Support",
    path: "/contact",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
      </svg>
    ),
  },
];

function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/login");
      } else {
        setUser(firebaseUser);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  function navigate(path) {
    router.push(path);
    setSidebarOpen(false);
  }

  if (authLoading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="auth-loading">
          <div className="auth-loading-spinner" />
        </div>
      </>
    );
  }

  if (!user) return null;

  const displayName = user.displayName || "";
  const displayEmail = user.email || "";
  const initials = getInitials(displayName, displayEmail);
  const photoURL = user.photoURL;

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">

        {/* Mobile overlay */}
        <div
          className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile top bar */}
        <header className="mobile-header">
          <div className="mobile-logo">
            <div className="mobile-logo-icon">JM</div>
            <span className="mobile-logo-text">JOSAA Master</span>
          </div>
          <button
            className="mobile-hamburger"
            onClick={() => setSidebarOpen(p => !p)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </header>

        {/* Sidebar */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>

          <div className="sidebar-top">
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">JM</div>
              <div className="sidebar-logo-text">JOSAA Master</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`sidebar-nav-item${pathname === item.path ? " active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* User profile + logout */}
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {photoURL
                ? <img src={photoURL} alt={displayName} referrerPolicy="no-referrer" />
                : initials
              }
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name" title={displayName || displayEmail}>
                {displayName || displayEmail}
              </p>
              <p className="sidebar-user-sub" title={displayEmail}>
                {displayName ? displayEmail : "JEE 2025"}
              </p>
            </div>
            <button className="sidebar-logout-btn" onClick={handleLogout}>Logout</button>
          </div>

        </aside>

        {/* Page content */}
        <main className="main-content">
          <div className="main-content-inner">
            {children}
          </div>
          <Footer />
        </main>

      </div>
    </>
  );
}