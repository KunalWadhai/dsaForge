"use client";

/**
 * useAuthGate
 *
 * Shows an auth prompt after `delayMs` ms on the page without a session.
 * Uses the shared `bootstrapAuth()` singleton — so even if React Strict Mode
 * mounts this twice, only one /auth/refresh is ever fired.
 */

import { useEffect, useRef, useState } from "react";
import { getAccessToken, bootstrapAuth } from "./api";

const DISMISSED_KEY = "dsa_gate_dismissed";

interface Options {
  delayMs?: number;
}

export function useAuthGate({ delayMs = 2 * 60 * 1000 }: Options = {}) {
  const [showGate, setShowGate] = useState(false);
  const authenticatedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function markAuthenticated() {
    authenticatedRef.current = true;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setShowGate(false);
  }

  function dismiss() {
    setShowGate(false);
    try { sessionStorage.setItem(DISMISSED_KEY, "1"); } catch { /* ignore */ }
  }

  useEffect(() => {
    // Fast synchronous check first.
    if (getAccessToken()) { markAuthenticated(); return; }

    // Already dismissed this browser session.
    try { if (sessionStorage.getItem(DISMISSED_KEY)) return; } catch { /* ignore */ }

    let cancelled = false;

    bootstrapAuth().then((user) => {
      if (cancelled) return;
      if (user || getAccessToken()) {
        markAuthenticated();
        return;
      }
      // No session — start the countdown.
      timerRef.current = setTimeout(() => {
        if (!authenticatedRef.current && getAccessToken() === null) {
          setShowGate(true);
        }
      }, delayMs);
    });

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { showGate, dismiss, markAuthenticated };
}
