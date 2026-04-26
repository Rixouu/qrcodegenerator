"use client";

import { useEffect, useState } from "react";

/**
 * True after the first client effect — use for next-themes / Sonner / PWA UI that must not SSR mismatch.
 */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    void Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);
  return mounted;
}
