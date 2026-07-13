import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menghasilkan .next/standalone dengan server.js minimum supaya boleh
  // rsync bundle nipis ke pelayan (kemudian). server.js dengar PORT/HOST.
  output: "standalone",
  // Jangan dedah rangka kerja melalui header X-Powered-By.
  poweredByHeader: false,
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
};

export default nextConfig;
