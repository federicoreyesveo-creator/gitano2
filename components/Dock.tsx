"use client";

import { useEffect, useState } from "react";
import { ADDRESS, BOOK_LINK, WHATSAPP_URL } from "@/lib/data";
import Social from "./Social";

const LINKS = [
  { href: "#cortes", label: "Cortes" },
  { href: "#dayner", label: "Dayner" },
  { href: "#servicios", label: "Servicios" },
  { href: "#preguntas", label: "Preguntas" },
  { href: "#visita", label: "Visita" },
];

/** Botonera fija abajo (Menú · Agendar · WhatsApp) y el menú a pantalla completa. */
export default function Dock() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("no-scroll");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("no-scroll");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div id="menu" className={`va-menu ${open ? "is-open" : ""}`} aria-hidden={!open} data-lenis-prevent>
        <nav aria-label="Secciones">
          {LINKS.map((l, i) => (
            <a key={l.href} href={l.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} style={{ transitionDelay: open ? `${0.1 + i * 0.05}s` : "0s" }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="va-menu-foot">
          <img className="va-logo" src="/img/carita.png" alt="" width={684} height={642} />
          <span>{ADDRESS.line1} · Mérida, Yuc.</span>
          <Social tabIndex={open ? 0 : -1} />
        </div>
      </div>

      <nav className="va-dock" aria-label="Acciones">
        <button type="button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
          {open ? "Cerrar" : "Menú"}
        </button>
        <a {...BOOK_LINK} className="is-main">
          Agendar
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener" aria-label="WhatsApp">
          Whats
        </a>
      </nav>
    </>
  );
}
