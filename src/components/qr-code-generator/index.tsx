"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import QRCode from "react-qr-code";
import {
  Share2,
  ClipboardCopy,
  Download,
  History,
  Palette,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useThemeQrColors } from "@/hooks/use-theme-qr-colors";
import {
  loadQrHistory,
  pushQrHistory,
  persistQrHistory,
  type QrErrorLevel,
  type QrHistoryEntry,
} from "@/lib/qr-history";
import { qrSvgToPngBlob } from "@/lib/qr-png";
import { cn } from "@/lib/utils";

interface QrCodeGeneratorProps {
  defaultValue?: string;
}

type QrPreset = "text" | "wifi" | "contact" | "email" | "sms" | "phone";
type WifiAuth = "WPA" | "WEP" | "nopass";

function truncateLabel(value: string, max = 96): string {
  const t = value.trim() || "empty";
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function escapeWifiValue(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll(":", "\\:");
}

function escapeVCardValue(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}

export function QrCodeGenerator({ defaultValue = "https://example.com" }: QrCodeGeneratorProps) {
  const [preset, setPreset] = useState<QrPreset>("text");
  const [textValue, setTextValue] = useState(defaultValue);
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiAuth, setWifiAuth] = useState<WifiAuth>("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactOrg, setContactOrg] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [smsNumber, setSmsNumber] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fgColor, setFgColor] = useState("#171717");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [level, setLevel] = useState<QrErrorLevel>("M");
  const [size, setSize] = useState(200);
  const [history, setHistory] = useState<QrHistoryEntry[]>([]);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const { syncColorsFromTheme, markColorsCustom } = useThemeQrColors(
    setFgColor,
    setBgColor,
  );

  useEffect(() => {
    startTransition(() => {
      setHistory(loadQrHistory());
    });
  }, []);

  const { qrValue, qrError } = useMemo(() => {
    if (preset === "text") {
      const value = textValue.trim() ? textValue : defaultValue;
      return { qrValue: value, qrError: null as string | null };
    }

    if (preset === "wifi") {
      const ssid = wifiSsid.trim();
      if (!ssid) return { qrValue: "", qrError: "Wi‑Fi SSID is required." };
      if (wifiAuth !== "nopass" && !wifiPassword) {
        return { qrValue: "", qrError: "Wi‑Fi password is required for WPA/WEP." };
      }
      const parts = [
        `T:${wifiAuth}`,
        `S:${escapeWifiValue(ssid)}`,
        wifiAuth === "nopass" ? null : `P:${escapeWifiValue(wifiPassword)}`,
        wifiHidden ? "H:true" : null,
      ].filter(Boolean);
      return { qrValue: `WIFI:${parts.join(";")};;`, qrError: null };
    }

    if (preset === "contact") {
      const first = contactFirstName.trim();
      const last = contactLastName.trim();
      const org = contactOrg.trim();
      const phone = contactPhone.trim();
      const email = contactEmail.trim();
      if (!first && !last && !org && !phone && !email) {
        return { qrValue: "", qrError: "Add at least one contact field." };
      }
      const fn = [first, last].filter(Boolean).join(" ").trim();
      const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
      if (first || last) {
        lines.push(
          `N:${escapeVCardValue(last)};${escapeVCardValue(first)};;;`,
        );
      }
      if (fn) lines.push(`FN:${escapeVCardValue(fn)}`);
      if (org) lines.push(`ORG:${escapeVCardValue(org)}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      lines.push("END:VCARD");
      return { qrValue: lines.join("\n"), qrError: null };
    }

    if (preset === "email") {
      const to = emailTo.trim();
      if (!to) return { qrValue: "", qrError: "Email recipient is required." };
      const params = new URLSearchParams();
      if (emailSubject.trim()) params.set("subject", emailSubject);
      if (emailBody.trim()) params.set("body", emailBody);
      const query = params.toString();
      return { qrValue: `mailto:${to}${query ? `?${query}` : ""}`, qrError: null };
    }

    if (preset === "sms") {
      const number = smsNumber.trim();
      if (!number) return { qrValue: "", qrError: "SMS number is required." };
      return { qrValue: `SMSTO:${number}:${smsMessage}`, qrError: null };
    }

    const number = phoneNumber.trim();
    if (!number) return { qrValue: "", qrError: "Phone number is required." };
    return { qrValue: `tel:${number}`, qrError: null };
  }, [
    preset,
    textValue,
    defaultValue,
    wifiSsid,
    wifiPassword,
    wifiAuth,
    wifiHidden,
    contactFirstName,
    contactLastName,
    contactOrg,
    contactPhone,
    contactEmail,
    emailTo,
    emailSubject,
    emailBody,
    smsNumber,
    smsMessage,
    phoneNumber,
  ]);

  const previewLabel = useMemo(
    () =>
      qrError
        ? `Invalid QR content: ${truncateLabel(qrError, 64)}`
        : `QR code encoding: ${truncateLabel(qrValue)}`,
    [qrValue, qrError],
  );

  const getSvg = useCallback((): SVGElement | null => {
    return qrCodeRef.current?.querySelector("svg") ?? null;
  }, []);

  const recordHistory = useCallback(() => {
    pushQrHistory({
      value: qrValue,
      fgColor,
      bgColor,
      level,
      size,
    });
    setHistory(loadQrHistory());
  }, [qrValue, fgColor, bgColor, level, size]);

  const buildPngBlob = useCallback(async () => {
    const svg = getSvg();
    if (!svg) throw new Error("SVG not found");
    return qrSvgToPngBlob(svg, bgColor);
  }, [getSvg, bgColor]);

  const downloadQrCode = useCallback(async () => {
    try {
      const blob = await buildPngBlob();
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      recordHistory();
      toast.success("QR code downloaded", {
        description: "PNG saved to your device.",
      });
    } catch {
      toast.error("Download failed", {
        description: "Could not create the PNG. Try again.",
      });
    }
  }, [buildPngBlob, recordHistory]);

  const copyImage = useCallback(async () => {
    try {
      const blob = await buildPngBlob();
      if (!navigator.clipboard || !window.ClipboardItem) {
        toast.error("Copy not supported", {
          description: "Your browser does not allow copying images.",
        });
        return;
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      recordHistory();
      toast.success("Image copied", {
        description: "Paste it into any app that accepts images.",
      });
    } catch {
      toast.error("Copy failed", {
        description: "Permission may be denied or the image is too large.",
      });
    }
  }, [buildPngBlob, recordHistory]);

  const shareImage = useCallback(async () => {
    try {
      const blob = await buildPngBlob();
      const file = new File([blob], "qrcode.png", { type: "image/png" });
      if (!navigator.share) {
        toast.message("Share unavailable", {
          description: "Use Download or Copy on this device.",
        });
        return;
      }
      const payload = { files: [file], title: "QR code" };
      if (!navigator.canShare?.(payload)) {
        toast.message("Sharing files unsupported", {
          description: "Try Copy or Download instead.",
        });
        return;
      }
      await navigator.share(payload);
      recordHistory();
      toast.success("Shared");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      toast.error("Share failed", {
        description: "Try Download or Copy instead.",
      });
    }
  }, [buildPngBlob, recordHistory]);

  const restoreEntry = useCallback((e: QrHistoryEntry) => {
    setPreset("text");
    setTextValue(e.value);
    setFgColor(e.fgColor);
    setBgColor(e.bgColor);
    setLevel(e.level);
    setSize(e.size);
    markColorsCustom();
    toast.message("Restored from history");
  }, [markColorsCustom]);

  const clearHistory = useCallback(() => {
    persistQrHistory([]);
    setHistory([]);
    toast.message("History cleared");
  }, []);

  const handleFgColorChange = useCallback(
    (next: string) => {
      markColorsCustom();
      setFgColor(next);
    },
    [markColorsCustom],
  );

  const handleBgColorChange = useCallback(
    (next: string) => {
      markColorsCustom();
      setBgColor(next);
    },
    [markColorsCustom],
  );

  const canExport = !qrError;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <h2 className="text-center text-lg leading-none font-semibold tracking-tight">
          Your QR code
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="qr-preset">Content type</Label>
            <select
              id="qr-preset"
              aria-label="Content type"
              value={preset}
              onChange={(ev) => setPreset(ev.target.value as QrPreset)}
              className={cn(
                "border-input bg-background text-foreground h-9 w-full rounded-md border px-2 text-sm shadow-xs",
                "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              )}
            >
              <option value="text">Text / URL</option>
              <option value="wifi">Wi‑Fi</option>
              <option value="contact">Contact (vCard)</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="phone">Phone</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {preset === "text" ? (
            <>
              <Label htmlFor="qr-input">URL or text</Label>
              <Input
                id="qr-input"
                value={textValue}
                onChange={(ev) => setTextValue(ev.target.value)}
                placeholder="Enter URL or text"
                className="w-full"
                autoComplete="off"
                spellCheck={false}
              />
            </>
          ) : null}

          {preset === "wifi" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="wifi-ssid">Network name (SSID)</Label>
                <Input
                  id="wifi-ssid"
                  value={wifiSsid}
                  onChange={(ev) => setWifiSsid(ev.target.value)}
                  placeholder="My Wi‑Fi"
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="wifi-auth">Security</Label>
                <select
                  id="wifi-auth"
                  aria-label="Wi‑Fi security"
                  value={wifiAuth}
                  onChange={(ev) => setWifiAuth(ev.target.value as WifiAuth)}
                  className={cn(
                    "border-input bg-background text-foreground h-9 w-full rounded-md border px-2 text-sm shadow-xs",
                    "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  )}
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="wifi-password">Password</Label>
                <Input
                  id="wifi-password"
                  value={wifiPassword}
                  onChange={(ev) => setWifiPassword(ev.target.value)}
                  placeholder={wifiAuth === "nopass" ? "Not required" : "Password"}
                  type="password"
                  autoComplete="off"
                  disabled={wifiAuth === "nopass"}
                />
              </div>
              <label className="text-foreground flex select-none items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={wifiHidden}
                  onChange={(ev) => setWifiHidden(ev.target.checked)}
                  className="accent-foreground size-4"
                />
                Hidden network
              </label>
            </div>
          ) : null}

          {preset === "contact" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="contact-first">First name</Label>
                <Input
                  id="contact-first"
                  value={contactFirstName}
                  onChange={(ev) => setContactFirstName(ev.target.value)}
                  placeholder="Ada"
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contact-last">Last name</Label>
                <Input
                  id="contact-last"
                  value={contactLastName}
                  onChange={(ev) => setContactLastName(ev.target.value)}
                  placeholder="Lovelace"
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="contact-org">Organization</Label>
                <Input
                  id="contact-org"
                  value={contactOrg}
                  onChange={(ev) => setContactOrg(ev.target.value)}
                  placeholder="Company"
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  value={contactPhone}
                  onChange={(ev) => setContactPhone(ev.target.value)}
                  placeholder="+1 555 123 4567"
                  autoComplete="tel"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  value={contactEmail}
                  onChange={(ev) => setContactEmail(ev.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
          ) : null}

          {preset === "email" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="email-to">To</Label>
                <Input
                  id="email-to"
                  value={emailTo}
                  onChange={(ev) => setEmailTo(ev.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(ev) => setEmailSubject(ev.target.value)}
                  placeholder="Hello"
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="email-body">Body</Label>
                <Input
                  id="email-body"
                  value={emailBody}
                  onChange={(ev) => setEmailBody(ev.target.value)}
                  placeholder="Message"
                  autoComplete="off"
                />
              </div>
            </div>
          ) : null}

          {preset === "sms" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="sms-number">Number</Label>
                <Input
                  id="sms-number"
                  value={smsNumber}
                  onChange={(ev) => setSmsNumber(ev.target.value)}
                  placeholder="+1 555 123 4567"
                  autoComplete="tel"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="sms-message">Message</Label>
                <Input
                  id="sms-message"
                  value={smsMessage}
                  onChange={(ev) => setSmsMessage(ev.target.value)}
                  placeholder="Hello!"
                  autoComplete="off"
                />
              </div>
            </div>
          ) : null}

          {preset === "phone" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone-number">Phone number</Label>
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(ev) => setPhoneNumber(ev.target.value)}
                placeholder="+1 555 123 4567"
                autoComplete="tel"
              />
            </div>
          ) : null}

          {preset !== "text" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="qr-payload">Payload</Label>
              <Input
                id="qr-payload"
                value={qrValue}
                readOnly
                className="font-mono text-xs"
              />
            </div>
          ) : null}

          {qrError ? (
            <p className="text-destructive text-sm">{qrError}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="qr-level">Error correction</Label>
            <select
              id="qr-level"
              aria-label="Error correction"
              value={level}
              onChange={(ev) => setLevel(ev.target.value as QrErrorLevel)}
              className={cn(
                "border-input bg-background text-foreground h-9 w-full rounded-md border px-2 text-sm shadow-xs",
                "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              )}
            >
              <option value="L">Low (~7%)</option>
              <option value="M">Medium (~15%)</option>
              <option value="Q">Quartile (~25%)</option>
              <option value="H">High (~30%)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="qr-size">Size (px)</Label>
            <Input
              id="qr-size"
              type="number"
              min={128}
              max={400}
              step={8}
              value={size}
              onChange={(ev) => {
                const n = Number(ev.target.value);
                if (Number.isFinite(n)) setSize(Math.min(400, Math.max(128, n)));
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Palette className="size-3.5 shrink-0" aria-hidden />
            Colors
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={syncColorsFromTheme}
          >
            Sync with theme
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fg-color">Foreground</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fg-color"
                type="color"
                value={fgColor}
                onChange={(e) => handleFgColorChange(e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer p-1"
                aria-label="Pick foreground color"
              />
              <Input
                value={fgColor}
                onChange={(e) => handleFgColorChange(e.target.value)}
                maxLength={7}
                className="min-w-0 flex-1"
                aria-label="Foreground hex color"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bg-color">Background</Label>
            <div className="flex items-center gap-2">
              <Input
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={(e) => handleBgColorChange(e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer p-1"
                aria-label="Pick background color"
              />
              <Input
                value={bgColor}
                onChange={(e) => handleBgColorChange(e.target.value)}
                maxLength={7}
                className="min-w-0 flex-1"
                aria-label="Background hex color"
              />
            </div>
          </div>
        </div>

        <div
          ref={qrCodeRef}
          className="flex items-center justify-center rounded-md border border-border p-4"
          style={{ backgroundColor: bgColor }}
        >
          <div
            role="img"
            aria-label={previewLabel}
            className="inline-flex max-w-full overflow-auto"
          >
            <QRCode
              value={qrValue || " "}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
              level={level}
            />
          </div>
        </div>

        {history.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <History className="size-3.5 shrink-0" aria-hidden />
                Recent
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={clearHistory}
              >
                Clear
              </Button>
            </div>
            <ul
              className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-muted/30 p-1 text-sm"
              aria-label="Recent QR payloads"
            >
              {history.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className="hover:bg-accent focus-visible:ring-ring/50 w-full rounded px-2 py-1.5 text-left focus-visible:ring-[3px] focus-visible:outline-none"
                    onClick={() => restoreEntry(entry)}
                  >
                    <span className="text-foreground line-clamp-2 block font-medium">
                      {truncateLabel(entry.value, 64)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {entry.level} · {entry.size}px
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="default"
            onClick={() => {
              if (!canExport) {
                toast.error("Invalid content", {
                  description: qrError ?? "Fix the fields and try again.",
                });
                return;
              }
              void downloadQrCode();
            }}
            disabled={!canExport}
          >
            <Download className="size-4" aria-hidden />
            Download
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!canExport) {
                toast.error("Invalid content", {
                  description: qrError ?? "Fix the fields and try again.",
                });
                return;
              }
              void copyImage();
            }}
            disabled={!canExport}
          >
            <ClipboardCopy className="size-4" aria-hidden />
            Copy image
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!canExport) {
                toast.error("Invalid content", {
                  description: qrError ?? "Fix the fields and try again.",
                });
                return;
              }
              void shareImage();
            }}
            disabled={!canExport}
          >
            <Share2 className="size-4" aria-hidden />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
