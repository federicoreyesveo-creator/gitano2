import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

// v2 · "Bloque": titulares en Archivo expandida (sans pesada y ancha), textos en Geist.
const sans = Geist({ subsets: ["latin"], variable: "--f-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--f-mono" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--f-archivo" });

export const metadata: Metadata = {
  title: "Gitano Studio · Barbería de autor en Mérida, Yucatán",
  description:
    "Barbería de autor en Mérida, Yucatán. Dayner y Gitano Studio: corte personalizado, corte a tijera, barba, corte corto femenino y la Experiencia Gitano. Calle 31, Circuito Colonias. Agenda en línea.",
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
