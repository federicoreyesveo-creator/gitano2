import Link from "next/link";
import { requireSession } from "@/lib/reservas/auth";
import { fmtPhone, waLink } from "@/lib/reservas/bookings";
import { getDB, listHours, listServices, type Block, type Booking } from "@/lib/reservas/db";
import { daySlots } from "@/lib/reservas/slots";
import { DAYS, DAYS_SHORT, addDays, dow, fmtDate, fmtMin, isDate, nowLocal, splitStamp } from "@/lib/reservas/time";
import { addBlock, addBooking, removeBlock, setStatus } from "../actions";

type Props = { searchParams: Promise<{ dia?: string; ok?: string; err?: string }> };

const STATUS_LABEL: Record<string, string> = { atendida: "Atendida", no_vino: "No vino", cancelada: "Cancelada" };

export default async function Agenda({ searchParams }: Props) {
  await requireSession();
  const q = await searchParams;
  const now = nowLocal();
  const date = isDate(q.dia) ? q.dia : now.date;
  const db = await getDB();

  // Semana que contiene el día elegido, de martes a lunes (como abre el estudio).
  const weekStart = addDays(date, -((dow(date) + 5) % 7));
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const [bookingsRes, blocksRes, weekCount, hours, services] = await Promise.all([
    db.prepare("SELECT * FROM bookings WHERE start_at >= ?1 AND start_at < ?2 ORDER BY start_at").bind(`${date}T00:00`, `${addDays(date, 1)}T00:00`).all<Booking>(),
    db.prepare("SELECT * FROM blocks WHERE start_at < ?2 AND end_at > ?1 ORDER BY start_at").bind(`${date}T00:00`, `${date}T23:59`).all<Block>(),
    db
      .prepare("SELECT substr(start_at, 1, 10) AS d, COUNT(*) AS n FROM bookings WHERE status != 'cancelada' AND start_at >= ?1 AND start_at < ?2 GROUP BY d")
      .bind(`${weekStart}T00:00`, `${addDays(weekStart, 7)}T00:00`)
      .all<{ d: string; n: number }>(),
    listHours(db),
    listServices(db),
  ]);
  const bookings = bookingsRes.results;
  const blocks = blocksRes.results;
  const counts = Object.fromEntries(weekCount.results.map((r) => [r.d, r.n]));
  const h = hours[dow(date)];

  const active = bookings.filter((b) => b.status !== "cancelada");
  const total = active.filter((b) => b.status !== "no_vino").reduce((a, b) => a + b.price, 0);
  const free = h ? daySlots(date, 30, h, [...active, ...blocks], date === now.date ? now : { date: "0000-00-00", min: 0 }).length : 0;

  type Row = { at: string; kind: "booking"; b: Booking } | { at: string; kind: "block"; k: Block };
  const rows: Row[] = [...bookings.map((b) => ({ at: b.start_at, kind: "booking" as const, b })), ...blocks.map((k) => ({ at: k.start_at < `${date}T00:00` ? `${date}T00:00` : k.start_at, kind: "block" as const, k }))].sort((a, b) => a.at.localeCompare(b.at));

  const isToday = date === now.date;

  return (
    <main className="pn-main">
      <div className="pn-top">
        <h1 className="pn-day-title">
          <small>{isToday ? "Hoy" : date === addDays(now.date, 1) ? "Mañana" : DAYS[dow(date)]}{h ? ` · ${fmtMin(h.open_min)} a ${fmtMin(h.close_min)}` : ""}</small>
          {fmtDate(date).replace(/^\S+ /, "")}
        </h1>
        <nav className="pn-daynav" aria-label="Cambiar de día">
          <Link href={`/panel?dia=${addDays(date, -1)}`} aria-label="Día anterior">←</Link>
          {!isToday && <Link href="/panel">Hoy</Link>}
          <Link href={`/panel?dia=${addDays(date, 1)}`} aria-label="Día siguiente">→</Link>
        </nav>
      </div>

      <nav className="pn-week" aria-label="Semana">
        {week.map((d) => {
          const n = counts[d] ?? 0;
          const closed = !hours[dow(d)];
          return (
            <Link key={d} href={`/panel?dia=${d}`} className={`${d === date ? "is-on" : ""} ${d === now.date ? "is-today" : ""} ${closed ? "is-closed" : ""}`} aria-current={d === date ? "date" : undefined}>
              <span className="bk-mono">{DAYS_SHORT[dow(d)]}</span>
              <strong>{Number(d.slice(8))}</strong>
              <span className="bk-mono pn-wk-l">{closed ? "Cerrado" : n ? `${n} cita${n > 1 ? "s" : ""}` : "Libre"}</span>
              <span className="bk-mono pn-wk-s" aria-hidden>{closed ? "-" : n}</span>
            </Link>
          );
        })}
      </nav>

      {q.ok && <p className="pn-flash" role="status">{q.ok}</p>}
      {q.err && <p className="pn-flash is-err" role="alert">{q.err}</p>}

      <div className="pn-stats">
        <div className="pn-stat"><span className="pn-label">Citas</span><strong>{active.length}</strong></div>
        <div className="pn-stat"><span className="pn-label">Total del día</span><strong>${total.toLocaleString("es-MX")}</strong></div>
        <div className="pn-stat"><span className="pn-label">Libres</span><strong>{h ? free : "Cerrado"}</strong></div>
      </div>

      <div className="pn-grid">
        <section className="pn-list" aria-label="Citas del día">
          {rows.length === 0 && (
            <div className="pn-empty">
              <p>{h ? "Sin citas todavía." : "Cerrado."}</p>
              <p>{h ? "Cuando alguien reserve en el sitio, aparece aquí. También puedes agregar una a mano." : "Este día el estudio no abre. Cambia el horario en Horario."}</p>
            </div>
          )}
          {rows.map((r) =>
            r.kind === "block" ? (
              <article key={`k${r.k.id}`} className="pn-item is-block">
                <p className="pn-item-time">
                  {r.k.start_at.endsWith("00:00") && r.k.end_at.endsWith("23:59") ? "Todo" : fmtMin(splitStamp(r.k.start_at).min)}
                  <small>{r.k.end_at.endsWith("23:59") ? "el día" : `a ${fmtMin(splitStamp(r.k.end_at).min)}`}</small>
                </p>
                <div>
                  <p className="pn-item-name">Bloqueado</p>
                  {r.k.reason && <p className="pn-item-meta">{r.k.reason}</p>}
                </div>
                <form action={removeBlock} className="pn-item-actions">
                  <input type="hidden" name="id" value={r.k.id} />
                  <input type="hidden" name="dia" value={date} />
                  <button className="pn-chip" type="submit">Quitar bloqueo</button>
                </form>
              </article>
            ) : (
              <BookingRow key={r.b.id} b={r.b} date={date} />
            ),
          )}
        </section>

        <aside className="pn-side">
          <details className="pn-box" open={rows.length === 0 && !!h}>
            <summary>Agregar cita</summary>
            <form action={addBooking}>
              <div className="bk-field">
                <label htmlFor="ab-servicio">Servicio</label>
                <select id="ab-servicio" name="servicio" required>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} · {s.duration} min · ${s.price}</option>
                  ))}
                </select>
              </div>
              <div className="pn-row2">
                <div className="bk-field">
                  <label htmlFor="ab-fecha">Día</label>
                  <input id="ab-fecha" name="fecha" type="date" defaultValue={date} required />
                </div>
                <div className="bk-field">
                  <label htmlFor="ab-hora">Hora</label>
                  <input id="ab-hora" name="hora" type="time" step={900} required />
                </div>
              </div>
              <div className="bk-field">
                <label htmlFor="ab-nombre">Nombre</label>
                <input id="ab-nombre" name="nombre" required minLength={2} />
              </div>
              <div className="bk-field">
                <label htmlFor="ab-tel">WhatsApp</label>
                <input id="ab-tel" name="telefono" type="tel" inputMode="tel" required />
              </div>
              <div className="bk-field">
                <label htmlFor="ab-nota">Nota</label>
                <input id="ab-nota" name="nota" />
              </div>
              <button className="bk-btn" type="submit">Agregar</button>
            </form>
          </details>

          <details className="pn-box">
            <summary>Bloquear horario</summary>
            <form action={addBlock}>
              <div className="bk-field">
                <label htmlFor="bl-fecha">Día</label>
                <input id="bl-fecha" name="fecha" type="date" defaultValue={date} required />
              </div>
              <div className="pn-row2">
                <div className="bk-field">
                  <label htmlFor="bl-desde">Desde</label>
                  <input id="bl-desde" name="desde" type="time" step={900} defaultValue="14:00" />
                </div>
                <div className="bk-field">
                  <label htmlFor="bl-hasta">Hasta</label>
                  <input id="bl-hasta" name="hasta" type="time" step={900} defaultValue="15:00" />
                </div>
              </div>
              <label className="pn-check">
                <input type="checkbox" name="todo" /> Todo el día
              </label>
              <div className="bk-field">
                <label htmlFor="bl-motivo">Motivo (solo lo ves tú)</label>
                <input id="bl-motivo" name="motivo" placeholder="Comida, trámite, vacaciones" />
              </div>
              <button className="bk-btn" type="submit">Bloquear</button>
            </form>
          </details>
        </aside>
      </div>
    </main>
  );
}

function BookingRow({ b, date }: { b: Booking; date: string }) {
  const s = splitStamp(b.start_at);
  const e = splitStamp(b.end_at);
  const first = b.name.split(" ")[0];
  const reminder = `Hola, ${first}. Te esperamos ${fmtDate(s.date).toLowerCase()} a las ${fmtMin(s.min)} en Gitano Studio para tu ${b.service_name.toLowerCase()}. ¿Nos confirmas?`;
  const Status = ({ to, label, strong }: { to: string; label: string; strong?: boolean }) => (
    <form action={setStatus}>
      <input type="hidden" name="id" value={b.id} />
      <input type="hidden" name="dia" value={date} />
      <input type="hidden" name="status" value={to} />
      <button className={`pn-chip ${strong ? "is-strong" : ""}`} type="submit">{label}</button>
    </form>
  );
  return (
    <article className={`pn-item is-${b.status}`}>
      <p className="pn-item-time">
        {fmtMin(s.min)}
        <small>a {fmtMin(e.min)}</small>
      </p>
      <div>
        <p className="pn-item-name">
          {b.name}
          {STATUS_LABEL[b.status] && <span className="pn-badge">{STATUS_LABEL[b.status]}</span>}
        </p>
        <p className="pn-item-meta">
          {b.service_name} · ${b.price}
          <br />
          {fmtPhone(b.phone)}
          {b.email ? ` · ${b.email}` : ""} · {b.source === "web" ? "Reservó en el sitio" : "Agregada a mano"}
        </p>
        {b.notes && <p className="pn-item-note">{b.notes}</p>}
      </div>
      <div className="pn-item-actions">
        {b.status === "confirmada" ? (
          <>
            <a className="pn-chip is-strong" href={waLink(b.phone, reminder)} target="_blank" rel="noopener">WhatsApp</a>
            <a className="pn-chip" href={`tel:+52${b.phone}`}>Llamar</a>
            <Status to="atendida" label="Atendida" />
            <Status to="no_vino" label="No vino" />
            <Status to="cancelada" label="Cancelar" />
          </>
        ) : (
          <Status to="confirmada" label={b.status === "cancelada" ? "Reactivar" : "Deshacer"} />
        )}
      </div>
    </article>
  );
}
