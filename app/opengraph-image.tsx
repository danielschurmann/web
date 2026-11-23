import { ImageResponse } from "next/og";

export const alt =
  "DS & Asociados, estudio contable para pymes en Buenos Aires";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F7FB",
          color: "#101828",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              width: 92,
              height: 92,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              background: "#4632D9",
              color: "#FFFFFF",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            DS
          </div>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 700 }}>
            DS &amp; Asociados
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              maxWidth: 980,
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
            }}
          >
            Estudio contable para pymes
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 31,
              color: "#667085",
            }}
          >
            Más de 30 años asesorando empresas · Buenos Aires
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: 10,
            display: "flex",
            borderRadius: 999,
            background: "#4632D9",
          }}
        />
      </div>
    ),
    size,
  );
}
