"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import { useClientMounted } from "@/hooks/use-client-mounted";

export function AppToaster() {
  const mounted = useClientMounted();
  const { resolvedTheme } = useTheme();

  const theme =
    !mounted || resolvedTheme === undefined
      ? "system"
      : resolvedTheme === "dark"
        ? "dark"
        : "light";

  return <Toaster position="bottom-center" richColors theme={theme} />;
}
