"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import jsQR from "jsqr";
import { toast } from "sonner";
import { useThemeQrColors } from "@/hooks/use-theme-qr-colors";
import {
  duplicateQrHistoryEntry,
  loadQrHistory,
  persistQrHistory,
  pushQrHistory,
  toggleQrHistoryFavorite,
  updateQrHistoryEntry,
  type QrErrorLevel,
  type QrHistoryEntry,
} from "@/lib/qr-history";
import { qrSvgToPngBlob } from "@/lib/qr-png";
import type {
  DownloadFormat,
  QrContentState,
  QrDecodeState,
  QrHistoryEditState,
  QrPreset,
  QrStyleState,
  WifiAuth,
} from "@/components/qr-code-generator/types";
import {
  escapeVCardValue,
  escapeWifiValue,
  truncateLabel,
} from "@/components/qr-code-generator/utils";

interface UseQrCodeGeneratorOptions {
  defaultValue: string;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

export function useQrCodeGenerator({ defaultValue }: UseQrCodeGeneratorOptions) {
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

  const contentState: QrContentState = {
    preset,
    textValue,
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
  };

  const styleState: QrStyleState = {
    fgColor,
    bgColor,
    level,
    effectiveLevel,
    size,
    logoDataUrl,
    logoScale,
    safeMode,
    downloadFormat,
  };

  const decodeState: QrDecodeState = {
    decodedText,
    decodeError,
    decodeBusy,
  };

  const historyEditState: QrHistoryEditState = {
    history,
    editingId,
    editingLabel,
    editingTags,
  };

  const { qrValue, qrError } = useMemo(() => {
    if (preset === "text") {
      const value = textValue.trim() ? textValue : defaultValue;
      return { qrValue: value, qrError: null as string | null };
    }

    if (preset === "wifi") {
      const ssid = wifiSsid.trim();
      if (!ssid) return { qrValue: "", qrError: "Wi-Fi SSID is required." };
      if (wifiAuth !== "nopass" && !wifiPassword) {
        return { qrValue: "", qrError: "Wi-Fi password is required for WPA/WEP." };
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
        lines.push(`N:${escapeVCardValue(last)};${escapeVCardValue(first)};;;`);
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
    [qrError, qrValue],
  );

  const suggestedLabel = useMemo(() => {
    if (preset === "wifi") {
      const ssid = wifiSsid.trim();
      return ssid ? `Wi-Fi: ${ssid}` : "";
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
  }, [bgColor, effectiveLevel, fgColor, qrValue, size, suggestedLabel]);

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
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", String(x - padding));
        rect.setAttribute("y", String(y - padding));
        rect.setAttribute("width", String(overlaySize + padding * 2));
        rect.setAttribute("height", String(overlaySize + padding * 2));
        rect.setAttribute("fill", bgColor);
        rect.setAttribute("rx", String(Math.round(size * 0.06)));
        rect.setAttribute("ry", String(Math.round(size * 0.06)));
        next.appendChild(rect);
      }

      const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
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
  }, [bgColor, getSvg, logoDataUrl, logoScale, safeMode, size]);

  const buildPngBlob = useCallback(async () => {
    const svg = getSvg();
    if (!svg) throw new Error("SVG not found");

    const overlay = logoDataUrl
      ? {
          dataUrl: logoDataUrl,
          sizePx: Math.max(1, Math.round(size * logoScale)),
          paddingPx: safeMode ? Math.max(0, Math.round(size * 0.06)) : 0,
          backgroundColor: bgColor,
          borderRadiusPx: Math.max(0, Math.round(size * 0.06)),
        }
      : undefined;

    return qrSvgToPngBlob(svg, bgColor, overlay);
  }, [bgColor, getSvg, logoDataUrl, logoScale, safeMode, size]);

  const downloadPng = useCallback(async () => {
    try {
      const blob = await buildPngBlob();
      downloadBlob(blob, `qrcode-${Date.now()}.png`);
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
      downloadBlob(blob, `qrcode-${Date.now()}.svg`);
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
      const { PDFDocument } = await import("pdf-lib");
      const png = await buildPngBlob();
      const bytes = await png.arrayBuffer();
      const pdf = await PDFDocument.create();
      const img = await pdf.embedPng(bytes);
      const page = pdf.addPage([size, size]);
      page.drawImage(img, { x: 0, y: 0, width: size, height: size });
      const pdfBytes = await pdf.save();
      const safeBytes = new Uint8Array(pdfBytes);
      downloadBlob(new Blob([safeBytes], { type: "application/pdf" }), `qrcode-${Date.now()}.pdf`);
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
  }, [downloadFormat, downloadPdf, downloadPng, downloadSvg]);

  const copyImage = useCallback(async () => {
    try {
      const blob = await buildPngBlob();
      if (!navigator.clipboard || !window.ClipboardItem) {
        toast.error("Copy not supported", {
          description: "Your browser does not allow copying images.",
        });
        return;
      }
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
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
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      toast.error("Share failed", {
        description: "Try Download or Copy instead.",
      });
    }
  }, [buildPngBlob, recordHistory]);

  const restoreEntry = useCallback((entry: QrHistoryEntry) => {
    setPreset("text");
    setTextValue(entry.value);
    setFgColor(entry.fgColor);
    setBgColor(entry.bgColor);
    setLevel(entry.level);
    setSize(entry.size);
    markColorsCustom();
    toast.message("Restored from history");
  }, [markColorsCustom]);

  const clearHistory = useCallback(() => {
    persistQrHistory([]);
    setHistory([]);
    setEditingId(null);
    toast.message("History cleared");
  }, []);

  const handleFgColorChange = useCallback((next: string) => {
    markColorsCustom();
    setFgColor(next);
  }, [markColorsCustom]);

  const handleBgColorChange = useCallback((next: string) => {
    markColorsCustom();
    setBgColor(next);
  }, [markColorsCustom]);

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
      if (typeof reader.result === "string") {
        setLogoDataUrl(reader.result);
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
        const next = new Image();
        next.onload = () => resolve(next);
        next.onerror = () => reject(new Error("image"));
        next.src = dataUrl;
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
    setHistory(toggleQrHistoryFavorite(id));
  }, []);

  const duplicateEntry = useCallback((id: string) => {
    setHistory(duplicateQrHistoryEntry(id));
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
      .map((tag) => tag.trim())
      .filter(Boolean);

    setHistory(updateQrHistoryEntry(editingId, { label: editingLabel, tags }));
    setEditingId(null);
    toast.success("Saved");
  }, [editingId, editingLabel, editingTags]);

  const canExport = !qrError;

  return {
    qrCodeRef,
    contentState,
    styleState,
    decodeState,
    historyEditState,
    qrValue,
    qrError,
    previewLabel,
    canExport,
    syncColorsFromTheme,
    setPreset,
    setTextValue,
    setWifiSsid,
    setWifiPassword,
    setWifiAuth,
    setWifiHidden,
    setContactFirstName,
    setContactLastName,
    setContactOrg,
    setContactPhone,
    setContactEmail,
    setEmailTo,
    setEmailSubject,
    setEmailBody,
    setSmsNumber,
    setSmsMessage,
    setPhoneNumber,
    setLevel,
    setSize,
    setLogoDataUrl,
    setLogoScale,
    setSafeMode,
    setDownloadFormat,
    setEditingId,
    setEditingLabel,
    setEditingTags,
    handleFgColorChange,
    handleBgColorChange,
    handleLogoFile,
    decodeImageFile,
    copyDecodedText,
    useDecodedText,
    restoreEntry,
    clearHistory,
    toggleFavorite,
    duplicateEntry,
    beginEditEntry,
    saveEditEntry,
    downloadSelected,
    copyImage,
    shareImage,
  };
}
