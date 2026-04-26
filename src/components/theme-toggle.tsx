"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const mounted = useClientMounted();
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex h-9 w-[104px] shrink-0 rounded-lg border border-border bg-muted/30",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5 shadow-sm",
        className,
      )}
      role="group"
      aria-label="Color theme"
    >
      <Button
        type="button"
        variant={theme === "light" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 w-8 px-0"
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        aria-label="Light theme"
        title="Light"
      >
        <Sun className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant={theme === "system" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 w-8 px-0"
        onClick={() => setTheme("system")}
        aria-pressed={theme === "system"}
        aria-label="System theme"
        title="System"
      >
        <Monitor className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant={theme === "dark" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 w-8 px-0"
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        aria-label="Dark theme"
        title="Dark"
      >
        <Moon className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
