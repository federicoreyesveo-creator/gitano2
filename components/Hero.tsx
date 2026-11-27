"use client";

import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COVER } from "@/lib/data";
import { reducedMotion } from "./Motion";
import { onReady } from "./Loader";

gsap.registerPlugin(ScrollTrigger);

/**
 * Portada. La foto arranca del tamaño del marco del centro (retrato entero) y, al bajar,
 * la caja crece hasta ocupar toda la pantalla
 * mientras "GITANO" se va hacia la izquierda y "STUDIO" hacia la derecha.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  // La portada está dentro de <picture>, que React no precarga solo: la pedimos primero y con prioridad alta,
  // una versión por pantalla para no bajar la horizontal en el celular.
  preload(COVER.img, { as: "image", fetchPriority: "high", imageSrcSet: COVER.srcSet, imageSizes: "(max-aspect-ratio: 16/9) 178vh, 100vw", media: "(min-width: 901px)" });
  preload(COVER.mobileImg, { as: "image", fetchPriority: "high", imageSrcSet: COVER.mobile, imageSizes: "120vw", media: "(max-width: 900px)" });

  useEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const photo = q(".va-photo")[0] as HTMLElement;
    const img = q(".va-photo img")[0] as HTMLElement;
    const frame = q(".va-frame")[0] as HTMLElement;

    // Escritorio: la foto termina a pantalla completa. Celular: termina en un retrato a todo el ancho
    // (a pantalla completa quedaba una tira vertical muy alta).
    const mobile = () => window.matchMedia("(max-width: 900px)").matches;
    const endBox = () => {
      if (!mobile()) return { t: 0, b: 0 };
      // De arriba (deja lugar al logo) hasta justo encima del pie de portada: un retrato ~2:3, sin huecos.
      const h = el.getBoundingClientRect().height;
      const foot = (q(".va-hero-foot")[0] as HTMLElement).offsetTop;
      const top = Math.max(56, foot - 16 - el.clientWidth * 1.6);
      return { t: (top / h) * 100, b: ((h - (foot - 16)) / h) * 100 };
    };

    /*
     * Sin reflow: la foto tiene siempre el tamaño de la caja final y no se re-encuadra en cada cuadro
     * (antes la caja cambiaba de tamaño con top/left/…, el navegador la redondeaba al píxel y la foto temblaba).
     * Ahora la caja que se ve es un recorte (clip-path) y la foto se acerca/aleja con transform, en la GPU.
     * B: la caja visible en % de la portada; zs/zi: el zoom extra del scroll y de la entrada.
     */
    const B = { t: 30, r: 40, b: 30, l: 40, zs: 1, zi: 1 };
    let W = 1, H = 1, E = { x: 0, y: 0, w: 1, h: 1 };
    const measure = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      const e = endBox();
      E = { x: 0, y: (e.t / 100) * H, w: W, h: H * (1 - (e.t + e.b) / 100) };
      img.style.top = `${E.y}px`;
      img.style.height = `${E.h}px`;
    };
    const render = () => {
      const bx = (B.l / 100) * W, by = (B.t / 100) * H;
      const bw = W * (1 - (B.l + B.r) / 100), bh = H * (1 - (B.t + B.b) / 100);
      const sc = Math.max(bw / E.w, bh / E.h) * B.zs * B.zi;
      const dx = bx + bw / 2 - (E.x + E.w / 2), dy = by + bh / 2 - (E.y + E.h / 2);
      img.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${sc.toFixed(5)})`;
      photo.style.clipPath = `inset(${B.t.toFixed(3)}% ${B.r.toFixed(3)}% ${B.b.toFixed(3)}% ${B.l.toFixed(3)}%)`;
    };

    // Posición del marco en % de la portada (se recalcula al cambiar el tamaño).
    const inset = () => {
      const h = el.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      return {
        t: ((f.top - h.top) / h.height) * 100,
        r: ((h.right - f.right) / h.width) * 100,
        b: ((h.bottom - f.bottom) / h.height) * 100,
        l: ((f.left - h.left) / h.width) * 100,
      };
    };
    const place = () => {
      measure();
      Object.assign(B, inset());
      render();
    };
    place();

    if (reducedMotion()) {
      // Sin recorrido: queda la composición del marco, quieta.
      const ro = new ResizeObserver(place);
      ro.observe(el);
      return () => ro.disconnect();
    }

    let stopWaiting = () => {};
    const onRefresh = () => {
      measure();
      render();
    };
    ScrollTrigger.addEventListener("refreshInit", measure);
    ScrollTrigger.addEventListener("refresh", onRefresh);
    const ctx = gsap.context(() => {
      const open = { t: () => endBox().t, r: 0, b: () => endBox().b, l: 0 };
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "+=130%", scrub: 0.7, pin: true, refreshPriority: 2, invalidateOnRefresh: true },
      });
      tl.fromTo(B, { ...inset() }, { ...open, duration: 1, ease: "power2.inOut", onUpdate: render }, 0)
        .fromTo(B, { zs: 1.12 }, { zs: 1, duration: 1, ease: "none", onUpdate: render }, 0)
        .to(q(".va-word-l"), { xPercent: -70, opacity: 0, duration: 0.8, ease: "power2.in" }, 0)
        .to(q(".va-word-r"), { xPercent: 70, opacity: 0, duration: 0.8, ease: "power2.in" }, 0)
        .to(q(".va-hero-foot"), { color: () => (mobile() ? "#1a1c1f" : "#e9e7e2"), borderColor: () => (mobile() ? "#1a1c1f" : "rgba(233,231,226,.6)"), duration: 0.3 }, 0.6)
        .to(q(".va-photo-shade"), { opacity: () => (mobile() ? 0 : 1), duration: 0.4 }, 0.6)
        .to({}, { duration: 0.25 });

      // Entrada: el marco se abre desde una línea horizontal (el "tajo") y las palabras suben.
      // Queda en pausa detrás de la pantalla de carga y arranca cuando el telón sube.
      const f = inset();
      const intro = gsap.timeline({ paused: true });
      intro
        .fromTo(B, { t: 50, b: 50, l: f.l, r: f.r }, { ...f, duration: 1.4, ease: "expo.inOut", onUpdate: render }, 0)
        .fromTo(B, { zi: 1.35 }, { zi: 1, duration: 2, ease: "expo.out", onUpdate: render }, 0)
        .from(q(".va-word span"), { yPercent: 105, duration: 1.2, ease: "expo.out", stagger: 0.12 }, 0.15)
        .from(q(".va-hero-foot > *"), { opacity: 0, y: 10, duration: 0.8, stagger: 0.08 }, 0.8);
      stopWaiting = onReady(() => intro.play());
    }, el);
    render();
    return () => {
      stopWaiting();
      ScrollTrigger.removeEventListener("refreshInit", measure);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      ctx.revert();
    };
  }, []);

  return (
    <header ref={root} className="va-hero" id="inicio">
      <div className="va-photo">
        <picture>
          {/* Celular: el recuadro final es vertical, así que baja el recorte vertical (mucho más liviano que la horizontal en 4K) */}
          <source media="(max-width: 900px)" srcSet={COVER.mobile} sizes="120vw" />
          <img src={COVER.img} srcSet={COVER.srcSet} sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" alt={COVER.alt} width={COVER.w} height={COVER.h} fetchPriority="high" />
        </picture>
      </div>
      <div className="va-photo-shade" />
      <div className="va-frame" aria-hidden />
      <p className="va-word va-word-l" aria-hidden>
        <span>Gitano</span>
      </p>
      <p className="va-word va-word-r" aria-hidden>
        <span>Studio</span>
      </p>
      <div className="va-hero-foot">
        <h1>Barbería de autor en Mérida, Yucatán</h1>
        <a href="#cortes">Mira el trabajo&nbsp;↓</a>
      </div>
    </header>
  );
}
