"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lo que aprendimos en v1, aplicado desde el arranque:
 * - "Reducir movimiento" (y el modo de bajo consumo del iPhone, que lo activa) NO apaga el sitio:
 *   se pierden el scroll suave y los recorridos fijos, pero las entradas siguen con un fade.
 * - Las secciones fijas se miden en orden de página (refreshPriority + sort).
 */
export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll suave + entradas [data-reveal] para toda la página. */
export default function Motion() {
  useEffect(() => {
    // Entradas: cada [data-reveal] recibe .is-in cuando asoma. Funciona con o sin movimiento reducido.
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    const watch = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });

    if (reducedMotion()) {
      return () => {
        io.disconnect();
        mo.disconnect();
      };
    }

    const lenis = new Lenis({ lerp: 0.09, anchors: { offset: 0 } });
    lenis.on("scroll", ScrollTrigger.update);
    // Quieto mientras está la pantalla de carga.
    if (!window.__vaReady) {
      lenis.stop();
      window.addEventListener("va:ready", () => lenis.start(), { once: true });
    }
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Cuando todo está montado y las fuentes cargaron, se vuelve a medir en orden.
    document.fonts?.ready.then(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => {
      io.disconnect();
      mo.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}

/** Ajusta el cuerpo de un texto para que ocupe exactamente el ancho de su contenedor. */
export function fitToWidth(el: HTMLElement, box: HTMLElement, factor = 0.995) {
  el.style.fontSize = "100px";
  for (let i = 0; i < 3; i++) {
    const size = parseFloat(el.style.fontSize);
    const w = el.getBoundingClientRect().width || 1;
    el.style.fontSize = `${(size * box.clientWidth * factor) / w}px`;
  }
}
