"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Logo fijo arriba al centro, en modo inversión (mix-blend difference):
 * sobre lo claro se ve oscuro, sobre lo oscuro claro, y sobre las fotos las invierte.
 * Aparece cuando termina la portada (donde ya está escrito "Gitano Studio").
 */
export default function NavLogo() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: ".va-manifesto",
      start: "top 70%",
      onEnter: () => ref.current?.classList.add("is-on"),
      onLeaveBack: () => ref.current?.classList.remove("is-on"),
    });
    return () => st.kill();
  }, []);

  return (
    <a ref={ref} href="#inicio" className="va-navlogo" aria-label="Gitano Studio, volver al inicio">
      <img src="/img/carita.webp" alt="" width={684} height={642} />
    </a>
  );
}
