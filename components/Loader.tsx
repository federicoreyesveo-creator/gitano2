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

const MIN_MS = 2600; // que la carita llegue a dibujarse y cabecear aunque la página cargue al instante

/**
 * Pantalla de carga con la carita: se dibuja trazo a trazo y cabecea (CSS, así se ve antes de que cargue JS)
 * mientras la barra avanza con la carga real (fotos de arriba + tipografías).
 * Al terminar, la carita se achica, el telón sube y arranca la portada.
 * Si algo falla, el CSS la esconde solo a los 7 s.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const html = document.documentElement;
    html.classList.add("no-scroll");
    window.scrollTo(0, 0);

    const t0 = performance.now();
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".va-hero img, .va-manifesto img"));
    const tasks: Promise<unknown>[] = [
      document.fonts.ready,
      ...imgs.map((im) => (im.complete ? Promise.resolve() : new Promise((r) => { im.addEventListener("load", r, { once: true }); im.addEventListener("error", r, { once: true }); }))),
    ];
    let done = 0;
    const setP = (p: number) => el.style.setProperty("--p", String(p));
    tasks.forEach((t) => t.then(() => setP(Math.min(0.9, (++done / tasks.length) * 0.9))));

    let alive = true;
    Promise.all(tasks).then(async () => {
      const wait = MIN_MS - (performance.now() - t0);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      if (!alive) return;
      setP(1);
      const finish = () => {
        html.classList.remove("no-scroll");
        window.__vaReady = true;
        window.dispatchEvent(new Event("va:ready"));
      };
      gsap
        .timeline({ delay: 0.35, onComplete: () => setGone(true) })
        .to(el.querySelector(".va-loader-in"), { scale: 0.85, opacity: 0, duration: 0.45, ease: "power2.in" })
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, "-=0.1")
        .call(finish, [], "-=0.55"); // la portada arranca mientras el telón sube
    });

    return () => {
      alive = false;
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
              {CARITA.paths.map((d, i) => (
                <path key={i} d={d} pathLength={1} style={{ animationDelay: `${0.15 + i * 0.0065}s` }} />
              ))}
            </mask>
            <image href="/img/carita.png" width={CARITA.w} height={CARITA.h} mask="url(#va-carita-pen)" />
            <image className="va-loader-full" href="/img/carita.png" width={CARITA.w} height={CARITA.h} />
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
