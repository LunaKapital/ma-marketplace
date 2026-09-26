"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(url, body) {
    setBusy(true); setError("");
    try {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setError(data.error || "Something went wrong."); return false; }
      return true;
    } catch { setError("Network error. Please try again."); return false; }
    finally { setBusy(false); }
  }

  async function sendCode(e) {
    e?.preventDefault();
    if (await post("/api/auth/request", { email })) setStep("code");
  }
  async function verify(e) {
    e.preventDefault();
    if (await post("/api/auth/verify", { code })) {
      const next = params.get("next");
      router.push(next && next.startsWith("/") ? next : "/account");
      router.refresh();
    }
  }

  return (
    <div className="wrap narrow">
      <div className="card">
        {step === "email" ? (
          <form onSubmit={sendCode}>
            <h1>Log in or sign up</h1>
            <p className="muted">No password needed. We'll email you a 6-digit code. New here? An account is created automatically.</p>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            {error && <p className="error" role="alert">{error}</p>}
            <button className="btn big" disabled={busy}>{busy ? "Sending…" : "Send me a code"}</button>
          </form>
        ) : (
          <form onSubmit={verify}>
            <h1>Check your email</h1>
            <p className="muted">We sent a 6-digit code to <b>{email}</b>. It expires in 10 minutes.</p>
            <label htmlFor="code">Login code</label>
            <input id="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={7} required autoFocus value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="code" />
            {error && <p className="error" role="alert">{error}</p>}
            <button className="btn big" disabled={busy}>{busy ? "Verifying…" : "Log in"}</button>
            <button type="button" className="link" onClick={() => { setStep("email"); setCode(""); setError(""); }}>Use a different email</button>
            <button type="button" className="link" onClick={sendCode} disabled={busy}>Resend code</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  return <Suspense><LoginForm /></Suspense>;
}
