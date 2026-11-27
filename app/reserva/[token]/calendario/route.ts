import { ADDRESS } from "@/lib/data";
import { getByToken } from "@/lib/reservas/bookings";
import { getDB } from "@/lib/reservas/db";

export const dynamic = "force-dynamic";

/** Archivo .ics: lo abren el calendario del iPhone, Android y Outlook. Hora fija de Mérida (UTC-6). */
const ics = (s: string) => new Date(s + ":00-06:00").toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
const esc = (s: string) => s.replace(/[\\,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const b = await getByToken(await getDB(), token);
  if (!b || b.status === "cancelada") return new Response("No encontrada", { status: 404 });
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gitano Studio//Reservas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.id}@gitanostudio`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${ics(b.start_at)}`,
    `DTEND:${ics(b.end_at)}`,
    `SUMMARY:${esc(`${b.service_name} · Gitano Studio`)}`,
    `LOCATION:${esc(`Gitano Studio, ${ADDRESS.line1}, ${ADDRESS.line2}`)}`,
    `DESCRIPTION:${esc(`$${b.price} MXN, pagas en el estudio.`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Cita en Gitano Studio",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="cita-gitano-studio.ics"' },
  });
}
