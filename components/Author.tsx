"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BIO, COLOR, srcSet } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

const WORD = "Dayner";

/**
 * Dayner, en clave de afiche: fondo oscuro, "DAYNER" gigante centrado por encima del retrato
 * (mix-blend difference: donde pisa la foto, las letras la muestran invertida) y un sello que gira.
 * La palabra queda fija en su lugar: cuando la sección llega, el retrato se abre desde abajo
 * y las letras suben una por una, así todo queda sincronizado con el scroll.
 */
export default function Author() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 65%", once: true } });
      tl.from(q(".va-author-portrait"), { clipPath: "inset(100% 0 0 0)", duration: 1.2, ease: "expo.inOut", clearProps: "clipPath" }) // sin recorte al final: el sello sobresale
        .from(q(".va-author-word .ch"), { yPercent: 105, duration: 1, ease: "expo.out", stagger: 0.06 }, "-=0.6")
        .from(q(".va-badge"), { opacity: 0, duration: 0.6 }, "-=0.5"); // el giro lo hace CSS

      // La palabra se desliza de derecha a izquierda con el scroll y queda centrada justo
      // cuando el retrato está en el medio de la pantalla (el centrado usa `translate`, esto `transform`).
      gsap.fromTo(
        q(".va-author-word"),
        { xPercent: 16 },
        { xPercent: -16, ease: "none", scrollTrigger: { trigger: q(".va-author-stage")[0], start: "top bottom", end: "bottom top", scrub: 0.6 } }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="va-author" id="dayner">
      <div className="va-author-stage">
        <figure className="va-author-portrait">
          <img src={COLOR.dayner.img} srcSet={srcSet(COLOR.dayner.img, COLOR.dayner.w)} sizes="(max-width: 900px) 70vw, 30vw" alt={COLOR.dayner.alt} width={COLOR.dayner.w} height={COLOR.dayner.h} loading="lazy" decoding="async" />
          {/* Sello giratorio: el texto ocupa justo la circunferencia (2π·78 ≈ 490) para que no se pise */}
          <svg className="va-badge" viewBox="0 0 200 200" aria-hidden>
            <defs>
              <path id="va-badge-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <circle cx="100" cy="100" r="98" />
            <text>
              <textPath href="#va-badge-path" textLength="486" lengthAdjust="spacingAndGlyphs">
                BARBERO · FUNDADOR · GITANO STUDIO · MÉRIDA ·
              </textPath>
            </text>
          </svg>
        </figure>
        <p className="va-author-word" aria-hidden>
          {WORD.split("").map((c, i) => (
            <span className="ch" key={i}>
              {c}
            </span>
          ))}
        </p>
      </div>

      <div className="va-author-cols">
        <div data-reveal>
          <p className="va-h2-kicker">Barbero · Fundador · Gitano Studio · Mérida</p>
          <h2 className="va-h2">Dayner, barbero y fundador de Gitano Studio</h2>
          <p className="va-lead">Técnica clásica, lectura actual.</p>
        </div>
        <div className="va-author-bio">
          {BIO.map((t, i) => (
            <p key={t.slice(0, 16)} data-reveal style={{ ["--d" as string]: `${0.08 * i}s` }}>
              {t}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
