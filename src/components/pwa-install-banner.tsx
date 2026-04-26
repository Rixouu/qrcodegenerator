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
        "fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md animate-in slide-in-from-bottom-5 fade-in duration-500",
        "rounded-2xl border border-border/50 bg-background/80 p-3 shadow-2xl backdrop-blur-xl",
        "dark:bg-black/60 dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] dark:border-white/10",
      )}
      role="dialog"
      aria-label="Install app"
    >
      <div className="flex items-center gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element -- static PWA icon */}
          <img
            src="/icons/apple-touch-icon.png"
            alt=""
            width={44}
            height={44}
            className="size-full object-cover"
            fetchPriority="high"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {iosHint && !deferredPrompt
              ? "Add to Home Screen"
              : "Install QR Code Generator"}
          </p>
          {iosHint && !deferredPrompt ? (
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">
              Tap Share, then choose <span className="font-medium text-foreground">Add to Home Screen</span>.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">
              Get the app for offline access.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 ml-2">
          {deferredPrompt ? (
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full px-4 text-xs font-semibold shadow-md transition-transform hover:scale-105 active:scale-95"
              onClick={handleInstall}
            >
              Install
            </Button>
          ) : null}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={dismiss}
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
