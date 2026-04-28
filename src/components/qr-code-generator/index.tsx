"use client";

import { History, ScanLine, SlidersHorizontal, Type } from "lucide-react";
import { toast } from "sonner";
import { ActionsFooter } from "@/components/qr-code-generator/actions-footer";
import { ContentFields } from "@/components/qr-code-generator/content-fields";
import { CustomizationSection } from "@/components/qr-code-generator/customization-section";
import { DecodeSection } from "@/components/qr-code-generator/decode-section";
import { HistorySection } from "@/components/qr-code-generator/history-section";
import { QrPreview } from "@/components/qr-code-generator/qr-preview";
import { useQrCodeGenerator } from "@/components/qr-code-generator/use-qr-code-generator";

interface QrCodeGeneratorProps {
  defaultValue?: string;
}

export function QrCodeGenerator({
  defaultValue = "https://example.com",
}: QrCodeGeneratorProps) {
  const qr = useQrCodeGenerator({ defaultValue });
  const presetLabel =
    {
      text: "Text/URL",
      wifi: "Wi-Fi",
      contact: "Contact",
      email: "Email",
      sms: "SMS",
      phone: "Phone",
    }[qr.contentState.preset] ?? "Text/URL";
  const mobileNavItems = [
    { href: "#content-section", label: "Content", icon: Type },
    { href: "#style-section", label: "Style", icon: SlidersHorizontal },
    { href: "#decode-section", label: "Scan", icon: ScanLine },
    { href: "#history-section", label: "History", icon: History },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px]">
            <aside className="order-1 lg:order-2 lg:sticky lg:top-6 lg:self-start">
              <div className="space-y-5">
                <section className="rounded-[1.6rem] bg-linear-to-br from-primary/22 via-card to-card p-[1px] shadow-[0_18px_50px_-28px_rgba(37,99,235,0.45)]">
                  <div className="rounded-[calc(1.6rem-1px)] border border-white/8 bg-card p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        Preview
                      </p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                        Live preview
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Review the code before you download or share it.
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/12 px-3 py-1 text-[11px] font-medium text-primary">
                      {qr.qrError ? "Needs input" : "Ready"}
                    </span>
                  </div>

                  <div className="rounded-[1.25rem] bg-muted/85 p-4">
                    <QrPreview
                      qrCodeRef={qr.qrCodeRef}
                      qrValue={qr.qrValue}
                      previewLabel={qr.previewLabel}
                      bgColor={qr.styleState.bgColor}
                      fgColor={qr.styleState.fgColor}
                      size={qr.styleState.size}
                      effectiveLevel={qr.styleState.effectiveLevel}
                      logoDataUrl={qr.styleState.logoDataUrl}
                      logoScale={qr.styleState.logoScale}
                      safeMode={qr.styleState.safeMode}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-background/72 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Type</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{presetLabel}</p>
                    </div>
                    <div className="rounded-xl bg-background/72 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Size</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{qr.styleState.size}px</p>
                    </div>
                    <div className="rounded-xl bg-background/72 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Format</p>
                      <p className="mt-1 text-sm font-medium uppercase text-foreground">
                        {qr.styleState.downloadFormat}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <ActionsFooter
                      downloadFormat={qr.styleState.downloadFormat}
                      canExport={qr.canExport}
                      qrError={qr.qrError}
                      onDownloadFormatChange={qr.setDownloadFormat}
                      onDownload={qr.downloadSelected}
                      onCopyImage={qr.copyImage}
                      onShareImage={qr.shareImage}
                      onInvalidExport={(message) => {
                        toast.error("Invalid content", {
                          description: message,
                        });
                      }}
                    />
                  </div>
                  </div>
                </section>

                <section className="hidden rounded-[1.35rem] border border-border/70 bg-card/90 p-4 lg:block">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        Saved
                      </p>
                      <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">History</h2>
                    </div>
                  </div>
                  <HistorySection
                    history={qr.historyEditState.history}
                    editingId={qr.historyEditState.editingId}
                    editingLabel={qr.historyEditState.editingLabel}
                    editingTags={qr.historyEditState.editingTags}
                    onRestore={qr.restoreEntry}
                    onClear={qr.clearHistory}
                    onToggleFavorite={qr.toggleFavorite}
                    onDuplicate={qr.duplicateEntry}
                    onBeginEdit={qr.beginEditEntry}
                    onCancelEdit={() => qr.setEditingId(null)}
                    onSaveEdit={qr.saveEditEntry}
                    onEditingLabelChange={qr.setEditingLabel}
                    onEditingTagsChange={qr.setEditingTags}
                  />
                </section>
              </div>
            </aside>

            <div className="order-2 space-y-6 lg:order-1">
              <section
                id="content-section"
                className="scroll-mt-24 rounded-[1.6rem] border border-border/70 bg-background/45 p-6 shadow-[0_24px_60px_-42px_rgba(37,99,235,0.22)]"
              >
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Build</p>
                  <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">Content</h2>
                </div>
                <ContentFields
                  preset={qr.contentState.preset}
                  textValue={qr.contentState.textValue}
                  wifiSsid={qr.contentState.wifiSsid}
                  wifiPassword={qr.contentState.wifiPassword}
                  wifiAuth={qr.contentState.wifiAuth}
                  wifiHidden={qr.contentState.wifiHidden}
                  contactFirstName={qr.contentState.contactFirstName}
                  contactLastName={qr.contentState.contactLastName}
                  contactOrg={qr.contentState.contactOrg}
                  contactPhone={qr.contentState.contactPhone}
                  contactEmail={qr.contentState.contactEmail}
                  emailTo={qr.contentState.emailTo}
                  emailSubject={qr.contentState.emailSubject}
                  emailBody={qr.contentState.emailBody}
                  smsNumber={qr.contentState.smsNumber}
                  smsMessage={qr.contentState.smsMessage}
                  phoneNumber={qr.contentState.phoneNumber}
                  qrValue={qr.qrValue}
                  qrError={qr.qrError}
                  onPresetChange={qr.setPreset}
                  onTextValueChange={qr.setTextValue}
                  onWifiSsidChange={qr.setWifiSsid}
                  onWifiPasswordChange={qr.setWifiPassword}
                  onWifiAuthChange={qr.setWifiAuth}
                  onWifiHiddenChange={qr.setWifiHidden}
                  onContactFirstNameChange={qr.setContactFirstName}
                  onContactLastNameChange={qr.setContactLastName}
                  onContactOrgChange={qr.setContactOrg}
                  onContactPhoneChange={qr.setContactPhone}
                  onContactEmailChange={qr.setContactEmail}
                  onEmailToChange={qr.setEmailTo}
                  onEmailSubjectChange={qr.setEmailSubject}
                  onEmailBodyChange={qr.setEmailBody}
                  onSmsNumberChange={qr.setSmsNumber}
                  onSmsMessageChange={qr.setSmsMessage}
                  onPhoneNumberChange={qr.setPhoneNumber}
                />
              </section>

              <section
                id="style-section"
                className="scroll-mt-24 rounded-[1.6rem] border border-border/70 bg-background/45 p-6 shadow-[0_24px_60px_-42px_rgba(37,99,235,0.22)]"
              >
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Refine</p>
                  <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">Style</h2>
                </div>
                <CustomizationSection
                  fgColor={qr.styleState.fgColor}
                  bgColor={qr.styleState.bgColor}
                  level={qr.styleState.level}
                  effectiveLevel={qr.styleState.effectiveLevel}
                  size={qr.styleState.size}
                  logoDataUrl={qr.styleState.logoDataUrl}
                  logoScale={qr.styleState.logoScale}
                  safeMode={qr.styleState.safeMode}
                  onSyncColorsFromTheme={qr.syncColorsFromTheme}
                  onLevelChange={qr.setLevel}
                  onSizeChange={qr.setSize}
                  onForegroundChange={qr.handleFgColorChange}
                  onBackgroundChange={qr.handleBgColorChange}
                  onLogoFileChange={qr.handleLogoFile}
                  onLogoRemove={() => qr.setLogoDataUrl(null)}
                  onLogoScaleChange={qr.setLogoScale}
                  onSafeModeChange={qr.setSafeMode}
                />
              </section>

              <section
                id="decode-section"
                className="scroll-mt-24 rounded-[1.6rem] border border-border/70 bg-background/45 p-6 shadow-[0_24px_60px_-42px_rgba(37,99,235,0.22)]"
              >
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Inspect</p>
                  <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">Decode</h2>
                </div>
                <DecodeSection
                  decodedText={qr.decodeState.decodedText}
                  decodeError={qr.decodeState.decodeError}
                  decodeBusy={qr.decodeState.decodeBusy}
                  onFileSelected={qr.decodeImageFile}
                  onCopy={qr.copyDecodedText}
                  onUse={qr.useDecodedText}
                />
              </section>

              <section
                id="history-section"
                className="scroll-mt-24 rounded-[1.6rem] border border-border/70 bg-background/45 p-6 shadow-[0_24px_60px_-42px_rgba(37,99,235,0.22)] lg:hidden"
              >
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Saved</p>
                  <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">History</h2>
                </div>
                <HistorySection
                  history={qr.historyEditState.history}
                  editingId={qr.historyEditState.editingId}
                  editingLabel={qr.historyEditState.editingLabel}
                  editingTags={qr.historyEditState.editingTags}
                  onRestore={qr.restoreEntry}
                  onClear={qr.clearHistory}
                  onToggleFavorite={qr.toggleFavorite}
                  onDuplicate={qr.duplicateEntry}
                  onBeginEdit={qr.beginEditEntry}
                  onCancelEdit={() => qr.setEditingId(null)}
                  onSaveEdit={qr.saveEditEntry}
                  onEditingLabelChange={qr.setEditingLabel}
                  onEditingTagsChange={qr.setEditingTags}
                />
              </section>
            </div>
        </div>
      </div>

      <nav className="fixed inset-x-4 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center justify-between rounded-full border border-border bg-background/95 p-1 lg:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-4" aria-hidden />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
