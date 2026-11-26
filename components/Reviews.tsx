"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RATING, REVIEWS } from "@/lib/data";
import { ArrowOut } from "./ArrowOut";

gsap.registerPlugin(ScrollTrigger);

// Estrellas en SVG (el carácter ★ puede salir como emoji en iPhone).
export const Stars = ({ className = "va-stars" }: { className?: string }) => (
  <span className={className} role="img" aria-label="5 de 5 estrellas">
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} viewBox="0 0 20 20" aria-hidden>
        <path d="M10 1.2l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L10 15.1l-5.6 3.1 1.3-6.2L1 7.7l6.3-.7z" fill="currentColor" />
      </svg>
    ))}
  </span>
);

/**
 * Reseñas de Google. En desktop la sección queda fija y las tarjetas pasan de derecha a izquierda
 * con el scroll; en mobile es una tira que se desliza con el dedo.
 */
export default function Reviews() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      const el = track.current!;
      // Recorre hasta que la última tarjeta queda con el mismo margen que la primera.
      const dist = () => Math.max(0, el.scrollWidth - el.clientWidth + parseFloat(getComputedStyle(el).paddingLeft));
      gsap.to(el.children, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="va-reviews" id="resenas">
      <div className="va-rev-head">
        <div>
          <h2 className="va-h2" data-reveal>
            Reseñas de Gitano Studio en Google
          </h2>
          <p className="va-rev-score" data-reveal aria-hidden>
            {RATING.score}
          </p>
        </div>
        <div className="va-rev-meta" data-reveal>
          <Stars />
          <p>
            {RATING.score} de 5 en Google, con {RATING.count} reseñas.
            <br />
            Todas de cinco estrellas.
          </p>
        </div>
      </div>

      <div ref={track} className="va-rev-track">
        {REVIEWS.map((r, i) => (
          <figure className="va-rev-card" key={r.name}>
            <span className="va-rev-no">{String(i + 1).padStart(2, "0")}</span>
            <blockquote>“{r.text}”</blockquote>
            <figcaption>
              <Stars />
              <span className="va-rev-name">{r.name}</span>
              {r.meta && <span className="va-rev-sub">{r.meta}</span>}
            </figcaption>
          </figure>
        ))}
        <a className="va-rev-card is-more" href={RATING.url} target="_blank" rel="noopener">
          <span className="va-rev-no">+{RATING.count - REVIEWS.length}</span>
          <span className="va-rev-more">
            Lee las {RATING.count} reseñas en Google <ArrowOut />
          </span>
        </a>
      </div>
    </section>
  );
}
