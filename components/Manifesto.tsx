"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CUTS } from "@/lib/data";
import { reducedMotion } from "./Motion";

gsap.registerPlugin(ScrollTrigger);

/** La frase se "enciende" palabra por palabra al bajar; las fotitos aparecen dentro del texto. */
export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: root.current, start: "top 75%", end: "bottom 70%", scrub: 0.5 };
      gsap.fromTo(".va-m-w", { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: st });
      gsap.fromTo(".va-manifesto img", { scale: 0, rotate: -12 }, { scale: 1, rotate: 0, stagger: 0.3, ease: "back.out(2)", scrollTrigger: st });
    }, root);
    return () => ctx.revert();
  }, []);

  // Las palabras clave van en el color de acento.
  const KEY = ["tuyo", "estilo"];
  const w = (t: string) =>
    t.split(" ").map((x, i) => (
      <span key={x + i} className={`va-m-w ${KEY.includes(x.replace(/[.,]/g, "").toLowerCase()) ? "is-key" : ""}`}>
        {x}{" "}
      </span>
    ));

  return (
    <section ref={root} className="va-manifesto">
      {/* El eslogan de la marca en tres renglones: "Haz" / "tuyo" / "tu estilo." */}
      <p className="va-m-phrase">
        <span className="va-m-line">
          {w("Haz")}
          <img src={CUTS[1].img.replace(".webp", "-480.webp")} alt="" width={480} height={636} loading="lazy" decoding="async" />
        </span>{" "}
        <span className="va-m-line">
          <img src={CUTS[3].img.replace(".webp", "-480.webp")} alt="" width={480} height={636} loading="lazy" decoding="async" />{" "}
          {w("tuyo")}
        </span>{" "}
        <span className="va-m-line">
          {w("tu")}
          <img src={CUTS[5].img.replace(".webp", "-480.webp")} alt="" width={480} height={636} loading="lazy" decoding="async" />{" "}
          {w("estilo.")}
        </span>
      </p>
      <p className="va-m-sub">
        Fades, tijera y navaja con tiempo para el detalle. En Gitano atendemos una cabeza a la vez en la Calle 31 de México Oriente. Sin fila, sin prisa, sin cortes de catálogo.
      </p>
    </section>
  );
}
