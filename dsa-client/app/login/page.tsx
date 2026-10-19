 "use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await authApi.login(email, password);
      window.location.href = "/";
    } catch (err) {
      setDemo(true);
      setError(err instanceof Error ? `${err.message}. Backend is not connected yet; this UI is ready for integration.` : "Could not sign in. Check your backend connection.");
    } finally { setLoading(false); }
  }

  return <main className="auth-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <Link href="/" className="auth-back"><ArrowLeft size={15} /> Back to DSA Forge</Link>
    <div className="auth-layout">
      <section className="auth-pitch">
        <div className="auth-brand"><div className="brand-mark"><span className="brand-glyph">λ</span></div><span className="brand-name">dsa<span>forge</span></span></div>
        <div className="auth-orb"><div className="orb-ring ring-one" /><div className="orb-ring ring-two" /><div className="orb-core"><span>λ</span></div><Sparkles className="orb-spark spark-a" size={16} /></div>
        <p className="auth-kicker">A BETTER WAY TO THINK</p>
        <h1>Make the hard<br />stuff <em>click.</em></h1>
        <p className="auth-pitch-copy">Your personal DSA study partner. Grounded explanations, clear mental models, and a knowledge base that keeps the signal high.</p>
        <div className="auth-proof"><span><ShieldCheck size={15} /> Private by design</span><span><Sparkles size={14} /> Built for depth</span></div>
      </section>
      <section className="auth-card">
        <div className="auth-card-top"><span className="auth-overline">WELCOME BACK</span><span className="auth-step">01 <span>/ 01</span></span></div>
        <h2>Sign in to your workspace</h2><p className="auth-subtitle">Pick up where your curiosity left off.</p>
        <form onSubmit={submit} className="auth-form">
          <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <div className="password-label"><label htmlFor="password">Password</label><button type="button" className="text-link" onClick={() => setError("Password reset flow can be connected to your backend.")}>Forgot password?</button></div>
          <div className="password-field"><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"} <ArrowRight size={16} /></button>
        </form>
        <div className="auth-separator"><span /> <small>OR</small> <span /></div>
        <p className="auth-switch">New to the forge? <Link href="/register">Create an account <ArrowRight size={13} /></Link></p>
        <div className="auth-security"><ShieldCheck size={14} /><span>Session protected · Secure token flow ready</span></div>
      </section>
    </div>
    <div className="auth-footer"><span>© 2026 DSA Forge</span><span>LEARN WITH INTENTION.</span></div>
  </main>;
}
