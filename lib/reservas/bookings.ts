import { randomToken, type Booking, type Service } from "./db";
import { isBookable } from "./slots";
import { stamp, toMin } from "./time";

const TAKEN = "Ese horario se acaba de ocupar. Elige otro.";

export type NewBooking = { serviceId: string; date: string; time: string; name: string; phone: string; email?: string; notes?: string };
export type CreateResult = { ok: true; booking: Booking } | { ok: false; error: string; taken?: boolean };

/** Solo dígitos; acepta 10 dígitos (México) o con lada 52. */
export function cleanPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return d;
  if (d.length === 12 && d.startsWith("52")) return d.slice(2);
  if (d.length === 13 && d.startsWith("521")) return d.slice(3);
  return null;
}
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
export const fmtPhone = (p: string) => (p.length === 10 ? `${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6)}` : p);
export const waLink = (phone: string, text: string) => `https://wa.me/52${phone}?text=${encodeURIComponent(text)}`;

/**
 * Crea un turno. El INSERT solo entra si no hay otro turno ni bloqueo encimado:
 * D1 ejecuta cada sentencia de forma atómica, así que dos personas no pueden quedarse con el mismo horario.
 */
export async function createBooking(db: D1Database, input: NewBooking, opts: { source: "web" | "panel" }): Promise<CreateResult> {
  const name = input.name.trim().slice(0, 80);
  const phone = cleanPhone(input.phone);
  const email = input.email?.trim().slice(0, 120) || null;
  const notes = input.notes?.trim().slice(0, 500) || null;
  if (name.length < 2) return { ok: false, error: "Escribe tu nombre." };
  if (!phone) return { ok: false, error: "Revisa el número de WhatsApp: son 10 dígitos." };
  if (email && !isEmail(email)) return { ok: false, error: "Revisa el email." };

  const svc = await db.prepare("SELECT * FROM services WHERE id = ? AND active = 1").bind(input.serviceId).first<Service>();
  if (!svc) return { ok: false, error: "Ese servicio ya no está disponible." };

  if (opts.source === "web" && !(await isBookable(db, input.date, input.time, svc.duration))) {
    return { ok: false, error: TAKEN, taken: true };
  }

  const start = stamp(input.date, toMin(input.time));
  const end = stamp(input.date, toMin(input.time) + svc.duration);
  const id = crypto.randomUUID();
  const token = randomToken();

  const res = await db
    .prepare(
      `INSERT INTO bookings (id, token, service_id, service_name, price, start_at, end_at, name, phone, email, notes, source)
       SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12
       WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE status != 'cancelada' AND start_at < ?7 AND end_at > ?6)
         AND NOT EXISTS (SELECT 1 FROM blocks WHERE start_at < ?7 AND end_at > ?6)`,
    )
    .bind(id, token, svc.id, svc.name, svc.price, start, end, name, phone, email, notes, opts.source)
    .run();

  if (!res.meta.changes) return { ok: false, error: TAKEN, taken: true };
  const booking = await db.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first<Booking>();
  return { ok: true, booking: booking! };
}

export const getByToken = (db: D1Database, token: string) => db.prepare("SELECT * FROM bookings WHERE token = ?").bind(token).first<Booking>();
