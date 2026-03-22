"use client";

import { useLayoutEffect, useEffect } from "react";

/**
 * Avoids a small downward scroll offset on first paint / refresh caused by
 * browser scroll restoration, hydration, and smooth-scroll interacting badly.
 */
export default function ScrollToTopOnLoad() {
  useLayoutEffect(() => {
    if (!window.location.hash || window.location.hash === "#") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    const prev = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const id = requestAnimationFrame(() => {
      if (!window.location.hash || window.location.hash === "#") {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    });

    return () => {
      cancelAnimationFrame(id);
      history.scrollRestoration = prev;
    };
  }, []);

  return null;
}
