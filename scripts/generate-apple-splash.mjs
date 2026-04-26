/**
 * Generates Apple touch icon + PWA maskable-ish icons + startup splash PNGs
 * from public/icon-qr-code.svg using sharp. Run: npm run generate:splash
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const iconSvgPath = path.join(root, "public", "icon-qr-code.svg");
const specPath = path.join(root, "src", "lib", "apple-splash-spec.json");
const splashDir = path.join(root, "public", "splash");
const iconsDir = path.join(root, "public", "icons");

const BG = { r: 0, g: 0, b: 0, alpha: 1 };

async function compositeSplash(width, height, iconBuffer) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: iconBuffer, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  const svg = await readFile(iconSvgPath);
  await mkdir(splashDir, { recursive: true });
  await mkdir(iconsDir, { recursive: true });

  const spec = JSON.parse(await readFile(specPath, "utf8"));

  for (const entry of spec) {
    const iconSize = Math.round(Math.min(entry.width, entry.height) * 0.22);
    const iconBuf = await sharp(svg)
      .resize({ width: iconSize, height: iconSize, fit: "contain" })
      .png()
      .toBuffer();

    const out = path.join(splashDir, entry.filename);
    const buf = await compositeSplash(entry.width, entry.height, iconBuf);
    await sharp(buf).toFile(out);
    process.stdout.write(`Wrote ${entry.filename}\n`);
  }

  const icon192 = await sharp(svg).resize(192, 192, { fit: "contain" }).png().toBuffer();
  await sharp({
    create: { width: 192, height: 192, channels: 4, background: BG },
  })
    .composite([{ input: icon192, gravity: "center" }])
    .png()
    .toFile(path.join(iconsDir, "icon-192.png"));

  const icon512 = await sharp(svg).resize(512, 512, { fit: "contain" }).png().toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: BG },
  })
    .composite([{ input: icon512, gravity: "center" }])
    .png()
    .toFile(path.join(iconsDir, "icon-512.png"));

  const apple180 = await sharp(svg).resize(180, 180, { fit: "contain" }).png().toBuffer();
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: BG },
  })
    .composite([{ input: apple180, gravity: "center" }])
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));

  process.stdout.write("Wrote icons/icon-192.png, icon-512.png, apple-touch-icon.png\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
