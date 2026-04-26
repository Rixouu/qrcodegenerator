# 📱 QR Code Generator

**QR Code Generator** is a small, focused web app for creating scannable QR codes from any text or URL: pick foreground and background colors, preview in real time, and download a PNG—no accounts, no backend required for the core flow.

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Shadcn UI · PWA ready

## ✨ Key Features

### 🔲 Generate & preview

- Enter any **URL or plain text**; the QR updates as you type
- **Foreground and background** color controls with live preview
- Built on [`react-qr-code`](https://www.npmjs.com/package/react-qr-code)

### 💾 Download

- **Download as PNG** from the in-page QR preview (canvas-backed export)
- Toast feedback via **Sonner**

### 📱 PWA & install UX

- **Web app manifest** and **service worker** (production builds) via [`@ducanh2912/next-pwa`](https://github.com/DuCanhGH/next-pwa)
- **`PwaInstallBanner`**: Chrome **Install** when `beforeinstallprompt` is available; **iOS Safari** guidance for **Add to Home Screen**; dismiss state stored in `localStorage`
- App icon: `public/icon-qr-code.svg`

### 🎨 UI

- **Shadcn UI** primitives (card, button, input, form patterns)
- **Tailwind CSS 4** with the project’s design tokens in `src/app/globals.css`
- Responsive layout for **mobile and desktop**

## 🛠 Tech Stack

### Frontend

- **Next.js 15** (App Router, `src/app`)
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

- **Node.js 20+** (recommended; LTS aligns with current Next.js defaults)
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

| Script        | Description                    |
| ------------- | ------------------------------ |
| `npm run dev` | Next.js dev server             |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Start production server       |
| `npm run lint`  | ESLint (`next lint`)           |

> **PWA note:** the service worker is **disabled in development** so hot reload stays predictable. Run a **production build** (`npm run build && npm run start`) to verify install prompts and offline caching.

## 📁 Project structure

```text
qrcode-generator/
├── public/                 # Static assets (PWA outputs are gitignored in prod)
├── src/
│   ├── app/                # App Router: layout, page, globals, manifest
│   ├── components/       # UI + `pwa-install-banner`
│   └── lib/                # Utilities (e.g. `cn`)
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

### Stack upgrades (Apr 2026)

- **Next.js** is on the latest **15.5.x** patch line (`15.5.15`) for security fixes; **Next.js 16** is available if you want a major bump and are ready to follow the [upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading).
- **React 19** is already in use; keep `@types/react` aligned with your TypeScript setup when you upgrade.

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
