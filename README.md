# 📱 QR Code Generator

**QR Code Generator** is a small, focused web app for creating scannable QR codes from any text or URL: pick foreground and background colors, preview in real time, and download a PNG—no accounts, no backend required for the core flow.

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Shadcn UI · PWA ready

## ✨ Key Features

### 🔲 Generate & preview

- Enter any **URL or plain text**; the QR updates as you type
- **Foreground and background** color controls with live preview
- **Error correction** (L / M / Q / H) and **matrix size** (128–400px) controls
- Built on [`react-qr-code`](https://www.npmjs.com/package/react-qr-code)

### 🎨 Theme-aware colors

- Default QR colors follow **light/dark design tokens** via a DOM probe (`readThemeQrHexFromDocument`)
- Editing colors **locks** them; **Sync with theme** resets the lock and reapplies token colors
- **`ThemeColorMeta`** updates `<meta name="theme-color">` when the resolved theme changes (PWA / mobile chrome bar)

### 💾 Export & share

- **Download** PNG (same canvas pipeline as before)
- **Copy image** to the clipboard (`ClipboardItem` image/png) where supported
- **Share** via the Web Share API with a PNG file when `navigator.canShare` allows it
- Successful export actions append an entry to **local history** (see below)

### 📜 Local history

- Last **20** payloads (value, colors, level, size) in **`localStorage`** (`qr-code-generator-history-v1`)
- **Recent** list in the card: tap to **restore**; **Clear** wipes storage

### 📱 PWA, splash & install UX

- **Web app manifest** and **service worker** (production builds) via [`@ducanh2912/next-pwa`](https://github.com/DuCanhGH/next-pwa)
- **Apple startup splash screens** (`metadata.appleWebApp.startupImage`) — spec in `src/lib/apple-splash-spec.json`, assets in `public/splash/`
- **Touch icons** under `public/icons/` (regenerate with `npm run generate:splash` after changing the SVG)
- **`PwaInstallBanner`**: Chrome install prompt + iOS “Add to Home Screen” guidance
- **Mobile layout:** `100dvh`, safe-area padding, `viewport-fit=cover`, `touch-manipulation`, `black-translucent` status bar

### 🔎 SEO & social

- **`metadataBase`**, Open Graph, and Twitter card metadata in `src/app/layout.tsx`
- **`src/lib/site-url.ts`**: set **`NEXT_PUBLIC_SITE_URL`** in production (e.g. `https://your-domain.com`) so canonical URLs, `robots.txt`, `sitemap.xml`, and social images resolve correctly
- **`opengraph-image.tsx`** — generated 1200×630 preview card

### ♿ Accessibility

- **Skip to content** link (visually hidden until focus) → `#main-content` with `tabIndex={-1}`
- QR preview wrapped in **`role="img"`** + **`aria-label`** describing the encoded payload (truncated)
- Labeled controls for URL, correction level, size, colors, and theme buttons (`aria-label` on icon-only theme controls)

### 🎨 UI & theme

- **Shadcn UI** + **Tailwind CSS 4** tokens in `src/app/globals.css`
- **Light / system / dark** via **`next-themes`**, **`ThemeToggle`** in the header, **Sonner** synced to **`resolvedTheme`**

## 🛠 Tech Stack

### Frontend

- **Next.js 16** (App Router, `src/app`) — **`next build --webpack`** for `@ducanh2912/next-pwa`
- **React 19** · **TypeScript** · **Tailwind CSS 4**
- **Shadcn UI** + **Radix** · **Lucide**

### QR & forms

- **react-qr-code** · **react-hook-form** + **Zod** + **@hookform/resolvers** (available for validation-heavy flows)

### Testing

- **Playwright** (`e2e/`) — smoke tests for home, theme toggle, download toast, skip link. First run: **`npx playwright install chromium`**. The dev server uses **port 4173** so tests never attach to a stray `localhost:3000` dev session.

## 🚀 Quick Start

### Prerequisites

- **Node.js 20.9+**
- **npm**

### Installation

```bash
git clone https://github.com/Rixouu/qrcodegenerator.git
cd qrcodegenerator
npm install
npx playwright install chromium   # once, if you run E2E
npm run dev
```

Open **http://localhost:3000**.

### Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for **Open Graph**, **sitemap**, **robots**, and `metadataBase` (include `https://`) |

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next dev (**Webpack**, required by the PWA plugin) |
| `npm run build` | Production build (**Webpack**) |
| `npm run start` | Production server (`next start`; with `output: 'standalone'`, prefer `node .next/standalone/server.js` on your host if documented by your platform) |
| `npm run lint` | ESLint |
| `npm run generate:splash` | Regenerate Apple splashes + PNG icons (**sharp**) |
| `npm run test:e2e` | Playwright (build + server on **127.0.0.1:4173**) |

> **PWA:** service worker is **off in development**. Use **`npm run build && npm run start`** to verify install, splash, and offline behavior.

## 📁 Project structure

```text
qrcode-generator/
├── e2e/                    # Playwright specs
├── public/icons, splash/
├── scripts/generate-apple-splash.mjs
├── src/
│   ├── app/                # layout, page, OG image, robots, sitemap, manifest
│   ├── components/         # QR UI, PWA banner, theme, toaster
│   ├── hooks/              # use-theme-qr-colors, use-client-mounted
│   └── lib/                # cn, qr-png, qr-history, site-url, splash metadata
├── playwright.config.ts
├── next.config.mjs
└── package.json
```

## 🌐 Deployment

Configured for **standalone** output for Docker-style deploys.

```bash
npm run build
npm run start
```

Set **`NEXT_PUBLIC_SITE_URL`** on the host for correct SEO URLs.

## 🔧 Configuration

- **`vercel.json`** — security headers
- **`package.json` > `overrides`** — clean `npm audit` for transitive `postcss` / `serialize-javascript`
- **`outputFileTracingRoot`** in `next.config.mjs` — workspace lockfile quirk

## 🤝 Contributing

1. `npm run lint`
2. `npm run test:e2e` (uses port **4173**; ensure it is free)
3. Open a PR describing behavior + any storage key changes

## 📄 License

No `LICENSE` file is bundled. Add one or clarify terms with the repository owner.

## 👥 Credits

- **Next.js** · **Shadcn UI** · **react-qr-code**

---

**Built for quick, shareable QR codes.**
