import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Las reservas viven en Cloudflare D1. Fuera de Cloudflare (o sin base configurada) se apagan solas. */
export class ReservasOff extends Error {
  constructor() {
    super("Reservas no configuradas");
  }
}

export async function getEnv(): Promise<CloudflareEnv> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as CloudflareEnv;
  } catch {
    throw new ReservasOff();
  }
}

export async function getDB(): Promise<D1Database> {
  const env = await getEnv();
  if (!env.DB) throw new ReservasOff();
  return env.DB;
}

export type Service = { id: string; grp: string; name: string; note: string | null; price: number; duration: number; active: number; sort: number };
export type Hours = { dow: number; open_min: number; close_min: number };
export type Block = { id: number; start_at: string; end_at: string; reason: string | null };
export type Status = "confirmada" | "atendida" | "no_vino" | "cancelada";
export type Booking = {
  id: string; token: string; service_id: string; service_name: string; price: number;
  start_at: string; end_at: string; name: string; phone: string; email: string | null; notes: string | null;
  status: Status; source: "web" | "panel"; created_at: string; cancelled_at: string | null;
};

export async function listServices(db: D1Database, onlyActive = true) {
  const sql = `SELECT * FROM services ${onlyActive ? "WHERE active = 1" : ""} ORDER BY sort, name`;
  return (await db.prepare(sql).all<Service>()).results;
}

export async function listHours(db: D1Database) {
  const rows = (await db.prepare("SELECT * FROM hours").all<Hours>()).results;
  const map: Record<number, Hours | undefined> = {};
  for (const r of rows) map[r.dow] = r;
  return map;
}

/** Turnos activos y bloqueos que tocan el rango [from, to). */
export async function listBusy(db: D1Database, from: string, to: string) {
  const [b, k] = await db.batch([
    db.prepare("SELECT start_at, end_at FROM bookings WHERE status != 'cancelada' AND start_at < ?2 AND end_at > ?1").bind(from, to),
    db.prepare("SELECT start_at, end_at FROM blocks WHERE start_at < ?2 AND end_at > ?1").bind(from, to),
  ]);
  return [...(b.results as { start_at: string; end_at: string }[]), ...(k.results as { start_at: string; end_at: string }[])];
}

export const randomToken = (bytes = 18) => {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...a)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
