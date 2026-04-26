export type QrErrorLevel = "L" | "M" | "Q" | "H";

export interface QrHistoryEntry {
  id: string;
  value: string;
  fgColor: string;
  bgColor: string;
  level: QrErrorLevel;
  size: number;
  createdAt: number;
}

const STORAGE_KEY = "qr-code-generator-history-v1";
export const HISTORY_LIMIT = 20;

function randomId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadQrHistory(): QrHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row): row is QrHistoryEntry =>
          typeof row === "object" &&
          row !== null &&
          typeof (row as QrHistoryEntry).value === "string",
      )
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function persistQrHistory(entries: QrHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, HISTORY_LIMIT)),
    );
  } catch {
    /* quota */
  }
}

export function pushQrHistory(
  entry: Omit<QrHistoryEntry, "id" | "createdAt">,
): void {
  const prev = loadQrHistory();
  const next: QrHistoryEntry = {
    ...entry,
    id: randomId(),
    createdAt: Date.now(),
  };
  const rest = prev.filter(
    (e) =>
      e.value !== next.value ||
      e.fgColor !== next.fgColor ||
      e.bgColor !== next.bgColor ||
      e.level !== next.level ||
      e.size !== next.size,
  );
  persistQrHistory([next, ...rest].slice(0, HISTORY_LIMIT));
}
