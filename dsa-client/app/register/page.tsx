 "use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try { await authApi.register(name, email, password); window.location.href = "/"; }
    catch (err) { setError(err instanceof Error ? `${err.message}. Connect the backend endpoint to enable account creation.` : "Could not create account."); }
    finally { setLoading(false); }
  }
  return <main className="auth-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <Link href="/" className="auth-back"><ArrowLeft size={15} /> Back to DSA Forge</Link>
    <div className="auth-layout register-layout">
      <section className="auth-pitch"><div className="auth-brand"><div className="brand-mark"><span className="brand-glyph">λ</span></div><span className="brand-name">dsa<span>forge</span></span></div>
        <div className="auth-orb"><div className="orb-ring ring-one" /><div className="orb-ring ring-two" /><div className="orb-core"><span>λ</span></div></div>
        <p className="auth-kicker">YOUR NEXT BREAKTHROUGH STARTS HERE</p><h1>Build intuition.<br />Not just <em>answers.</em></h1>
        <p className="auth-pitch-copy">Create a workspace for thoughtful problem-solving, grounded in trusted DSA material.</p>
      </section>
      <section className="auth-card"><div className="auth-card-top"><span className="auth-overline">GET STARTED</span><span className="auth-step">01 <span>/ 01</span></span></div>
        <h2>Create your account</h2><p className="auth-subtitle">A little curiosity goes a long way.</p>
        <form onSubmit={submit} className="auth-form">
          <label htmlFor="name">Full name</label><input id="name" autoComplete="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <label htmlFor="password">Password</label><div className="password-field"><input id="password" type={show ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /><button type="button" aria-label="Toggle password visibility" onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>{loading ? "Creating account…" : "Create account"} <ArrowRight size={16} /></button>
        </form>
        <p className="auth-switch">Already have an account? <Link href="/login">Sign in <ArrowRight size={13} /></Link></p>
        <div className="auth-security"><ShieldCheck size={14} /><span>Secure sessions · Your data stays yours</span></div>
      </section>
    </div><div className="auth-footer"><span>© 2026 DSA Forge</span><span>LEARN WITH INTENTION.</span></div>
  </main>;
}
