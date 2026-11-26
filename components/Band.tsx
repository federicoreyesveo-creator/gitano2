"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { reducedMotion } from "./Motion";


const ITEMS = [
  "Fades",
  "Tijera y navaja",
  "Barba con toalla caliente",
  "Cortes cortos de mujer",
  "Una cabeza a la vez",
  "Sin fila, sin prisa",
  "Solo con cita",
  "Mérida, Yucatán",
];

// Asterisco en SVG (los caracteres tipo ✱ pueden salir como emoji en iPhone).
const Star = () => (
  <svg className="va-band-star" viewBox="0 0 20 20" aria-hidden>
    <path d="M10 1v18M2.2 5.5l15.6 9M2.2 14.5l15.6-9" stroke="currentColor" strokeWidth="3.2" strokeLinecap="square" />
  </svg>
);

/**
 * Banda que cruza toda la pantalla con el texto corriendo.
 * Corre sola; al scrollear se acelera y toma la dirección del scroll, y después vuelve a su ritmo.
 */
export default function Band() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const loop = gsap.fromTo(track.current, { xPercent: 0 }, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
    loop.totalTime(loop.duration() * 500); // margen para poder correr hacia atrás sin topar con el inicio
    // Cada cuadro: cuánto se movió el scroll. Más rápido = la banda corre más rápido,
    // y queda mirando para el lado del último scroll. Suavizado para que no dé tirones.
    let lastY = window.scrollY;
    let dir = 1;
    let ts = 1;
    const tick = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (dy) dir = dy > 0 ? 1 : -1;
      const target = dir * (1 + Math.min(Math.abs(dy) / 6, 5));
      ts += (target - ts) * 0.1;
      loop.timeScale(ts);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      loop.kill();
    };
  }, []);

  const group = (
    <div className="va-band-group">
      {ITEMS.map((t) => (
        <span key={t} className="va-band-item">
          {t}
          <Star />
        </span>
      ))}
    </div>
  );

  return (
    <div className="va-band" aria-label={ITEMS.join(" · ")} role="img">
      <div ref={track} className="va-band-track" aria-hidden>
        {group}
        {group}
      </div>
    </div>
  );
}
