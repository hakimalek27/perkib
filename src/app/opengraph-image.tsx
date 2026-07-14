import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "PERKIB — Pertubuhan Kebajikan Imam dan Bilal MAIWP";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0D1117 0%, #171C24 55%, #0D1117 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: 80,
          position: "relative",
        }}
      >
        {/* Outline arch hiasan */}
        <svg
          width={340}
          height={408}
          viewBox="0 0 100 120"
          style={{ position: "absolute", right: -40, top: -20, opacity: 0.08 }}
        >
          <path
            d="M2,120 L2,48 C2,20 22,4 47,1 L50,0 L53,1 C78,4 98,20 98,48 L98,120"
            stroke="#D9BC82"
            strokeWidth={2}
            fill="none"
          />
        </svg>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: 8,
            color: "#D9BC82",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          PERKIB
        </div>
        <div
          style={{
            display: "flex",
            textAlign: "center",
            fontSize: 60,
            fontWeight: 700,
            marginTop: 24,
            lineHeight: 1.2,
          }}
        >
          Pertubuhan Kebajikan Imam dan Bilal MAIWP
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "rgba(255,255,255,0.8)",
            marginTop: 28,
            textAlign: "center",
          }}
        >
          Merealisasikan Perkhidmatan Pegawai Masjid Kontemporari
        </div>
        <div
          style={{
            display: "flex",
            width: 120,
            height: 4,
            background: "#C6A25D",
            marginTop: 36,
            borderRadius: 4,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
