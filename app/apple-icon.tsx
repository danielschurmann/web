import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

async function loadSpaceGrotesk() {
  const res = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-700-normal.woff",
  );
  if (!res.ok) {
    throw new Error(`Failed to load Space Grotesk: ${res.status}`);
  }
  return res.arrayBuffer();
}

export default async function AppleIcon() {
  const fontData = await loadSpaceGrotesk();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4632D9",
          borderRadius: 50,
          color: "#FFFFFF",
          fontSize: 68,
          fontWeight: 700,
          fontFamily: "Space Grotesk",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        DS
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
