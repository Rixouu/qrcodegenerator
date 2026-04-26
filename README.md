# 📱 QR Code Generator

**QR Code Generator** is a small, focused web app for creating scannable QR codes from any text or URL: pick foreground and background colors, preview in real time, and download a PNG—no accounts, no backend required for the core flow.

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Shadcn UI · PWA ready

## ✨ Key Features

### 🔲 Generate & preview

- Enter any **URL or plain text**; the QR updates as you type
- **Foreground and background** color controls with live preview
- Built on [`react-qr-code`](https://www.npmjs.com/package/react-qr-code)

### 💾 Download

- **Download as PNG** from the in-page QR preview (canvas-backed export)
- Toast feedback via **Sonner**

### 📱 PWA, splash & install UX

- **Web app manifest** and **service worker** (production builds) via [`@ducanh2912/next-pwa`](https://github.com/DuCanhGH/next-pwa)
- **Apple startup splash screens** (`metadata.appleWebApp.startupImage`) generated for common iPhone and iPad portrait sizes — source SVG `public/icon-qr-code.svg`, outputs under `public/splash/`; spec lives in `src/lib/apple-splash-spec.json`
- **Touch icons:** `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (regenerate with `npm run generate:splash` after changing the SVG)
- **`PwaInstallBanner`**: Chrome **Install** when `beforeinstallprompt` is available; **iOS Safari** guidance for **Add to Home Screen**; dismiss state stored in `localStorage`
- **Mobile layout:** `100dvh`, safe-area padding on the home surface, `viewport-fit=cover`, `touch-manipulation`, and `apple-mobile-web-app-status-bar-style` set to **black-translucent** for a more native shell feel

### 🎨 UI

- **Shadcn UI** primitives (card, button, input, form patterns)
- **Tailwind CSS 4** with the project’s design tokens in `src/app/globals.css`
- Responsive layout for **mobile and desktop**

## 🛠 Tech Stack

### Frontend

- **Next.js 16** (App Router, `src/app`) — production builds use **`next build --webpack`** because `@ducanh2912/next-pwa` injects a Webpack configuration ([Turbopack is default in v16](https://nextjs.org/docs/app/guides/upgrading/version-16#turbopack-by-default))
- **React 19**
- **TypeScript**
- **Tailwind CSS 4** (`@tailwindcss/postcss`)
- **Shadcn UI** + **Radix** primitives
- **Lucide** icons

### QR & forms

- **react-qr-code** for matrix rendering
- **react-hook-form** + **Zod** + **@hookform/resolvers** (available for form validation patterns)

## 🚀 Quick Start

### Prerequisites

- **Node.js 20.9+** (Next.js 16 minimum)
- **npm**

### Installation

```bash
git clone https://github.com/Rixouu/qrcodegenerator.git
cd qrcodegenerator
npm install
npm run dev
```

Open **http://localhost:3000**.

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js dev server (**Webpack** — matches `@ducanh2912/next-pwa`, which injects a Webpack config) |
| `npm run build` | Production build with **Webpack** (required for the PWA plugin) |
| `npm run start` | Start production server |
| `npm run lint` | ESLint (flat config + `eslint-config-next`) |
| `npm run generate:splash` | Regenerate Apple splashes + PNG icons from `public/icon-qr-code.svg` (uses **sharp**) |

> **PWA note:** the service worker is **disabled in development** so hot reload stays predictable. Run a **production build** (`npm run build && npm run start`) to verify install prompts, splash screens, and offline caching.

## 📁 Project structure

```text
qrcode-generator/
├── public/
│   ├── icons/              # PNG icons (generated)
│   ├── splash/             # Apple startup images (generated)
│   └── icon-qr-code.svg    # Source artwork for splashes + icons
├── scripts/
│   └── generate-apple-splash.mjs
├── src/
│   ├── app/                # App Router: layout, page, globals, manifest
│   ├── components/         # UI + `pwa-install-banner`
│   └── lib/                # `cn`, splash spec, `pwa-apple-startup`
├── next.config.mjs         # Next config + PWA wrapper
├── package.json
└── README.md
```

## 🌐 Deployment

The app is configured for **standalone** output (`output: 'standalone'` in `next.config.mjs`), which works well on **Vercel** and other Node hosts.

```bash
npm run build
npm run start
```

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more options.

## 🔧 Configuration

- **Security / cache headers:** `vercel.json`
- **Images:** `remotePatterns` for `vercel.com` and `nextjs.org` (replace or extend if you add remote images)
- **`package.json` > `overrides`:** pins transitive **`postcss`** (≥ 8.5.10) and **`serialize-javascript`** (from Workbox via the PWA plugin) so `npm audit` stays clean without downgrading Next.js
- **`outputFileTracingRoot`** in `next.config.mjs` avoids incorrect workspace root detection when a parent directory contains another lockfile

## 🤝 Contributing

Contributions are welcome.

1. Run `npm run lint`
2. Open a PR with a short description of the change

## 📄 License

No `LICENSE` file is bundled in this repository. If you need explicit terms, add a license file or clarify usage with the repository owner.

## 👥 Credits

- **Next.js** team for the App Router and deployment story
- **Shadcn UI** for accessible component patterns
- **react-qr-code** for QR rendering

---

**Built for quick, shareable QR codes.**
