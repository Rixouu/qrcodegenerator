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
          "flex h-10 w-[126px] shrink-0 rounded-full border border-border bg-background",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1 rounded-full border border-border bg-background p-1",
        className,
      )}
      role="group"
      aria-label="Color theme"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 rounded-full px-0 text-muted-foreground",
          theme === "light" && "bg-muted text-foreground",
        )}
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        aria-label="Light theme"
        title="Light"
      >
        <Sun className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 rounded-full px-0 text-muted-foreground",
          theme === "system" && "bg-muted text-foreground",
        )}
        onClick={() => setTheme("system")}
        aria-pressed={theme === "system"}
        aria-label="System theme"
        title="System"
      >
        <Monitor className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 rounded-full px-0 text-muted-foreground",
          theme === "dark" && "bg-muted text-foreground",
        )}
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
