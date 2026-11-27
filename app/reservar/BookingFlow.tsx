"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DAYS_SHORT, MONTHS_SHORT, fmtDate, fmtMin, toMin } from "@/lib/reservas/time";
import type { Day } from "@/lib/reservas/slots";

export type PublicService = { id: string; grp: string; name: string; note: string | null; price: number; duration: number };

const dur = (m: number) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60}` : `${m / 60} h`);
const dayParts = (date: string) => {
  const d = new Date(date + "T12:00:00Z");
  return { dow: DAYS_SHORT[d.getUTCDay()], n: d.getUTCDate(), mon: MONTHS_SHORT[d.getUTCMonth()] };
};

/** Reserva en cuatro bloques: servicio, día, hora y datos. Cada uno aparece cuando el anterior está elegido. */
export default function BookingFlow({ services, whatsapp }: { services: PublicService[]; whatsapp: string }) {
  const router = useRouter();
  const [svc, setSvc] = useState<PublicService | null>(null);
  const [days, setDays] = useState<Day[] | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dayRef = useRef<HTMLElement>(null);
  const timeRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const groups = useMemo(() => {
    const m = new Map<string, PublicService[]>();
    for (const s of services) m.set(s.grp, [...(m.get(s.grp) ?? []), s]);
    return [...m];
  }, [services]);

  async function load(s: PublicService, keepDate?: string | null) {
    setDays(null);
    setLoadErr(false);
    try {
      const r = await fetch(`/api/reservas/disponibilidad?servicio=${encodeURIComponent(s.id)}`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      const j = (await r.json()) as { days: Day[] };
      setDays(j.days);
      const still = keepDate && j.days.find((d) => d.date === keepDate && d.slots.length);
      setDate(still ? keepDate! : j.days.find((d) => d.slots.length)?.date ?? null);
    } catch {
      setLoadErr(true);
    }
  }

  function pickService(s: PublicService) {
    setSvc(s);
    setTime(null);
    setError(null);
    load(s, date);
  }

  // Lleva la vista al bloque siguiente cuando aparece.
  const scrollTo = (el: HTMLElement | null) => el && requestAnimationFrame(() => el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  useEffect(() => { if (svc) scrollTo(dayRef.current); }, [svc]);
  useEffect(() => { if (time) scrollTo(formRef.current); }, [time]);

  const day = days?.find((d) => d.date === date);
  const morning = day?.slots.filter((t) => toMin(t) < 14 * 60) ?? [];
  const afternoon = day?.slots.filter((t) => toMin(t) >= 14 * 60) ?? [];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!svc || !date || !time || sending) return;
    const f = new FormData(e.currentTarget);
    setSending(true);
    setError(null);
    try {
      const r = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicio: svc.id, fecha: date, hora: time, nombre: f.get("nombre"), telefono: f.get("telefono"), email: f.get("email"), nota: f.get("nota"), web: f.get("web") }),
      });
      const j = (await r.json()) as { token?: string; error?: string };
      if (!r.ok || !j.token) {
        setError(j.error ?? "No se pudo reservar. Intenta de nuevo.");
        if (r.status === 409) {
          setTime(null);
          load(svc, date);
        }
        setSending(false);
        return;
      }
      router.push(`/reserva/${j.token}?nueva=1`);
    } catch {
      setError("Sin conexión. Revisa tu internet e intenta de nuevo.");
      setSending(false);
    }
  }

  const ready = !!(svc && date && time);

  return (
    <>
      {/* Servicio */}
      <section className="bk-step" aria-labelledby="bk-s1">
        <h2 id="bk-s1" className="bk-step-title">Servicio</h2>
        <div className="bk-svc-groups">
          {groups.map(([g, items]) => (
            <div key={g} className="bk-svc-group">
              <h3>{g}</h3>
              <ul>
                {items.map((s) => (
                  <li key={s.id}>
                    <button type="button" className={`bk-svc ${svc?.id === s.id ? "is-on" : ""}`} aria-pressed={svc?.id === s.id} onClick={() => pickService(s)}>
                      <span className="bk-svc-name">
                        {s.name}
                        {s.note && <small>{s.note}</small>}
                      </span>
                      <span className="bk-svc-meta">
                        <span className="bk-mono">{dur(s.duration)}</span>
                        <span className="bk-svc-price">${s.price}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Día */}
      {svc && (
        <section className="bk-step" ref={dayRef} aria-labelledby="bk-s2">
          <h2 id="bk-s2" className="bk-step-title">Día</h2>
          {loadErr ? (
            <p className="bk-note">
              No pudimos cargar la agenda.{" "}
              <button type="button" className="bk-inline" onClick={() => load(svc, date)}>Reintentar</button>
            </p>
          ) : !days ? (
            <div className="bk-days" aria-hidden>
              {Array.from({ length: 10 }, (_, i) => <span key={i} className="bk-day is-skel" />)}
            </div>
          ) : (
            <div className="bk-days" role="listbox" aria-label="Días disponibles">
              {days.map((d) => {
                const p = dayParts(d.date);
                const off = !d.slots.length;
                return (
                  <button
                    key={d.date}
                    type="button"
                    role="option"
                    aria-selected={date === d.date}
                    disabled={off}
                    className={`bk-day ${date === d.date ? "is-on" : ""}`}
                    onClick={() => { setDate(d.date); setTime(null); scrollTo(timeRef.current); }}
                    aria-label={`${fmtDate(d.date)}${off ? (d.open ? ", sin horarios libres" : ", cerrado") : ""}`}
                  >
                    <span className="bk-mono">{p.dow}</span>
                    <strong>{p.n}</strong>
                    <span className="bk-mono">{off ? (d.open ? "sin horas" : "cerrado") : p.mon}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Hora */}
      {svc && days && (
        <section className="bk-step" ref={timeRef} aria-labelledby="bk-s3">
          <h2 id="bk-s3" className="bk-step-title">Hora</h2>
          {!day || !day.slots.length ? (
            <p className="bk-note">
              No quedan horarios para los próximos días. Escríbenos y te hacemos un hueco:{" "}
              <a className="bk-inline" href={whatsapp} target="_blank" rel="noopener">WhatsApp</a>
            </p>
          ) : (
            <>
              <p className="bk-when">{fmtDate(day.date)}</p>
              {[["Mañana", morning], ["Tarde", afternoon]].map(([label, list]) =>
                (list as string[]).length ? (
                  <div className="bk-times-group" key={label as string}>
                    <h3>{label as string}</h3>
                    <div className="bk-times">
                      {(list as string[]).map((t) => (
                        <button key={t} type="button" className={`bk-time ${time === t ? "is-on" : ""}`} aria-pressed={time === t} onClick={() => setTime(t)}>
                          {fmtMin(toMin(t))}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </>
          )}
        </section>
      )}

      {/* Datos */}
      {ready && (
        <section className="bk-step" ref={formRef} aria-labelledby="bk-s4">
          <h2 id="bk-s4" className="bk-step-title">Tus datos</h2>
          <form className="bk-form" onSubmit={submit} noValidate={false}>
            <div className="bk-field">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" autoComplete="name" required minLength={2} maxLength={80} />
            </div>
            <div className="bk-field">
              <label htmlFor="telefono">WhatsApp</label>
              <input id="telefono" name="telefono" type="tel" inputMode="tel" autoComplete="tel-national" required pattern="[\d\s()+-]{10,16}" />
              <p className="bk-help">10 dígitos. Por aquí te confirmamos o avisamos si algo cambia.</p>
            </div>
            <div className="bk-field">
              <label htmlFor="email">Email <span>(opcional)</span></label>
              <input id="email" name="email" type="email" autoComplete="email" maxLength={120} />
              <p className="bk-help">Te mandamos la confirmación y el link para cancelar.</p>
            </div>
            <div className="bk-field bk-field-wide">
              <label htmlFor="nota">¿Algo que debamos saber? <span>(opcional)</span></label>
              <textarea id="nota" name="nota" rows={3} maxLength={500} placeholder="Por ejemplo: traigo foto de referencia." />
            </div>
            <div className="bk-trap" aria-hidden>
              <label htmlFor="web">No llenar</label>
              <input id="web" name="web" tabIndex={-1} autoComplete="off" />
            </div>
            {error && <p className="bk-error" role="alert">{error}</p>}
            <div className="bk-confirm">
              <dl>
                <div><dt>Servicio</dt><dd>{svc!.name}</dd></div>
                <div><dt>Cuándo</dt><dd>{fmtDate(date!)}, {fmtMin(toMin(time!))}</dd></div>
                <div><dt>Total</dt><dd>${svc!.price} MXN · pagas en el estudio</dd></div>
              </dl>
              <button className="bk-btn" type="submit" disabled={sending}>
                {sending ? "Apartando…" : "Confirmar cita"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Resumen fijo abajo, como la botonera del sitio */}
      <div className={`bk-bar ${svc && !time ? "is-on" : ""}`} aria-hidden={!svc || !!time}>
        <span>{svc?.name}</span>
        <span className="bk-bar-hint">{date ? `${dayParts(date).dow} ${dayParts(date).n} · elige hora` : "Elige día"}</span>
        <span className="bk-bar-price">{svc ? `$${svc.price}` : ""}</span>
      </div>
    </>
  );
}
