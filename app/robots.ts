import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";

// Todo abierto (también a los buscadores de IA), menos el panel, las citas y la API.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/panel", "/reserva/", "/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
