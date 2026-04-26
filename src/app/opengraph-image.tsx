import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafc",
          color: "#0a0a0a",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fafafc",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            QR
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>
            QR Code Generator
          </div>
        </div>
        <div style={{ fontSize: 26, opacity: 0.75, maxWidth: 900, textAlign: "center" }}>
          Create customizable QR codes, preview live, copy, share, or download PNG.
        </div>
      </div>
    ),
    { ...size },
  );
}
