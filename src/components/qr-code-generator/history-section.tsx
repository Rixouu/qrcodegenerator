"use client";

import { Copy, History, PencilLine, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QrHistoryEntry } from "@/lib/qr-history";
import { truncateLabel } from "@/components/qr-code-generator/utils";

interface HistorySectionProps {
  history: QrHistoryEntry[];
  editingId: string | null;
  editingLabel: string;
  editingTags: string;
  onRestore: (entry: QrHistoryEntry) => void;
  onClear: () => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBeginEdit: (entry: QrHistoryEntry) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditingLabelChange: (value: string) => void;
  onEditingTagsChange: (value: string) => void;
}

export function HistorySection({
  history,
  editingId,
  editingLabel,
  editingTags,
  onRestore,
  onClear,
  onToggleFavorite,
  onDuplicate,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
  onEditingLabelChange,
  onEditingTagsChange,
}: HistorySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <History className="size-3.5" aria-hidden />
          {history.length} saved item{history.length === 1 ? "" : "s"}
        </span>
        {history.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear history"
            className="h-8 w-8 rounded-full"
            onClick={onClear}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-background/55 p-4 text-sm text-muted-foreground">
          Generated codes will appear here after you download, copy, or share them.
        </div>
      ) : (
        <ul
          className="max-h-72 space-y-2 overflow-y-auto"
          aria-label="Recent QR payloads"
        >
          {history.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-border/70 bg-background/55 p-3"
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="hover:bg-accent/60 focus-visible:ring-ring/50 w-full min-w-0 rounded-lg px-2 py-1.5 text-left focus-visible:ring-[3px] focus-visible:outline-none"
                  onClick={() => onRestore(entry)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground line-clamp-1 block font-medium">
                      {truncateLabel(entry.label ?? entry.value, 64)}
                    </span>
                    {entry.tags?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                        {entry.tags.length > 2 ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            +{entry.tags.length - 2}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {entry.favorite ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3 fill-current" aria-hidden />
                        Favorite
                      </span>
                    ) : null}
                    <span>
                      {entry.level} • {entry.size}px
                    </span>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-1 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle favorite"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onToggleFavorite(entry.id)}
                  >
                    <Star
                      className="size-4"
                      fill={entry.favorite ? "currentColor" : "none"}
                      aria-hidden
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Duplicate"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onDuplicate(entry.id)}
                  >
                    <Copy className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onBeginEdit(entry)}
                  >
                    <PencilLine className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>

              {editingId === entry.id ? (
                <div className="mt-3 grid gap-2 border-t border-border/70 pt-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`label-${entry.id}`}>Name</Label>
                      <Input
                        id={`label-${entry.id}`}
                        value={editingLabel}
                        onChange={(event) => onEditingLabelChange(event.target.value)}
                        placeholder="Optional"
                        autoComplete="off"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`tags-${entry.id}`}>Tags</Label>
                      <Input
                        id={`tags-${entry.id}`}
                        value={editingTags}
                        onChange={(event) => onEditingTagsChange(event.target.value)}
                        placeholder="tag1, tag2"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={onSaveEdit}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
