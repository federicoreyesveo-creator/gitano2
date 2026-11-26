import "./site.css";
import Motion from "@/components/Motion";
import Dock from "@/components/Dock";
import NavLogo from "@/components/NavLogo";
import Loader from "@/components/Loader";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Cuts from "@/components/Cuts";
import Author from "@/components/Author";
import { ADDRESS, FAQS, FRESHA_URL, GEO, HOURS, INSTAGRAM_URL, MAPS_EMBED, MAPS_URL, SERVICES, WHATSAPP_URL } from "@/lib/data";

/*
  Gitano Studio v2 · "Bloque"
  Blanco y negro duro de afiche; el color lo ponen las fotos.
  Titulares en Archivo expandida 900. Botones cuadrados. Botonera fija abajo.
*/

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const ORDER = [2, 3, 4, 5, 6, 0, 1];
const fmt = (h: number) => `${Math.floor(h)}:${h % 1 ? "30" : "00"}`;
const d = (s: number) => ({ ["--d" as string]: `${s}s` });

// Datos estructurados: negocio local + preguntas frecuentes (mismo texto que la sección visible).
const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hhmm = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${h % 1 ? "30" : "00"}`;
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BarberShop",
  name: "Gitano Studio",
  description: "Barbería de autor en Mérida, Yucatán.",
  address: { "@type": "PostalAddress", streetAddress: ADDRESS.line1, addressLocality: "Mérida", addressRegion: "Yucatán", addressCountry: "MX" },
  geo: { "@type": "GeoCoordinates", latitude: GEO.lat, longitude: GEO.lng },
  hasMap: MAPS_URL,
  openingHoursSpecification: Object.entries(HOURS)
    .filter(([, h]) => h)
    .map(([day, h]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAY[Number(day)], opens: hhmm(h![0]), closes: hhmm(h![1]) })),
  priceRange: "$80–$650 MXN",
  founder: { "@type": "Person", name: "Dayner", jobTitle: "Barbero" },
  sameAs: [INSTAGRAM_URL],
};
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

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

        <Author />

        {/* Servicios */}
        <section className="va-services" id="servicios">
          <h2 className="va-giant" data-reveal>
            Servicios
          </h2>
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
                    <span className="va-svc-price">${s.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="va-svc-foot">Precios en MXN · pago en el estudio</p>
        </section>

        {/* Preguntas: las respuestas siempre están en el HTML (SEO y buscadores con IA) */}
        <section className="va-faq" id="preguntas">
          <h2 className="va-giant" data-reveal>
            Preguntas
          </h2>
          <div className="va-faq-list">
            {FAQS.map((f, i) => (
              <details key={f.q} open={i === 0} data-reveal style={d(Math.min(i, 5) * 0.05)}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Visita */}
        <section className="va-visit" id="visita">
          <div className="va-visit-info">
            <h2 className="va-giant" data-reveal>
              Aquí
            </h2>
            <p className="va-addr" data-reveal>
              {ADDRESS.line1}, {ADDRESS.line2}
            </p>
            <dl data-reveal>
              {ORDER.map((day) => (
                <div key={day}>
                  <dt>{DAYS[day]}</dt>
                  <dd>{HOURS[day] ? `${fmt(HOURS[day]![0])} – ${fmt(HOURS[day]![1])}` : "Cerrado"}</dd>
                </div>
              ))}
            </dl>
            <a className="va-link" href={MAPS_URL} target="_blank" rel="noopener">
              Cómo llegar →
            </a>
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
              Mérida, Yucatán
            </p>
          </div>
          <a className="va-foot-mark" href="#inicio" aria-label="Volver al inicio">
            <img src="/img/carita.png" alt="" width={684} height={642} />
          </a>
          <div className="va-foot-col va-foot-col-r">
            <p className="va-foot-label">Contacto</p>
            <ul className="va-foot-links">
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener">Instagram</a>
              </li>
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener">WhatsApp</a>
              </li>
              <li>
                <a href={FRESHA_URL} target="_blank" rel="noopener">Agendar</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="va-foot-word" aria-hidden>
          <span>Gitano</span> <span>Studio</span>
        </p>
        <div className="va-foot-row">
          <span>Barbería de autor</span>
          <a href="https://www.almabruta.studio" target="_blank" rel="noopener">
            Diseñado por Alma Bruta
          </a>
        </div>
      </footer>
    </div>
  );
}
