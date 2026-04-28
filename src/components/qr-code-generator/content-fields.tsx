"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QrPreset, WifiAuth } from "@/components/qr-code-generator/types";
import { selectClassName } from "@/components/qr-code-generator/utils";

interface ContentFieldsProps {
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
  qrValue: string;
  qrError: string | null;
  onPresetChange: (value: QrPreset) => void;
  onTextValueChange: (value: string) => void;
  onWifiSsidChange: (value: string) => void;
  onWifiPasswordChange: (value: string) => void;
  onWifiAuthChange: (value: WifiAuth) => void;
  onWifiHiddenChange: (value: boolean) => void;
  onContactFirstNameChange: (value: string) => void;
  onContactLastNameChange: (value: string) => void;
  onContactOrgChange: (value: string) => void;
  onContactPhoneChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
  onEmailToChange: (value: string) => void;
  onEmailSubjectChange: (value: string) => void;
  onEmailBodyChange: (value: string) => void;
  onSmsNumberChange: (value: string) => void;
  onSmsMessageChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
}

export function ContentFields({
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
  qrValue,
  qrError,
  onPresetChange,
  onTextValueChange,
  onWifiSsidChange,
  onWifiPasswordChange,
  onWifiAuthChange,
  onWifiHiddenChange,
  onContactFirstNameChange,
  onContactLastNameChange,
  onContactOrgChange,
  onContactPhoneChange,
  onContactEmailChange,
  onEmailToChange,
  onEmailSubjectChange,
  onEmailBodyChange,
  onSmsNumberChange,
  onSmsMessageChange,
  onPhoneNumberChange,
}: ContentFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.35rem] border border-border/70 bg-card/85 p-5 shadow-[0_18px_45px_-34px_rgba(37,99,235,0.25)]">
        <div className="flex max-w-xs flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Type
          </p>
          <Label htmlFor="qr-preset">Content type</Label>
          <select
            id="qr-preset"
            aria-label="Content type"
            value={preset}
            onChange={(event) => onPresetChange(event.target.value as QrPreset)}
            className={selectClassName}
          >
            <option value="text">Text / URL</option>
            <option value="wifi">Wi-Fi</option>
            <option value="contact">Contact (vCard)</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="phone">Phone</option>
          </select>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-border/70 bg-card/85 p-5 shadow-[0_18px_45px_-34px_rgba(37,99,235,0.18)]">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Details
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Define the value that will be encoded in the QR code.
          </p>
        </div>

        <div className="space-y-4">
        {preset === "text" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="qr-input">URL or text</Label>
            <Input
              id="qr-input"
              value={textValue}
              onChange={(event) => onTextValueChange(event.target.value)}
              placeholder="Enter URL or text"
              className="w-full"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        ) : null}

        {preset === "wifi" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="wifi-ssid">Network name (SSID)</Label>
              <Input
                id="wifi-ssid"
                value={wifiSsid}
                onChange={(event) => onWifiSsidChange(event.target.value)}
                placeholder="My Wi-Fi"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="wifi-auth">Security</Label>
              <select
                id="wifi-auth"
                aria-label="Wi-Fi security"
                value={wifiAuth}
                onChange={(event) => onWifiAuthChange(event.target.value as WifiAuth)}
                className={selectClassName}
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
                onChange={(event) => onWifiPasswordChange(event.target.value)}
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
                onChange={(event) => onWifiHiddenChange(event.target.checked)}
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
                onChange={(event) => onContactFirstNameChange(event.target.value)}
                placeholder="Ada"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-last">Last name</Label>
              <Input
                id="contact-last"
                value={contactLastName}
                onChange={(event) => onContactLastNameChange(event.target.value)}
                placeholder="Lovelace"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="contact-org">Organization</Label>
              <Input
                id="contact-org"
                value={contactOrg}
                onChange={(event) => onContactOrgChange(event.target.value)}
                placeholder="Company"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                value={contactPhone}
                onChange={(event) => onContactPhoneChange(event.target.value)}
                placeholder="+1 555 123 4567"
                autoComplete="tel"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                value={contactEmail}
                onChange={(event) => onContactEmailChange(event.target.value)}
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
                onChange={(event) => onEmailToChange(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(event) => onEmailSubjectChange(event.target.value)}
                placeholder="Hello"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="email-body">Body</Label>
              <Input
                id="email-body"
                value={emailBody}
                onChange={(event) => onEmailBodyChange(event.target.value)}
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
                onChange={(event) => onSmsNumberChange(event.target.value)}
                placeholder="+1 555 123 4567"
                autoComplete="tel"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="sms-message">Message</Label>
              <Input
                id="sms-message"
                value={smsMessage}
                onChange={(event) => onSmsMessageChange(event.target.value)}
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
              onChange={(event) => onPhoneNumberChange(event.target.value)}
              placeholder="+1 555 123 4567"
              autoComplete="tel"
            />
          </div>
        ) : null}

        {preset !== "text" ? (
          <div className="mt-5 flex flex-col gap-2 rounded-xl bg-background/60 p-4 ring-1 ring-border/60">
            <Label htmlFor="qr-payload">Payload</Label>
            <Input
              id="qr-payload"
              value={qrValue}
              readOnly
              className="font-mono text-xs"
            />
          </div>
        ) : null}

        {qrError ? <p className="text-destructive text-sm">{qrError}</p> : null}
        </div>
      </div>
    </div>
  );
}
