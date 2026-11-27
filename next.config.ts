import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hay otro package-lock.json en la carpeta de Alma Bruta; fijamos la raíz aquí.
  turbopack: { root: __dirname },
  // Cabeceras de seguridad básicas (sin CSP para no romper GSAP ni los scripts en línea de Next).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

// Solo en `next dev`: da acceso a la base D1 local (.wrangler/state) y a .dev.vars.
if (process.env.NODE_ENV === "development") initOpenNextCloudflareForDev();
