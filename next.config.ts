import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// CSP untuk laman awam. Ketat tetapi pragmatik: tiada middleware bermakna tiada
// nonce, jadi script-src perlukan 'unsafe-inline' untuk skrip bootstrap Next.
// 'unsafe-eval' hanya dalam dev (HMR). Semua panggilan luar (Sanity, WhatsApp)
// dibuat server-side — pelayar tidak perlu connect-src ke mereka kecuali CDN imej.
const sitePolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self' https://*.sanity.io",
  "worker-src 'self' blob:",
].join("; ");

// Studio Sanity perlukan eval + inline + sambungan ke API Sanity + iframe pratonton.
const studioPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io",
  "font-src 'self' data: https://*.sanity.io",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.api.sanity.io",
  "frame-src 'self' https://*.sanity.io",
  "worker-src 'self' blob:",
].join("; ");

const commonSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Menghasilkan .next/standalone dengan server.js minimum supaya boleh
  // rsync bundle nipis ke pelayan (kemudian). server.js dengar PORT/HOST.
  output: "standalone",
  // Jangan dedah rangka kerja melalui header X-Powered-By.
  poweredByHeader: false,
  // Server action lalai had 1MB — naikkan supaya muat naik foto pegawai (≤5MB) berjaya.
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
  images: {
    remotePatterns: [
      // CDN imej Sanity — digunakan oleh next/image bila kandungan diambil
      // dari Sanity. Tanpa allowlist ini, next/image tolak URL "Invalid src".
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      // Studio: polisi longgar (mesti didahulukan; matcher awam kecualikan /studio).
      {
        source: "/studio/:path*",
        headers: [
          ...commonSecurityHeaders,
          { key: "Content-Security-Policy", value: studioPolicy },
        ],
      },
      // Semua laluan LAIN daripada /studio: polisi ketat.
      {
        source: "/((?!studio).*)",
        headers: [
          ...commonSecurityHeaders,
          { key: "Content-Security-Policy", value: sitePolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
