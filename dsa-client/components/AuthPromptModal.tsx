"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, BrainCircuit, ShieldCheck, Sparkles, X, Zap } from "lucide-react";

interface Props {
  onDismiss: () => void;
}

export default function AuthPromptModal({ onDismiss }: Props) {
  const router = useRouter();

  function goSignUp() {
    router.push("/register");
  }

  function goSignIn() {
    router.push("/login");
  }

  return (
    <div className="auth-gate-overlay" role="dialog" aria-modal="true" aria-label="Sign up to continue">
      {/* Backdrop — clicking it dismisses */}
      <div className="auth-gate-backdrop" onClick={onDismiss} />

      <div className="auth-gate-card">
        {/* Dismiss */}
        <button className="auth-gate-close" onClick={onDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>

        {/* Orb */}
        <div className="auth-gate-orb">
          <div className="auth-gate-ring ring-a" />
          <div className="auth-gate-ring ring-b" />
          <div className="auth-gate-core">
            <span>λ</span>
          </div>
          <Sparkles className="gate-spark gate-spark-a" size={13} />
          <Sparkles className="gate-spark gate-spark-b" size={9} />
        </div>

        {/* Kicker */}
        <p className="auth-gate-kicker">
          <ShieldCheck size={12} /> YOU&rsquo;RE GETTING THE HANG OF THIS
        </p>

        {/* Headline */}
        <h2 className="auth-gate-title">
          Save your progress.<br />
          <span>Keep the momentum.</span>
        </h2>

        {/* Body copy */}
        <p className="auth-gate-body">
          You&rsquo;ve been exploring for a bit — create a free account to save
          conversations, track what you&rsquo;ve learned, and pick up right where
          you left off next time.
        </p>

        {/* Proof points */}
        <ul className="auth-gate-proof">
          <li><BrainCircuit size={13} /> Full conversation history</li>
          <li><Zap size={13} /> Unlimited questions</li>
          <li><ShieldCheck size={13} /> Private by design — your data, your workspace</li>
        </ul>

        {/* CTAs */}
        <div className="auth-gate-actions">
          <button className="auth-gate-primary" onClick={goSignUp}>
            Create free account
            <ArrowRight size={15} />
          </button>
          <button className="auth-gate-secondary" onClick={goSignIn}>
            Sign in
          </button>
        </div>

        {/* Dismiss link */}
        <button className="auth-gate-skip" onClick={onDismiss}>
          Continue as guest — I&rsquo;ll sign up later
        </button>
      </div>
    </div>
  );
}
