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
import jsQR from "jsqr";
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
  toggleQrHistoryFavorite,
  updateQrHistoryEntry,
  duplicateQrHistoryEntry,
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
type DownloadFormat = "png" | "svg" | "pdf";

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
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("png");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.22);
  const [safeMode, setSafeMode] = useState(true);
  const [decodedText, setDecodedText] = useState("");
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [decodeBusy, setDecodeBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [editingTags, setEditingTags] = useState("");
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

  const effectiveLevel: QrErrorLevel = logoDataUrl && safeMode ? "H" : level;

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

  const suggestedLabel = useMemo(() => {
    if (preset === "wifi") {
      const ssid = wifiSsid.trim();
      return ssid ? `Wi‑Fi: ${ssid}` : "";
    }
    if (preset === "contact") {
      const name = [contactFirstName.trim(), contactLastName.trim()]
        .filter(Boolean)
        .join(" ");
      if (name) return name;
      const org = contactOrg.trim();
      return org ? `Contact: ${org}` : "";
    }
    if (preset === "email") {
      const to = emailTo.trim();
      return to ? `Email: ${to}` : "";
    }
    if (preset === "sms") {
      const number = smsNumber.trim();
      return number ? `SMS: ${number}` : "";
    }
    if (preset === "phone") {
      const number = phoneNumber.trim();
      return number ? `Phone: ${number}` : "";
    }
    const value = (textValue.trim() ? textValue : defaultValue).trim();
    if (!value) return "";
    try {
      const url = new URL(value);
      return url.hostname;
    } catch {
      return "";
    }
  }, [
    preset,
    wifiSsid,
    contactFirstName,
    contactLastName,
    contactOrg,
    emailTo,
    smsNumber,
    phoneNumber,
    textValue,
    defaultValue,
  ]);

  const getSvg = useCallback((): SVGElement | null => {
    return qrCodeRef.current?.querySelector("svg") ?? null;
  }, []);

  const recordHistory = useCallback(() => {
    pushQrHistory({
      value: qrValue,
      fgColor,
      bgColor,
      level: effectiveLevel,
      size,
      label: suggestedLabel || undefined,
    });
    setHistory(loadQrHistory());
  }, [qrValue, fgColor, bgColor, effectiveLevel, size, suggestedLabel]);

  const buildSvgBlob = useCallback((): Blob => {
    const svg = getSvg();
    if (!svg) throw new Error("SVG not found");
    const next = svg.cloneNode(true) as SVGElement;
    next.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    next.setAttribute("width", String(size));
    next.setAttribute("height", String(size));

    if (logoDataUrl) {
      const overlaySize = Math.max(1, Math.round(size * logoScale));
      const x = Math.round((size - overlaySize) / 2);
      const y = Math.round((size - overlaySize) / 2);

      const padding = safeMode ? Math.max(0, Math.round(size * 0.06)) : 0;
      if (padding > 0) {
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        rect.setAttribute("x", String(x - padding));
        rect.setAttribute("y", String(y - padding));
        rect.setAttribute("width", String(overlaySize + padding * 2));
        rect.setAttribute("height", String(overlaySize + padding * 2));
        rect.setAttribute("fill", bgColor);
        rect.setAttribute("rx", String(Math.round(size * 0.06)));
        rect.setAttribute("ry", String(Math.round(size * 0.06)));
        next.appendChild(rect);
      }

      const img = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image",
      );
      img.setAttribute("x", String(x));
      img.setAttribute("y", String(y));
      img.setAttribute("width", String(overlaySize));
      img.setAttribute("height", String(overlaySize));
      img.setAttribute("href", logoDataUrl);
      img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", logoDataUrl);
      img.setAttribute("preserveAspectRatio", "xMidYMid meet");
      next.appendChild(img);
    }

    const svgData = new XMLSerializer().serializeToString(next);
    return new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  }, [getSvg, size, logoDataUrl, logoScale, safeMode, bgColor]);

  const buildPngBlob = useCallback(async () => {
    const svg = getSvg();
    if (!svg) throw new Error("SVG not found");
    const overlay =
      logoDataUrl
        ? {
            dataUrl: logoDataUrl,
            sizePx: Math.max(1, Math.round(size * logoScale)),
            paddingPx: safeMode ? Math.max(0, Math.round(size * 0.06)) : 0,
            backgroundColor: bgColor,
            borderRadiusPx: Math.max(0, Math.round(size * 0.06)),
          }
        : undefined;
    return qrSvgToPngBlob(svg, bgColor, overlay);
  }, [getSvg, bgColor, logoDataUrl, logoScale, safeMode, size]);

  const downloadPng = useCallback(async () => {
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
      toast.success("Downloaded", {
        description: "PNG saved to your device.",
      });
    } catch {
      toast.error("Download failed", {
        description: "Could not create the PNG. Try again.",
      });
    }
  }, [buildPngBlob, recordHistory]);

  const downloadSvg = useCallback(async () => {
    try {
      const blob = buildSvgBlob();
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `qrcode-${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      recordHistory();
      toast.success("Downloaded", {
        description: "SVG saved to your device.",
      });
    } catch {
      toast.error("Download failed", {
        description: "Could not create the SVG. Try again.",
      });
    }
  }, [buildSvgBlob, recordHistory]);

  const downloadPdf = useCallback(async () => {
    try {
      const [{ PDFDocument }] = await Promise.all([import("pdf-lib")]);
      const png = await buildPngBlob();
      const bytes = await png.arrayBuffer();
      const pdf = await PDFDocument.create();
      const img = await pdf.embedPng(bytes);
      const pageSize = size;
      const page = pdf.addPage([pageSize, pageSize]);
      page.drawImage(img, { x: 0, y: 0, width: pageSize, height: pageSize });
      const pdfBytes = await pdf.save();
      const safeBytes = new Uint8Array(pdfBytes);
      const blob = new Blob([safeBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `qrcode-${Date.now()}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      recordHistory();
      toast.success("Downloaded", {
        description: "PDF saved to your device.",
      });
    } catch {
      toast.error("Download failed", {
        description: "Could not create the PDF. Try again.",
      });
    }
  }, [buildPngBlob, recordHistory, size]);

  const downloadSelected = useCallback(async () => {
    if (downloadFormat === "png") {
      await downloadPng();
      return;
    }
    if (downloadFormat === "svg") {
      await downloadSvg();
      return;
    }
    await downloadPdf();
  }, [downloadFormat, downloadPng, downloadSvg, downloadPdf]);

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
    setEditingId(null);
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

  const handleLogoFile = useCallback((file: File | null) => {
    if (!file) {
      setLogoDataUrl(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Unsupported file", { description: "Choose an image file." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setLogoDataUrl(result);
      }
    };
    reader.onerror = () => {
      toast.error("Could not read image");
    };
    reader.readAsDataURL(file);
  }, []);

  const decodeImageFile = useCallback(async (file: File) => {
    setDecodeBusy(true);
    setDecodeError(null);
    setDecodedText("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("read"));
        };
        reader.onerror = () => reject(new Error("read"));
        reader.readAsDataURL(file);
      });

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("image"));
        i.src = dataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("canvas");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);
      if (!result?.data) {
        setDecodeError("No QR code found in this image.");
        return;
      }
      setDecodedText(result.data);
      toast.success("Decoded");
    } catch {
      setDecodeError("Could not decode this image.");
    } finally {
      setDecodeBusy(false);
    }
  }, []);

  const copyDecodedText = useCallback(async () => {
    if (!decodedText) return;
    try {
      await navigator.clipboard.writeText(decodedText);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  }, [decodedText]);

  const useDecodedText = useCallback(() => {
    if (!decodedText) return;
    setPreset("text");
    setTextValue(decodedText);
    toast.message("Applied decoded text");
  }, [decodedText]);

  const toggleFavorite = useCallback((id: string) => {
    const next = toggleQrHistoryFavorite(id);
    setHistory(next);
  }, []);

  const duplicateEntry = useCallback((id: string) => {
    const next = duplicateQrHistoryEntry(id);
    setHistory(next);
    toast.message("Duplicated");
  }, []);

  const beginEditEntry = useCallback((entry: QrHistoryEntry) => {
    setEditingId(entry.id);
    setEditingLabel(entry.label ?? "");
    setEditingTags(entry.tags?.join(", ") ?? "");
  }, []);

  const saveEditEntry = useCallback(() => {
    if (!editingId) return;
    const tags = editingTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const next = updateQrHistoryEntry(editingId, {
      label: editingLabel,
      tags,
    });
    setHistory(next);
    setEditingId(null);
    toast.success("Saved");
  }, [editingId, editingLabel, editingTags]);

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
              value={effectiveLevel}
              onChange={(ev) => setLevel(ev.target.value as QrErrorLevel)}
              disabled={!!logoDataUrl && safeMode}
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
            {logoDataUrl && safeMode ? (
              <p className="text-muted-foreground text-xs">
                Locked to High while Safe mode is enabled.
              </p>
            ) : null}
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

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs font-medium">Logo</span>
            {logoDataUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setLogoDataUrl(null)}
              >
                Remove
              </Button>
            ) : null}
          </div>
          <Label htmlFor="logo-file" className="text-xs">
            Logo image
          </Label>
          <Input
            id="logo-file"
            type="file"
            accept="image/*"
            onChange={(ev) => handleLogoFile(ev.target.files?.[0] ?? null)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="logo-scale">Logo size (%)</Label>
              <Input
                id="logo-scale"
                type="number"
                min={10}
                max={35}
                step={1}
                value={Math.round(logoScale * 100)}
                onChange={(ev) => {
                  const n = Number(ev.target.value);
                  if (!Number.isFinite(n)) return;
                  setLogoScale(Math.min(0.35, Math.max(0.1, n / 100)));
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="safe-mode">Safe mode</Label>
              <label className="text-foreground flex select-none items-center gap-2 text-sm">
                <input
                  id="safe-mode"
                  type="checkbox"
                  checked={safeMode}
                  onChange={(ev) => setSafeMode(ev.target.checked)}
                  className="accent-foreground size-4"
                />
                Force high error correction
              </label>
            </div>
          </div>
          {logoDataUrl && safeMode ? (
            <p className="text-muted-foreground text-xs">
              Safe mode forces error correction to High and increases padding for better scan reliability.
            </p>
          ) : null}
        </div>

        <div
          ref={qrCodeRef}
          className="flex items-center justify-center rounded-md border border-border"
          style={{
            backgroundColor: bgColor,
            padding:
              logoDataUrl && safeMode ? Math.max(16, Math.round(size * 0.12)) : 16,
          }}
        >
          <div
            role="img"
            aria-label={previewLabel}
            className="relative inline-flex max-w-full overflow-auto"
          >
            <QRCode
              value={qrValue || " "}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
              level={effectiveLevel}
            />
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt=""
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
                style={{
                  width: Math.max(1, Math.round(size * logoScale)),
                  height: Math.max(1, Math.round(size * logoScale)),
                }}
              />
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs font-medium">Decode</span>
            {decodedText ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={copyDecodedText}
                >
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={useDecodedText}
                >
                  Use
                </Button>
              </div>
            ) : null}
          </div>
          <Label htmlFor="decode-file" className="text-xs">
            Decode an image
          </Label>
          <Input
            id="decode-file"
            type="file"
            accept="image/*"
            disabled={decodeBusy}
            onChange={(ev) => {
              const file = ev.target.files?.[0];
              if (!file) return;
              void decodeImageFile(file);
              ev.target.value = "";
            }}
          />
          {decodeError ? (
            <p className="text-destructive text-sm">{decodeError}</p>
          ) : null}
          {decodedText ? (
            <Input value={decodedText} readOnly className="font-mono text-xs" />
          ) : null}
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
                <li key={entry.id} className="space-y-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="hover:bg-accent focus-visible:ring-ring/50 w-full rounded px-2 py-1.5 text-left focus-visible:ring-[3px] focus-visible:outline-none"
                      onClick={() => restoreEntry(entry)}
                    >
                      <span className="text-foreground line-clamp-2 block font-medium">
                        {truncateLabel(entry.label ?? entry.value, 64)}
                      </span>
                      {entry.tags?.length ? (
                        <span className="text-muted-foreground line-clamp-1 block text-xs">
                          {entry.tags.join(", ")}
                        </span>
                      ) : null}
                      <span className="text-muted-foreground text-xs">
                        {entry.favorite ? "★ · " : ""}
                        {entry.level} · {entry.size}px
                      </span>
                    </button>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Toggle favorite"
                        onClick={() => toggleFavorite(entry.id)}
                      >
                        {entry.favorite ? "★" : "☆"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Duplicate"
                        onClick={() => duplicateEntry(entry.id)}
                      >
                        Dup
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Edit"
                        onClick={() => beginEditEntry(entry)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                  {editingId === entry.id ? (
                    <div className="grid gap-2 rounded-md border border-border bg-background p-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`label-${entry.id}`}>Name</Label>
                          <Input
                            id={`label-${entry.id}`}
                            value={editingLabel}
                            onChange={(ev) => setEditingLabel(ev.target.value)}
                            placeholder="Optional"
                            autoComplete="off"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`tags-${entry.id}`}>Tags</Label>
                          <Input
                            id={`tags-${entry.id}`}
                            value={editingTags}
                            onChange={(ev) => setEditingTags(ev.target.value)}
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
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={saveEditEntry}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Label htmlFor="download-format" className="text-xs">
            Download format
          </Label>
          <select
            id="download-format"
            aria-label="Download format"
            value={downloadFormat}
            onChange={(ev) => setDownloadFormat(ev.target.value as DownloadFormat)}
            className={cn(
              "border-input bg-background text-foreground h-8 rounded-md border px-2 text-xs shadow-xs",
              "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            )}
          >
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
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
              void downloadSelected();
            }}
            disabled={!canExport}
          >
            <Download className="size-4" aria-hidden />
            Download {downloadFormat.toUpperCase()}
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
