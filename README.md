---

**QR Code Generator** is a small, focused web app for creating scannable QR codes from any text or URL: pick foreground and background colors, preview in real time, and download a PNG—no accounts, no backend required for the core flow.

The current product was created by [Jonathan Rycx](https://github.com/Rixouu), who leads product direction, design, and full-stack implementation.

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-black)](https://ui.shadcn.com/)
![PWA Ready](https://img.shields.io/badge/PWA-Install%20Banner-9ca3af)

### 🔲 Generate & Preview
- Enter any **URL or plain text**; the QR updates as you type
- **Foreground and background** color controls with live preview
- **Error correction** (L / M / Q / H) and **matrix size** (128–400px) controls
- Built on [`react-qr-code`](https://www.npmjs.com/package/react-qr-code)

### 🎨 Theme-aware Colors
- Default QR colors follow **light/dark design tokens** via a DOM probe (`readThemeQrHexFromDocument`)
- Editing colors **locks** them; **Sync with theme** resets the lock and reapplies token colors
- **`ThemeColorMeta`** updates `<meta name="theme-color">` when the resolved theme changes (PWA / mobile chrome bar)

### 💾 Export & Share
- **Download** PNG (same canvas pipeline as before)
- **Copy image** to the clipboard (`ClipboardItem` image/png) where supported
- **Share** via the Web Share API with a PNG file when `navigator.canShare` allows it
- Successful export actions append an entry to **local history**

### 📜 Local History
- Last **20** payloads (value, colors, level, size) in **`localStorage`** (`qr-code-generator-history-v1`)
- **Recent** list in the card: tap to **restore**; **Clear** wipes storage

### 📱 PWA, Splash & Install UX
- **Web app manifest** and **service worker** (production builds) via [`@ducanh2912/next-pwa`](https://github.com/DuCanhGH/next-pwa)
- **Apple startup splash screens** (`metadata.appleWebApp.startupImage`) — spec in `src/lib/apple-splash-spec.json`, assets in `public/splash/`
- **Touch icons** under `public/icons/` (regenerate with `npm run generate:splash` after changing the SVG)
- **`PwaInstallBanner`**: Chrome install prompt + iOS “Add to Home Screen” guidance
- **Mobile layout:** `100dvh`, safe-area padding, `viewport-fit=cover`, `touch-manipulation`, `black-translucent` status bar

### Frontend
- **Next.js 16** (App Router, `src/app`) — `next build --webpack` for `@ducanh2912/next-pwa`
- **React 19**
- **Tailwind CSS 4** (design tokens in `src/app/globals.css`)
- **Shadcn UI** + **Radix** + **Lucide**

### Testing
- **Playwright** (`e2e/`) — smoke tests for home, theme toggle, download toast, skip link. First run: `npx playwright install chromium`.

### Prerequisites
- **Node.js 20.9+**
- **npm**

### Installation
```bash
git clone https://github.com/Rixouu/qrcodegenerator.git
cd qrcodegenerator
npm install
npm run dev
```

Default dev URL: **http://localhost:3000**

### Environment Variables
Create a **`.env.local`** in the project root. Next.js automatically loads this for local development.

#### Required (minimal)
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Canonical site URL for **Open Graph**, **sitemap**, **robots**, and `metadataBase` (must include `https://` in production).

```txt
qrcode-generator/
├── e2e/                    # Playwright specs
├── public/                 # Static assets, icons, splash
├── scripts/                # generate-apple-splash.mjs
├── src/
│   ├── app/                # layout, page, OG image, robots, sitemap, manifest
│   ├── components/         # QR UI, PWA banner, theme, toaster
│   ├── hooks/              # use-theme-qr-colors, use-client-mounted
│   └── lib/                # cn, qr-png, qr-history, site-url, splash metadata
├── playwright.config.ts
├── next.config.mjs
└── package.json
```

### Development
```bash
npm run dev              # Next dev (Webpack, required by PWA plugin)
```

### Build / Run
```bash
npm run build            # Production build
npm run start            # Production server
```

### Code Quality
```bash
npm run lint             # ESLint
npm run test:e2e         # Playwright (build + server on 127.0.0.1:4173)
```

### ♿ Accessibility
- **Skip to content** link (visually hidden until focus) → `#main-content` with `tabIndex={-1}`
- QR preview wrapped in **`role="img"`** + **`aria-label`** describing the encoded payload (truncated)
- Labeled controls for URL, correction level, size, colors, and theme buttons

## 📊 Performance & SEO
- **`metadataBase`**, Open Graph, and Twitter card metadata in `src/app/layout.tsx`
- **`src/lib/site-url.ts`**: set **`NEXT_PUBLIC_SITE_URL`** in production so canonical URLs resolve correctly
- **`opengraph-image.tsx`** — generated 1200×630 preview card

## 🌐 UI & Theme
- **Light / system / dark** via **`next-themes`**, **`ThemeToggle`** in the header
- **Sonner** toast synced to **`resolvedTheme`**

## 🔧 Configuration
- **`vercel.json`** — security headers
- **`package.json` > `overrides`** — clean `npm audit` for transitive `postcss` / `serialize-javascript`
- **`outputFileTracingRoot`** in `next.config.mjs` — workspace lockfile quirk

## 🚀 Deployment
```bash
npm run build
npm run start
```

Deploy with any Node-capable SSR environment that can run the built server output. Configured for **standalone** output for Docker-style deploys.
Set **`NEXT_PUBLIC_SITE_URL`** on the host for correct SEO URLs.

## 🤝 Contributing
Contributions are welcome. If you add features or routes:
1. Run `npm run lint`
2. Run `npm run test:e2e` (uses port 4173; ensure it is free)
3. Open a PR describing behavior + any storage key changes

## 📄 License
No `LICENSE` file was found in this repository. If usage terms exist, they are expected to be defined by the project owner.

## 👥 Team
- **Jonathan** — Lead Developer — [Rixouu](https://github.com/Rixouu)

## 🙏 Acknowledgments
- **Next.js** for the React framework
- **Shadcn UI** for accessible components
- **Tailwind CSS** for the UI foundation
- **react-qr-code** for the core QR logic

---

**Built with ❤️ for quick, shareable QR codes.**
