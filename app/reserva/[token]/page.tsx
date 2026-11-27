import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import "../../reservas.css";
import BkHeader from "@/components/reservas/BkHeader";
import { ArrowOut } from "@/components/ArrowOut";
import { ADDRESS, MAPS_URL, WHATSAPP_URL } from "@/lib/data";
import { getByToken } from "@/lib/reservas/bookings";
import { CANCEL_NOTICE } from "@/lib/reservas/config";
import { getDB } from "@/lib/reservas/db";
import { notifyStudio } from "@/lib/reservas/email";
import { fmtDate, fmtMin, nowLocal, splitStamp, stamp } from "@/lib/reservas/time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tu cita | Gitano Studio", robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ nueva?: string }> };

/** Horas de Mérida → UTC para Google Calendar (Mérida es UTC-6 todo el año). */
const gcal = (s: string) => {
  const d = new Date(s + ":00-06:00");
  return d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
};

function canCancel(start: string) {
  const now = nowLocal();
  const limit = splitStamp(start);
  return stamp(now.date, now.min + CANCEL_NOTICE) <= stamp(limit.date, limit.min);
}

async function cancel(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  const db = await getDB();
  const b = await getByToken(db, token);
  if (!b || b.status !== "confirmada" || !canCancel(b.start_at)) redirect(`/reserva/${token}`);
  await db.prepare("UPDATE bookings SET status = 'cancelada', cancelled_at = datetime('now') WHERE token = ? AND status = 'confirmada'").bind(token).run();
  await notifyStudio(b, "cancelada");
  redirect(`/reserva/${token}`);
}

export default async function Reserva({ params, searchParams }: Props) {
  const { token } = await params;
  const { nueva } = await searchParams;
  const b = await getByToken(await getDB(), token);
  if (!b) notFound();

  const s = splitStamp(b.start_at);
  const e = splitStamp(b.end_at);
  const cancelled = b.status === "cancelada";
  const past = b.start_at < stamp(nowLocal().date, nowLocal().min);
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${b.service_name} · Gitano Studio`)}&dates=${gcal(b.start_at)}/${gcal(b.end_at)}&location=${encodeURIComponent(`Gitano Studio, ${ADDRESS.line1}, ${ADDRESS.line2}`)}&details=${encodeURIComponent("Pagas en el estudio. ¿Cambios? WhatsApp 999 453 3474.")}`;

  return (
    <div className="bk">
      <BkHeader />
      <main className="bk-main bk-ticket-wrap">
        <h1 className="bk-giant">{cancelled ? "Cancelada." : nueva ? "Ya quedó." : "Tu cita."}</h1>
        <p className="bk-lead">
          {cancelled
            ? "Esta cita se canceló. Cuando quieras, apartas otra."
            : nueva
              ? `Te esperamos, ${b.name.split(" ")[0]}. Guarda esta página: desde aquí puedes ver o cancelar tu cita.`
              : `Hola, ${b.name.split(" ")[0]}. Estos son los datos de tu cita.`}
        </p>

        <article className={`bk-ticket ${cancelled ? "is-off" : ""}`}>
          <p className="bk-ticket-svc">{b.service_name}</p>
          <p className="bk-ticket-when">
            {fmtDate(s.date)}
            <br />
            {fmtMin(s.min)} a {fmtMin(e.min)}
          </p>
          <dl>
            <div><dt>Dónde</dt><dd>{ADDRESS.line1}, {ADDRESS.line2}</dd></div>
            <div><dt>Total</dt><dd>${b.price} MXN · pagas en el estudio</dd></div>
            <div><dt>A nombre de</dt><dd>{b.name}</dd></div>
          </dl>
        </article>

        {!cancelled && !past && (
          <div className="bk-actions">
            <a className="bk-btn" href={`/reserva/${b.token}/calendario`}>Agregar al calendario</a>
            <a className="bk-inline" href={calUrl} target="_blank" rel="noopener">Google Calendar <ArrowOut /></a>
            <a className="bk-inline" href={MAPS_URL} target="_blank" rel="noopener">Cómo llegar <ArrowOut /></a>
            <a className="bk-inline" href={WHATSAPP_URL} target="_blank" rel="noopener">WhatsApp <ArrowOut /></a>
          </div>
        )}

        {cancelled && (
          <div className="bk-actions">
            <a className="bk-btn" href="/reservar">Apartar otra cita</a>
          </div>
        )}

        {!cancelled && !past && (
          <details className="bk-cancel">
            <summary>¿No puedes venir?</summary>
            {canCancel(b.start_at) ? (
              <form action={cancel}>
                <input type="hidden" name="token" value={b.token} />
                <p>Si cancelas, el horario queda libre para alguien más. No hay cargo.</p>
                <button className="bk-btn bk-btn-line" type="submit">Sí, cancelar mi cita</button>
              </form>
            ) : (
              <p>
                Faltan menos de {CANCEL_NOTICE / 60} horas. Para cancelar o mover la cita, escríbenos por{" "}
                <a className="bk-inline" href={WHATSAPP_URL} target="_blank" rel="noopener">WhatsApp</a>.
              </p>
            )}
          </details>
        )}
      </main>
    </div>
  );
}
