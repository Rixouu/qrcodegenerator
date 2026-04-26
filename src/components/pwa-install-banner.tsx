"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pwa-install-banner-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  const mq = window.matchMedia("(display-mode: standalone)");
  if (mq.matches) return true;
  return Boolean(window.navigator.standalone);
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  return isIos && isSafari;
}

export function PwaInstallBanner() {
  const mounted = useClientMounted();
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setVisible(false);
    setIosHint(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isStandalone()) return;

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      dismissed = false;
    }
    if (dismissed) return;

    const t = window.setTimeout(() => {
      if (isIosSafari()) {
        setIosHint(true);
        setVisible(true);
      }
    }, 1200);

    const onBeforeInstall = (e: Event) => {
      window.clearTimeout(t);
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIosHint(false);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.clearTimeout(t);
    };
  }, [mounted]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => undefined);
    setDeferredPrompt(null);
    dismiss();
  };

  if (!mounted || !visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur-md",
        "pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3",
      )}
      role="dialog"
      aria-label="Install app"
    >
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- static PWA icon */}
          <img
            src="/icons/apple-touch-icon.png"
            alt=""
            width={48}
            height={48}
            className="size-12 object-contain p-1"
            fetchPriority="high"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold leading-tight">
            {iosHint && !deferredPrompt
              ? "Add to Home Screen"
              : "Install QR Code Generator"}
          </p>
          {iosHint && !deferredPrompt ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tap the Share button{" "}
              <span className="whitespace-nowrap font-medium text-foreground">
                (square with arrow)
              </span>
              , then choose{" "}
              <span className="font-medium text-foreground">
                Add to Home Screen
              </span>
              .
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Install the app for quick access and offline-friendly caching.
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {deferredPrompt ? (
              <Button type="button" size="sm" onClick={handleInstall}>
                Install
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="outline" onClick={dismiss}>
              {deferredPrompt ? "Not now" : "Got it"}
            </Button>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 -mt-1"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
