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
          background: "linear-gradient(135deg, #0A2340 0%, #17457A 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: 8,
            color: "#E4BD63",
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
            background: "#C99A3E",
            marginTop: 36,
            borderRadius: 4,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
