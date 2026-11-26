"use client";

import { useState } from "react";
import { CUTS, FRESHA_URL } from "@/lib/data";

/**
 * Cortes como paneles: las seis fotos en fila, como tiras verticales que ocupan todo el ancho.
 * Pasar el mouse (o tocar) sobre una la abre y muestra el nombre, la técnica y el botón.
 * En celular las tiras se apilan y se abren hacia abajo.
 */
export default function Cuts() {
  const [on, setOn] = useState(0);

  return (
    <section className="va-cuts" id="cortes">
      <div className="va-cuts-head" data-reveal>
        <div>
          <h2 className="va-h2">Cortes de autor en Mérida</h2>
          <p className="va-cuts-word" aria-hidden>
            Cortes
          </p>
          <p className="va-cuts-copy">Fades, texturas, rizos y barba. Así se ve el oficio cuando nadie tiene prisa.</p>
        </div>
      </div>
      <div className="va-panels" data-reveal style={{ ["--d" as string]: ".1s" }}>
        {CUTS.map((c, i) => {
          const open = i === on;
          return (
            <div key={c.name} className={`va-panel ${open ? "is-on" : ""}`} onMouseEnter={() => setOn(i)}>
              <img src={c.img} alt={c.alt} width={1200} height={1600} />
              <button type="button" className="va-panel-hit" aria-expanded={open} aria-label={c.name} onClick={() => setOn(i)} onFocus={() => setOn(i)} />
              <span className="va-panel-tab" aria-hidden>
                {c.name}
              </span>
              <div className="va-panel-info" aria-hidden={!open}>
                <h3 className="va-panel-name">{c.name}</h3>
                <p className="va-panel-meta">
                  {c.technique} · {c.time}
                </p>
                <p className="va-panel-line">{c.line}</p>
                <a href={FRESHA_URL} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
                  Quiero algo así →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
