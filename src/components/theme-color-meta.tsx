"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const LIGHT = "#fafafc";
const DARK = "#252525";

/**
 * Updates `<meta name="theme-color">` from the resolved app theme (PWA / mobile chrome).
 */
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const content = resolvedTheme === "dark" ? DARK : LIGHT;
    let meta = document.querySelector(
      'meta[name="theme-color"][data-managed="app"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      meta.setAttribute("data-managed", "app");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }, [resolvedTheme]);

  return null;
}
