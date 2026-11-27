"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CARITA } from "@/lib/carita";

declare global {
  interface Window {
    __vaReady?: boolean;
  }
}

/** Corre `fn` cuando terminó la pantalla de carga (o ya, si terminó antes). */
export function onReady(fn: () => void) {
  if (window.__vaReady) {
    fn();
    return () => {};
  }
  window.addEventListener("va:ready", fn, { once: true });
  return () => window.removeEventListener("va:ready", fn);
}

const DRAW_DELAY = 0.1; // el lápiz arranca un toque después de que aparece la pantalla
const DRAW_S = 1.1; // lo que tarda el lápiz en recorrer toda la carita, a velocidad pareja
const DRAW_END_MS = (DRAW_DELAY + DRAW_S) * 1000; // la barra y el dibujo terminan juntos acá

/**
 * Pantalla de carga con la carita: un solo lápiz la recorre entera, como una viborita, y cabecea (CSS, así se ve antes de que cargue JS)
 * mientras la barra avanza a la par del lápiz (y espera a la carga real si viene más lenta: fotos de arriba + tipografías).
 * Al terminar, la carita se achica, el telón sube y arranca la portada.
 * Si algo falla, el CSS la esconde solo a los 4 s.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const html = document.documentElement;
    html.classList.add("no-scroll");
    window.scrollTo(0, 0);

    // Reloj del lápiz: el dibujo es CSS y arranca apenas se pinta la página (antes que este JS),
    // así que la barra lee el tiempo de esa misma animación en vez de contar desde acá.
    const pen = el.querySelector("mask path")?.getAnimations()[0];
    const t0 = performance.now() - (typeof pen?.currentTime === "number" ? pen.currentTime : 0);
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".va-hero img"));
    const tasks: Promise<unknown>[] = [
      document.fonts.ready,
      ...imgs.map((im) => (im.complete ? Promise.resolve() : new Promise((r) => { im.addEventListener("load", r, { once: true }); im.addEventListener("error", r, { once: true }); }))),
    ];
    let done = 0;
    tasks.forEach((t) => t.then(() => done++));

    // La barra va a la par del lápiz: llega al final justo cuando termina de dibujarse la carita.
    // Si la carga viene más lenta, la barra espera a la carga (nunca se adelanta a ninguna de las dos).
    let shown = 0;
    const tick = () => {
      const s = (performance.now() - t0) / 1000;
      const draw = Math.min(1, Math.max(0, (s - DRAW_DELAY) / DRAW_S));
      const target = Math.min(draw, done / tasks.length);
      // sigue al lápiz casi pegada; si la carga la frenó y después se pone al día, el salto se suaviza
      shown += (target - shown) * 0.35;
      if (target - shown < 0.003) shown = target;
      el.style.setProperty("--p", shown.toFixed(4));
    };
    gsap.ticker.add(tick);

    let alive = true;
    Promise.all(tasks).then(async () => {
      const wait = DRAW_END_MS - (performance.now() - t0);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      if (!alive) return;
      // si la carga terminó después del dibujo, deja que la barra termine de llenarse
      await new Promise<void>((r) => { const chk = () => { if (shown >= 1 || !alive) { gsap.ticker.remove(chk); r(); } }; gsap.ticker.add(chk); });
      gsap.ticker.remove(tick);
      if (!alive) return;
      const finish = () => {
        html.classList.remove("no-scroll");
        window.__vaReady = true;
        window.dispatchEvent(new Event("va:ready"));
      };
      gsap
        .timeline({ delay: 0.15, onComplete: () => setGone(true) })
        // Se va para atrás: arranca lento y de golpe se achica y desaparece.
        .to(el.querySelector(".va-loader-in"), { scale: 0.3, opacity: 0, duration: 0.45, ease: "expo.in" })
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.65, ease: "expo.inOut" }, "-=0.05")
        .call(finish, [], "-=0.4"); // la portada arranca mientras el telón sube
    });

    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      html.classList.remove("no-scroll");
    };
  }, []);

  if (gone) return null;
  return (
    <div ref={root} className="va-loader" aria-hidden>
      <div className="va-loader-in">
        <div className="va-loader-face">
          {/* Los trazos se dibujan uno tras otro (CSS) y, como máscara, van revelando la carita original */}
          <svg viewBox={`0 0 ${CARITA.w} ${CARITA.h}`}>
            <mask id="va-carita-pen" maskUnits="userSpaceOnUse" x="0" y="0" width={CARITA.w} height={CARITA.h}>
              {CARITA.paths.map((p, i) => (
                <path
                  key={i}
                  d={p.d}
                  pathLength={1}
                  style={{ animationDelay: `${(DRAW_DELAY + p.t0 * DRAW_S).toFixed(3)}s`, animationDuration: `${Math.max(p.dt * DRAW_S, 0.004).toFixed(3)}s` }}
                />
              ))}
            </mask>
            <image href="/img/carita.webp" width={CARITA.w} height={CARITA.h} mask="url(#va-carita-pen)" />
            <image className="va-loader-full" href="/img/carita.webp" width={CARITA.w} height={CARITA.h} />
          </svg>
        </div>
        <div className="va-loader-bar">
          <i />
        </div>
        <span className="va-loader-word">Gitano Studio</span>
      </div>
    </div>
  );
}
