import { requireSession } from "@/lib/reservas/auth";
import { getDB, listServices } from "@/lib/reservas/db";
import { addService, saveServices } from "../../actions";

type Props = { searchParams: Promise<{ ok?: string; err?: string }> };

export default async function Servicios({ searchParams }: Props) {
  await requireSession();
  const q = await searchParams;
  const services = await listServices(await getDB(), false);
  const groups = [...new Set(services.map((s) => s.grp))];

  return (
    <main className="pn-main">
      <div className="pn-top">
        <h1 className="pn-day-title">Servicios</h1>
      </div>
      <p className="pn-intro">Lo que cambies aquí se ve al momento en la página de reservas. La duración define cuánto tiempo ocupa cada cita en tu agenda.</p>
      {q.ok && <p className="pn-flash" role="status">{q.ok}</p>}
      {q.err && <p className="pn-flash is-err" role="alert">{q.err}</p>}

      <form action={saveServices}>
        <div className="pn-table">
          {services.map((s) => (
            <div key={s.id} className={`pn-table-row ${s.active ? "" : "is-off"}`}>
              <input type="hidden" name="id" value={s.id} />
              <div className="bk-field">
                <label htmlFor={`n-${s.id}`}>{s.grp}</label>
                <input id={`n-${s.id}`} name={`name_${s.id}`} defaultValue={s.name} required />
              </div>
              <div className="bk-field">
                <label htmlFor={`p-${s.id}`}>Precio $</label>
                <input id={`p-${s.id}`} name={`price_${s.id}`} type="number" min={0} step={10} defaultValue={s.price} required />
              </div>
              <div className="bk-field">
                <label htmlFor={`d-${s.id}`}>Minutos</label>
                <input id={`d-${s.id}`} name={`duration_${s.id}`} type="number" min={5} max={480} step={5} defaultValue={s.duration} required />
              </div>
              <label className="pn-check">
                <input type="checkbox" name={`active_${s.id}`} defaultChecked={!!s.active} /> Se reserva
              </label>
              <span />
            </div>
          ))}
        </div>
        <button className="bk-btn pn-save" type="submit">Guardar cambios</button>
      </form>

      <section className="bk-step">
        <h2 className="bk-step-title">Nuevo servicio</h2>
        <form action={addService} className="pn-table">
          <div className="pn-table-row">
            <div className="bk-field">
              <label htmlFor="ns-name">Nombre</label>
              <input id="ns-name" name="name" required />
            </div>
            <div className="bk-field">
              <label htmlFor="ns-price">Precio $</label>
              <input id="ns-price" name="price" type="number" min={0} step={10} required />
            </div>
            <div className="bk-field">
              <label htmlFor="ns-dur">Minutos</label>
              <input id="ns-dur" name="duration" type="number" min={5} max={480} step={5} defaultValue={30} required />
            </div>
            <div className="bk-field">
              <label htmlFor="ns-grp">Grupo</label>
              <select id="ns-grp" name="grp">
                {groups.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <button className="bk-btn" type="submit">Agregar</button>
          </div>
          <div className="bk-field" style={{ paddingTop: 14 }}>
            <label htmlFor="ns-note">Descripción corta (opcional)</label>
            <input id="ns-note" name="note" maxLength={120} />
          </div>
        </form>
      </section>
    </main>
  );
}
