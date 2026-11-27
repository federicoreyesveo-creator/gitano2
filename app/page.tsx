import type { Metadata } from "next";
import "./site.css";
import Motion from "@/components/Motion";
import Dock from "@/components/Dock";
import NavLogo from "@/components/NavLogo";
import Loader from "@/components/Loader";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Cuts from "@/components/Cuts";
import Author from "@/components/Author";
import Band from "@/components/Band";
import Reviews from "@/components/Reviews";
import { ArrowOut } from "@/components/ArrowOut";
import { ADDRESS, FAQS, BOOK_LINK, HOURS, INSTAGRAM_URL, MAPS_EMBED, MAPS_URL, SERVICES, SITE_URL, WHATSAPP_URL, COVER } from "@/lib/data";
import { businessLd, faqLd } from "@/lib/seo";

/*
  Gitano Studio v2 · "Bloque"
  Blanco y negro duro de afiche; el color lo ponen las fotos.
  Titulares en Archivo expandida 900. Botones cuadrados. Botonera fija abajo.
  SEO: cada sección tiene un H2 descriptivo (chico) y la palabra grande es solo gráfica.
*/

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const ORDER = [2, 3, 4, 5, 6, 0, 1];
const fmt = (h: number) => `${Math.floor(h)}:${h % 1 ? "30" : "00"}`;
const d = (s: number) => ({ ["--d" as string]: `${s}s` });
const jsonLd = businessLd({ url: SITE_URL, image: `${SITE_URL}${COVER.img}`, logo: `${SITE_URL}/icon.png` });

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <div className="va">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Motion />
      <Loader />
      <NavLogo />
      <Dock />

      <main>
        <Hero />
        <Manifesto />
        <Cuts />
        <Band />

        <Author />
        <Reviews />

        {/* Servicios */}
        <section className="va-services" id="servicios">
          <h2 className="va-h2" data-reveal>
            Servicios y precios de barbería en Mérida
          </h2>
          <p className="va-giant" data-reveal aria-hidden>
            Hazlo tuyo.
          </p>
          <p className="va-sub" data-reveal>
            Precios claros, en pesos y sin letras chiquitas. Pagas en el estudio.
          </p>
          {SERVICES.map((g) => (
            <div className="va-svc-group" key={g.title} data-reveal>
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((s) => (
                  <li key={s.id}>
                    <span className="va-svc-name">
                      {s.name}
                      {s.note && <small>{s.note}</small>}
                    </span>
                    <span className="va-svc-price">{s.price === null ? "Incluida" : `$${s.price}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="va-svc-foot">
            <p>Precios en MXN · Pagas en el estudio · Agenda en línea o por WhatsApp.</p>
            <a className="va-btn" {...BOOK_LINK}>
              Aparta tu lugar&nbsp;→
            </a>
          </div>
        </section>

        {/* Preguntas: las respuestas siempre están en el HTML (SEO y buscadores con IA) */}
        <section className="va-faq" id="preguntas">
          <h2 className="va-h2" data-reveal>
            Preguntas frecuentes sobre Gitano Studio
          </h2>
          <p className="va-giant" data-reveal aria-hidden>
            Preguntas
          </p>
          <p className="va-sub" data-reveal>
            Lo que nos preguntan antes de sentarse.
          </p>
          <div className="va-faq-list">
            {FAQS.map((f, i) => (
              <details key={f.q} open={i === 0} data-reveal style={d(Math.min(i, 5) * 0.05)}>
                <summary>
                  <h3>{f.q}</h3>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Visita */}
        <section className="va-visit" id="visita">
          <div className="va-visit-info">
            <h2 className="va-h2" data-reveal>
              Visita · Gitano Studio, Mérida
            </h2>
            <p className="va-giant" data-reveal aria-hidden>
              Aquí te esperamos.
            </p>
            <p className="va-addr" data-reveal>
              Calle 31, Circuito Colonias, México Oriente, 97125 Mérida, Yuc.
            </p>
            <dl data-reveal>
              {ORDER.map((day) => (
                <div key={day}>
                  <dt>{DAYS[day]}</dt>
                  <dd>{HOURS[day] ? `${fmt(HOURS[day]![0])} – ${fmt(HOURS[day]![1])}` : "Cerrado"}</dd>
                </div>
              ))}
            </dl>
            <div className="va-visit-actions">
              <a className="va-btn" {...BOOK_LINK}>
                Aparta tu lugar&nbsp;→
              </a>
              <a className="va-link" href={MAPS_URL} target="_blank" rel="noopener">
                Cómo llegar <ArrowOut />
              </a>
              <a className="va-link" href={WHATSAPP_URL} target="_blank" rel="noopener">
                WhatsApp <ArrowOut />
              </a>
              <a className="va-link" href={INSTAGRAM_URL} target="_blank" rel="noopener">
                Instagram <ArrowOut />
              </a>
            </div>
          </div>
          <div className="va-map">
            <iframe src={MAPS_EMBED} title="Mapa: Gitano Studio, Calle 31, Mérida" loading="lazy" />
          </div>
        </section>
      </main>

      <footer className="va-foot">
        <div className="va-foot-grid">
          <div className="va-foot-col">
            <p className="va-foot-label">Estudio</p>
            <p>
              {ADDRESS.line1}
              <br />
              {ADDRESS.line2}
              <br />
              Mar–Sáb 10:00–19:30 · Dom 12:00–18:00
            </p>
          </div>
          <a className="va-foot-mark" href="#inicio" aria-label="Volver al inicio">
            <img src="/img/carita-200.webp" alt="" width={200} height={188} loading="lazy" />
          </a>
          <div className="va-foot-col va-foot-col-r">
            <p className="va-foot-label">Contacto</p>
            <ul className="va-foot-links">
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener">WhatsApp</a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener">Instagram @gitano.studio</a>
              </li>
              <li>
                <a {...BOOK_LINK}>Aparta tu lugar</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="va-foot-word" aria-hidden>
          <span>Gitano</span> <span>Studio</span>
        </p>
        <div className="va-foot-row">
          <p className="va-foot-entity">Haz tuyo tu estilo.</p>
          <p>
            © 2026 ·{" "}
            <a href="https://www.almabruta.studio" target="_blank" rel="noopener">
              Diseñado por Alma Bruta
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
