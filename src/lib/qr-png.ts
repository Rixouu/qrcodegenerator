/**
 * Rasterize the QR SVG (foreground only) onto a solid background and return a PNG blob.
 */
export function rgbCssToHex(cssColor: string): string {
  const trimmed = cssColor.trim();
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return (
        "#" +
        hex
          .split("")
          .map((c) => c + c)
          .join("")
      );
    }
    return trimmed.length === 7 ? trimmed : "#000000";
  }
  const m = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!m) return "#000000";
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  return (
    "#" +
    [r, g, b]
      .map((n) =>
        Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"),
      )
      .join("")
  );
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
  const fg = rgbCssToHex(s.color);
  const bg = rgbCssToHex(s.backgroundColor);
  document.body.removeChild(probe);
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
