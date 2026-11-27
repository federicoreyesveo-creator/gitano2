import { requireSession } from "@/lib/reservas/auth";
import { getDB, listHours, type Block } from "@/lib/reservas/db";
import { DAYS, fmtDateShort, fmtMin, hhmm, nowLocal, splitStamp } from "@/lib/reservas/time";
import { removeBlock, saveHours } from "../../actions";

type Props = { searchParams: Promise<{ ok?: string; err?: string }> };
const ORDER = [2, 3, 4, 5, 6, 0, 1];

export default async function Horario({ searchParams }: Props) {
  await requireSession();
  const q = await searchParams;
  const db = await getDB();
  const now = nowLocal();
  const [hours, blocks] = await Promise.all([
    listHours(db),
    db.prepare("SELECT * FROM blocks WHERE end_at >= ? ORDER BY start_at LIMIT 50").bind(`${now.date}T00:00`).all<Block>(),
  ]);

  return (
    <main className="pn-main">
      <div className="pn-top">
        <h1 className="pn-day-title">Horario</h1>
      </div>
      <p className="pn-intro">Los días y horas en que se puede reservar en línea. Para un día puntual (vacaciones, un trámite) usa “Bloquear horario” en la agenda.</p>
      {q.ok && <p className="pn-flash" role="status">{q.ok}</p>}
      {q.err && <p className="pn-flash is-err" role="alert">{q.err}</p>}

      <form action={saveHours}>
        <div className="pn-table">
          {ORDER.map((d) => {
            const h = hours[d];
            return (
              <div key={d} className="pn-hours-row">
                <strong>{DAYS[d]}</strong>
                <label className="pn-check">
                  <input type="checkbox" name={`open_${d}`} defaultChecked={!!h} /> Abre
                </label>
                <div className="bk-field">
                  <label htmlFor={`f-${d}`}>Desde</label>
                  <input id={`f-${d}`} name={`from_${d}`} type="time" step={900} defaultValue={hhmm(h?.open_min ?? 600)} />
                </div>
                <div className="bk-field">
                  <label htmlFor={`t-${d}`}>Hasta</label>
                  <input id={`t-${d}`} name={`to_${d}`} type="time" step={900} defaultValue={hhmm(h?.close_min ?? 1170)} />
                </div>
                <span />
              </div>
            );
          })}
        </div>
        <button className="bk-btn pn-save" type="submit">Guardar horario</button>
      </form>

      <section className="bk-step">
        <h2 className="bk-step-title">Bloqueos próximos</h2>
        <div className="pn-list" style={{ borderTop: 0 }}>
          {blocks.results.length === 0 && (
            <div className="pn-empty">
              <p>Nada bloqueado.</p>
              <p>Los bloqueos se agregan desde la agenda, en el día que quieras cerrar.</p>
            </div>
          )}
          {blocks.results.map((k) => {
            const a = splitStamp(k.start_at);
            const b = splitStamp(k.end_at);
            const allDay = a.min === 0 && b.min === 1439;
            return (
              <article key={k.id} className="pn-item is-block">
                <p className="pn-item-time">
                  {fmtDateShort(a.date)}
                  <small>{allDay ? "todo el día" : `${fmtMin(a.min)} a ${fmtMin(b.min)}`}</small>
                </p>
                <div>
                  <p className="pn-item-name">Bloqueado</p>
                  {k.reason && <p className="pn-item-meta">{k.reason}</p>}
                </div>
                <form action={removeBlock} className="pn-item-actions">
                  <input type="hidden" name="id" value={k.id} />
                  <input type="hidden" name="volver" value="horario" />
                  <button className="pn-chip" type="submit">Quitar</button>
                </form>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
