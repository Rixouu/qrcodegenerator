"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Toaster } from "sonner";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function AppToaster() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const { resolvedTheme } = useTheme();

  const theme =
    !mounted || resolvedTheme === undefined
      ? "system"
      : resolvedTheme === "dark"
        ? "dark"
        : "light";

  return <Toaster position="bottom-center" richColors theme={theme} />;
}
