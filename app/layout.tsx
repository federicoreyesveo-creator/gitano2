import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

// v2 · "Bloque": titulares en Archivo expandida (sans pesada y ancha), textos en Geist.
const sans = Geist({ subsets: ["latin"], variable: "--f-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--f-mono" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--f-archivo" });

export const metadata: Metadata = {
  title: "Barbería en Mérida | Gitano Studio · Cortes de autor",
  description:
    "Barbería de autor en Mérida. Fades, corte a tijera, barba con toalla caliente y cortes cortos de mujer con Dayner. México Oriente. Agenda en línea.",
  openGraph: {
    title: "Gitano Studio · No hay suerte. Hay oficio.",
    description: "Barbería de autor en Mérida, Yucatán. Una cabeza a la vez, con cita.",
    locale: "es_MX",
    type: "website",
    siteName: "Gitano Studio",
  },
};

export const viewport: Viewport = {
  themeColor: "#e9e7e2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${sans.variable} ${mono.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
