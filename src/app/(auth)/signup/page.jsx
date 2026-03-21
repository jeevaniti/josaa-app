// src/app/(auth)/signup/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  .auth-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Open Sans', sans-serif;
    background: #F8FAFC;
    -webkit-font-smoothing: antialiased;
  }

  .auth-left {
    width: 420px;
    flex-shrink: 0;
    background: #0F172A;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px 44px;
    position: relative;
    overflow: hidden;
  }

  .auth-left::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%);
    pointer-events: none;
  }

  .auth-left::after {
    content: '';
    position: absolute;
    bottom: -60px; left: -60px;
    width: 240px; height: 240px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .auth-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .auth-brand-icon {
    width: 38px; height: 38px;
    background: white;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Instrument Serif', Georgia, serif;
    font-weight: 900;
    font-size: 15px;
    font-style: italic;
    color: #0F172A;
    flex-shrink: 0;
  }

  .auth-brand-name {
    font-size: 17px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.01em;
  }

  .auth-left-body { z-index: 1; position: relative; }

  .auth-left-tagline {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: clamp(26px, 3vw, 34px);
    font-weight: 400;
    color: white;
    line-height: 1.25;
    margin-bottom: 16px;
  }

  .auth-left-tagline em { color: #a78bfa; font-style: italic; }

  .auth-left-sub {
    font-size: 13.5px;
    color: #94a3b8;
    font-weight: 500;
    line-height: 1.6;
    max-width: 300px;
  }

  .auth-steps {
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .auth-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .auth-step-num {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .auth-step-text {
    font-size: 13px;
    color: #cbd5e1;
    font-weight: 500;
    line-height: 1.5;
  }

  .auth-step-text strong { color: white; font-weight: 700; }

  .auth-left-footer {
    font-size: 11px;
    color: #475569;
    font-weight: 500;
    z-index: 1;
    position: relative;
  }

  .auth-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
  }

  .auth-card-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 28px;
    font-weight: 400;
    color: #0F172A;
    margin-bottom: 4px;
  }

  .auth-card-sub {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 28px;
  }

  .auth-card-sub a {
    color: #2563EB;
    font-weight: 700;
    text-decoration: none;
  }

  .auth-card-sub a:hover { text-decoration: underline; }

  .google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 11px 16px;
    background: white;
    border: 1.5px solid #E2E8F0;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 700;
    color: #0F172A;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    font-family: 'Open Sans', sans-serif;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  .google-btn:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .google-icon { width: 18px; height: 18px; flex-shrink: 0; }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .divider-line { flex: 1; height: 1px; background: #E2E8F0; }

  .divider-text {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  .auth-form { display: flex; flex-direction: column; gap: 14px; }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .form-field { display: flex; flex-direction: column; gap: 6px; }

  .form-label {
    font-size: 12px;
    font-weight: 700;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .form-input {
    padding: 10px 13px;
    border: 1.5px solid #E2E8F0;
    border-radius: 7px;
    font-size: 14px;
    font-weight: 500;
    color: #0F172A;
    background: white;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: 'Open Sans', sans-serif;
    outline: none;
    width: 100%;
  }

  .form-input:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  .form-input::placeholder { color: #94a3b8; }
  .form-input.error { border-color: #ef4444; }
  .form-input.error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }

  .password-hint {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 500;
    margin-top: 2px;
  }

  .error-msg {
    font-size: 12px;
    color: #ef4444;
    font-weight: 600;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    padding: 9px 12px;
  }

  .submit-btn {
    width: 100%;
    padding: 11.5px 16px;
    background: #0F172A;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    font-family: 'Open Sans', sans-serif;
    margin-top: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
  }

  .submit-btn:hover { background: #1e293b; }
  .submit-btn:active { transform: scale(0.99); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .terms-note {
    font-size: 11.5px;
    color: #94a3b8;
    font-weight: 500;
    text-align: center;
    line-height: 1.5;
    margin-top: 8px;
  }

  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .auth-root { flex-direction: column; }
    .auth-left {
      width: 100%;
      padding: 28px 24px;
    }
    .auth-left-body { padding: 20px 0 8px; }
    .auth-left-footer { display: none; }
    .auth-right { padding: 32px 20px; }
    .auth-left::before, .auth-left::after { display: none; }
    .form-row { grid-template-columns: 1fr; }
  }
`;

const googleProvider = new GoogleAuthProvider();

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // If already logged in → redirect to dashboard immediately
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        setAuthChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  function friendlyError(code) {
    switch (code) {
      case "auth/email-already-in-use": return "An account with this email already exists. Try logging in.";
      case "auth/weak-password": return "Password must be at least 6 characters.";
      case "auth/invalid-email": return "Please enter a valid email address.";
      default: return "Something went wrong. Please try again.";
    }
  }

  // ── Creates the DynamoDB row via /api/create-user ─────────────────────────
  // Must be called after EVERY successful Firebase sign-up/sign-in,
  // for both email and Google flows. Without this, fetch_user_details
  // returns 404 because the DynamoDB record doesn't exist yet.
  async function createUserAPI(user) {
    const token = await user.getIdToken();
    await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name.trim() });

      // Create DynamoDB row — this is what was missing
      await createUserAPI(cred.user);

      router.push("/dashboard");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);

      // Create DynamoDB row — this was also missing for Google sign-up
      await createUserAPI(cred.user);

      router.push("/dashboard");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(friendlyError(err.code));
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>

      {/* Blank screen while Firebase checks auth — prevents flash of login UI */}
      {authChecking ? null : (
        <div className="auth-root">

          {/* Left panel */}
          <div className="auth-left">
            <div className="auth-brand">
              <div className="auth-brand-icon">JM</div>
              <span className="auth-brand-name">JOSAA Master</span>
            </div>

            <div className="auth-left-body">
              <h2 className="auth-left-tagline">
                Start your <em>college journey</em> today.
              </h2>
              <p className="auth-left-sub">
                Set up your profile in seconds and get personalized college predictions instantly.
              </p>
              <div className="auth-steps">
                <div className="auth-step">
                  <span className="auth-step-num">1</span>
                  <p className="auth-step-text"><strong>Create your account</strong></p>
                </div>
                <div className="auth-step">
                  <span className="auth-step-num">2</span>
                  <p className="auth-step-text"><strong>Set your JEE rank</strong></p>
                </div>
                <div className="auth-step">
                  <span className="auth-step-num">3</span>
                  <p className="auth-step-text"><strong>Find colleges</strong></p>
                </div>
              </div>
            </div>

            <p className="auth-left-footer">© 2025 JOSAA Master. All rights reserved.</p>
          </div>

          {/* Right panel */}
          <div className="auth-right">
            <div className="auth-card">
              <h1 className="auth-card-title">Create an account.</h1>
              <p className="auth-card-sub">
                Already have one? <a href="/login">Sign in</a>
              </p>

              <button className="google-btn" onClick={handleGoogle} disabled={googleLoading || loading}>
                {googleLoading ? (
                  <div className="spinner" style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#0F172A" }} />
                ) : (
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                {googleLoading ? "Creating account…" : "Continue with Google"}
              </button>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">or with email</span>
                <div className="divider-line" />
              </div>

              <form className="auth-form" onSubmit={handleSignup}>
                {/* <div className="form-field">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Arjun Kumar"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(""); }}
                  autoComplete="name"
                />
              </div> */}

                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input
                    className={`form-input${error && error.includes("email") ? " error" : ""}`}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Password</label>
                    <input
                      className={`form-input${error && error.includes("assword") ? " error" : ""}`}
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Confirm</label>
                    <input
                      className={`form-input${error && error.includes("match") ? " error" : ""}`}
                      type="password"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setError(""); }}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {error && <p className="error-msg">{error}</p>}

                <button className="submit-btn" type="submit" disabled={loading || googleLoading}>
                  {loading ? <><div className="spinner" /> Creating account…</> : "Create account →"}
                </button>

                <p className="terms-note">
                  By signing up you agree to our <a href="/terms"> Terms of Service</a> and <a href="/privacy">Privacy Policy.</a>
                </p>
              </form>
            </div>
          </div>

        </div>
      )}
    </>
  );
}