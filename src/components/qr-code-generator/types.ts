"use client";

import type { QrErrorLevel, QrHistoryEntry } from "@/lib/qr-history";

export type QrPreset = "text" | "wifi" | "contact" | "email" | "sms" | "phone";
export type WifiAuth = "WPA" | "WEP" | "nopass";
export type DownloadFormat = "png" | "svg" | "pdf";

export interface QrContentState {
  preset: QrPreset;
  textValue: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiAuth: WifiAuth;
  wifiHidden: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactOrg: string;
  contactPhone: string;
  contactEmail: string;
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  smsNumber: string;
  smsMessage: string;
  phoneNumber: string;
}

export interface QrStyleState {
  fgColor: string;
  bgColor: string;
  level: QrErrorLevel;
  effectiveLevel: QrErrorLevel;
  size: number;
  logoDataUrl: string | null;
  logoScale: number;
  safeMode: boolean;
  downloadFormat: DownloadFormat;
}

export interface QrDecodeState {
  decodedText: string;
  decodeError: string | null;
  decodeBusy: boolean;
}

export interface QrHistoryEditState {
  history: QrHistoryEntry[];
  editingId: string | null;
  editingLabel: string;
  editingTags: string;
}
