/**
 * Rasterize the QR SVG (foreground only) onto a solid background and return a PNG blob.
 */
export function rgbCssToHex(cssColor: string): string {
  if (typeof document === "undefined") return "#000000";
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#000000";
  ctx.fillStyle = cssColor;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return (
    "#" +
    [data[0], data[1], data[2]]
      .map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"))
      .join("")
  );
}

function getLuminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function readThemeQrHexFromDocument(): { fg: string; bg: string } {
  if (typeof document === "undefined") {
    return { fg: "#171717", bg: "#ffffff" };
  }
  const probe = document.createElement("div");
  probe.className = "text-foreground bg-background";
  probe.setAttribute(
    "style",
    "position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;",
  );
  document.body.appendChild(probe);
  const s = getComputedStyle(probe);
  let fg = rgbCssToHex(s.color);
  let bg = rgbCssToHex(s.backgroundColor);
  document.body.removeChild(probe);

  if (getLuminance(bg) < 0.5) {
    const temp = fg;
    fg = bg;
    bg = temp;
  }

  return { fg, bg };
}

export async function qrSvgToPngBlob(
  svg: SVGElement,
  bgColor: string,
): Promise<Blob> {
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("2d context"));
          return;
        }
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(svgUrl);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("toBlob"));
          },
          "image/png",
          1,
        );
      } catch (e) {
        URL.revokeObjectURL(svgUrl);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error("image load"));
    };
    img.src = svgUrl;
  });
}
