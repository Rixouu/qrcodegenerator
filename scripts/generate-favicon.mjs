/**
 * Generates src/app/favicon.ico and png favicons from public/icon-qr-code.png
 * Background is expected to be baked into icon-qr-code.png (or match the app bg).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const sourcePng = path.join(root, "public", "icon-qr-code.png");
const outAppDir = path.join(root, "src", "app");
const outPublicDir = path.join(root, "public");

async function main() {
  await mkdir(outAppDir, { recursive: true });

  const png16 = await sharp(sourcePng).resize(16, 16, { fit: "cover" }).png().toBuffer();
  const png32 = await sharp(sourcePng).resize(32, 32, { fit: "cover" }).png().toBuffer();
  const png48 = await sharp(sourcePng).resize(48, 48, { fit: "cover" }).png().toBuffer();

  const ico = await pngToIco([png16, png32, png48]);
  await writeFile(path.join(outAppDir, "favicon.ico"), ico);

  await writeFile(path.join(outPublicDir, "favicon-16x16.png"), png16);
  await writeFile(path.join(outPublicDir, "favicon-32x32.png"), png32);
  await writeFile(path.join(outPublicDir, "favicon-48x48.png"), png48);

  process.stdout.write("Wrote src/app/favicon.ico and public/favicon-*.png\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

