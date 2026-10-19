"use client";

/**
 * useAuthGate
 *
 * Shows an auth prompt after the user has been on the page for
 * `delayMs` milliseconds without an authenticated session.
 *
 * Detection strategy (two-pass):
 *  1. Synchronous:  getAccessToken() — fast, truthy immediately after
 *                   a login/register in the same tab.
 *  2. Async:        silently attempt /auth/refresh using the HttpOnly
 *                   cookie — catches "returning users" who have a valid
 *                   session from a previous visit.
 *
 * The timer is cancelled as soon as either check confirms auth.
 * Once dismissed, the decision is persisted in sessionStorage so the
 * modal doesn't reappear if the user refreshes during the same browser
 * session.
 */

import { useEffect, useRef, useState } from "react";
import { getAccessToken, setAccessToken } from "./api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const DISMISSED_KEY = "dsa_gate_dismissed";

interface Options {
  /** How long (ms) before showing the modal for unauthenticated users. Default: 120 000 (2 min) */
  delayMs?: number;
}

export function useAuthGate({ delayMs = 2 * 60 * 1000 }: Options = {}) {
  const [showGate, setShowGate] = useState(false);
  // Track auth status so the timer can be cancelled if the user logs in.
  const authenticatedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── helpers ─────────────────────────────────────────────────── */

  function markAuthenticated() {
    authenticatedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowGate(false);
  }

  function dismiss() {
    setShowGate(false);
    // Remember for the whole browser session so we don't re-annoy.
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // sessionStorage can be blocked in privacy mode — ignore.
    }
  }

  /* ── on mount ────────────────────────────────────────────────── */

  useEffect(() => {
    // 1. Already have an in-memory token → user is authenticated right now.
    if (getAccessToken()) {
      markAuthenticated();
      return;
    }

    // 2. User already dismissed this session → don't show again.
    try {
      if (sessionStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      /* ignore */
    }

    // 3. Silently try to restore session from the HttpOnly refresh cookie.
    //    If it succeeds the user has a valid prior session — no modal needed.
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          const token = data?.data?.accessToken;
          if (token) {
            setAccessToken(token);
            markAuthenticated();
            return; // timer never starts
          }
        }
      } catch {
        // Network error or no cookie — expected for truly new visitors.
      }

      // 4. No valid session found. Start the countdown.
      if (!cancelled) {
        timerRef.current = setTimeout(() => {
          // One last check — the user might have logged in while we waited.
          if (!authenticatedRef.current && getAccessToken() === null) {
            setShowGate(true);
          }
        }, delayMs);
      }
    })();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { showGate, dismiss, markAuthenticated };
}
