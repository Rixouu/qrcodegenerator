export type QrErrorLevel = "L" | "M" | "Q" | "H";

export interface QrHistoryEntry {
  id: string;
  value: string;
  fgColor: string;
  bgColor: string;
  level: QrErrorLevel;
  size: number;
  createdAt: number;
  label?: string;
  tags?: string[];
  favorite?: boolean;
}

const STORAGE_KEY_V1 = "qr-code-generator-history-v1";
const STORAGE_KEY = "qr-code-generator-history-v2";
export const HISTORY_LIMIT = 20;

function randomId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeEntry(row: unknown): QrHistoryEntry | null {
  if (typeof row !== "object" || row === null) return null;
  const value = (row as Partial<QrHistoryEntry>).value;
  if (typeof value !== "string") return null;

  const fgColor = (row as Partial<QrHistoryEntry>).fgColor;
  const bgColor = (row as Partial<QrHistoryEntry>).bgColor;
  const level = (row as Partial<QrHistoryEntry>).level;
  const size = (row as Partial<QrHistoryEntry>).size;
  const createdAt = (row as Partial<QrHistoryEntry>).createdAt;

  const id =
    typeof (row as Partial<QrHistoryEntry>).id === "string"
      ? (row as Partial<QrHistoryEntry>).id!
      : randomId();

  const normalized: QrHistoryEntry = {
    id,
    value,
    fgColor: typeof fgColor === "string" ? fgColor : "#171717",
    bgColor: typeof bgColor === "string" ? bgColor : "#ffffff",
    level: (level === "L" || level === "M" || level === "Q" || level === "H") ? level : "M",
    size: typeof size === "number" && Number.isFinite(size) ? size : 200,
    createdAt: typeof createdAt === "number" && Number.isFinite(createdAt) ? createdAt : Date.now(),
    label: typeof (row as Partial<QrHistoryEntry>).label === "string"
      ? (row as Partial<QrHistoryEntry>).label
      : undefined,
    tags: Array.isArray((row as Partial<QrHistoryEntry>).tags)
      ? (row as Partial<QrHistoryEntry>).tags?.filter((t): t is string => typeof t === "string")
      : undefined,
    favorite: typeof (row as Partial<QrHistoryEntry>).favorite === "boolean"
      ? (row as Partial<QrHistoryEntry>).favorite
      : undefined,
  };

  if (normalized.tags?.length === 0) normalized.tags = undefined;
  if (normalized.label?.trim() === "") normalized.label = undefined;

  return normalized;
}

function readRaw(key: string): unknown {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function loadQrHistory(): QrHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = readRaw(STORAGE_KEY) ?? readRaw(STORAGE_KEY_V1);
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed
      .map(normalizeEntry)
      .filter((e): e is QrHistoryEntry => e !== null);
    normalized.sort((a, b) => {
      const af = a.favorite ? 1 : 0;
      const bf = b.favorite ? 1 : 0;
      if (af !== bf) return bf - af;
      return b.createdAt - a.createdAt;
    });
    return normalized.slice(0, HISTORY_LIMIT);
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

function updateQrHistory(
  updater: (prev: QrHistoryEntry[]) => QrHistoryEntry[],
): QrHistoryEntry[] {
  const prev = loadQrHistory();
  const next = updater(prev).slice(0, HISTORY_LIMIT);
  persistQrHistory(next);
  return next;
}

export function pushQrHistory(
  entry: Omit<QrHistoryEntry, "id" | "createdAt">,
): void {
  updateQrHistory((prev) => {
    const existing = prev.find(
      (e) =>
        e.value === entry.value &&
        e.fgColor === entry.fgColor &&
        e.bgColor === entry.bgColor &&
        e.level === entry.level &&
        e.size === entry.size,
    );
    const next: QrHistoryEntry = {
      ...entry,
      id: existing?.id ?? randomId(),
      createdAt: Date.now(),
      favorite: existing?.favorite ?? entry.favorite,
      label: existing?.label ?? entry.label,
      tags: existing?.tags ?? entry.tags,
    };
    const rest = prev.filter((e) => e.id !== next.id);
    return [next, ...rest];
  });
}

export function toggleQrHistoryFavorite(id: string): QrHistoryEntry[] {
  return updateQrHistory((prev) =>
    prev.map((e) =>
      e.id === id ? { ...e, favorite: !e.favorite } : e,
    ),
  );
}

export function updateQrHistoryEntry(
  id: string,
  patch: { label?: string; tags?: string[] },
): QrHistoryEntry[] {
  const nextLabel = patch.label?.trim() ? patch.label.trim() : undefined;
  const nextTags =
    patch.tags?.map((t) => t.trim()).filter(Boolean) ?? undefined;
  return updateQrHistory((prev) =>
    prev.map((e) => {
      if (e.id !== id) return e;
      return {
        ...e,
        label: nextLabel,
        tags: nextTags && nextTags.length > 0 ? nextTags : undefined,
      };
    }),
  );
}

export function duplicateQrHistoryEntry(id: string): QrHistoryEntry[] {
  return updateQrHistory((prev) => {
    const source = prev.find((e) => e.id === id);
    if (!source) return prev;
    const next: QrHistoryEntry = {
      ...source,
      id: randomId(),
      createdAt: Date.now(),
      favorite: false,
    };
    return [next, ...prev];
  });
}
