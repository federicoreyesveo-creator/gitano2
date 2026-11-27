import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hay otro package-lock.json en la carpeta de Alma Bruta; fijamos la raíz aquí.
  turbopack: { root: __dirname },
};

export default nextConfig;

// Solo en `next dev`: da acceso a la base D1 local (.wrangler/state) y a .dev.vars.
if (process.env.NODE_ENV === "development") initOpenNextCloudflareForDev();
