"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, endSession, requireSession, startSession } from "@/lib/reservas/auth";
import { createBooking } from "@/lib/reservas/bookings";
import { getDB, type Status } from "@/lib/reservas/db";
import { isDate, isTime, stamp, toMin } from "@/lib/reservas/time";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const back = (date: string, msg?: { ok?: string; err?: string }) => {
  const q = new URLSearchParams();
  if (isDate(date)) q.set("dia", date);
  if (msg?.ok) q.set("ok", msg.ok);
  if (msg?.err) q.set("err", msg.err);
  redirect(`/panel${q.size ? `?${q}` : ""}`);
};

/* Sesión */
export async function login(_: { error?: string } | undefined, f: FormData) {
  if (!(await checkPassword(s(f, "clave")))) return { error: "Clave incorrecta." };
  await startSession();
  redirect("/panel");
}
export async function logout() {
  await endSession();
  redirect("/panel/entrar");
}

/* Turnos */
const STATUSES: Status[] = ["confirmada", "atendida", "no_vino", "cancelada"];
export async function setStatus(f: FormData) {
  await requireSession();
  const status = s(f, "status") as Status;
  if (!STATUSES.includes(status)) back(s(f, "dia"));
  // Al reactivar una cancelada, solo si su horario sigue libre.
  const res = await (await getDB())
    .prepare(
      `UPDATE bookings SET status = ?1, cancelled_at = CASE WHEN ?1 = 'cancelada' THEN datetime('now') ELSE NULL END
       WHERE id = ?2 AND NOT (status = 'cancelada' AND ?1 != 'cancelada' AND EXISTS (
         SELECT 1 FROM bookings o WHERE o.id != bookings.id AND o.status != 'cancelada' AND o.start_at < bookings.end_at AND o.end_at > bookings.start_at))`,
    )
    .bind(status, s(f, "id"))
    .run();
  revalidatePath("/panel");
  back(s(f, "dia"), res.meta.changes ? undefined : { err: "Ese horario ya lo tiene otra cita." });
}

export async function addBooking(f: FormData) {
  await requireSession();
  const date = s(f, "fecha");
  const time = s(f, "hora");
  if (!isDate(date) || !isTime(time)) back(date, { err: "Elige día y hora." });
  const res = await createBooking(
    await getDB(),
    { serviceId: s(f, "servicio"), date, time, name: s(f, "nombre"), phone: s(f, "telefono"), email: s(f, "email"), notes: s(f, "nota") },
    { source: "panel" },
  );
  if (!res.ok) back(date, { err: res.taken ? "Ya hay una cita o un bloqueo en ese horario." : res.error });
  revalidatePath("/panel");
  back(date, { ok: "Cita agregada." });
}

/* Bloqueos */
export async function addBlock(f: FormData) {
  await requireSession();
  const date = s(f, "fecha");
  const allDay = f.get("todo") === "on";
  const from = allDay ? "00:00" : s(f, "desde");
  const to = allDay ? "23:59" : s(f, "hasta");
  if (!isDate(date) || !isTime(from) || !isTime(to) || toMin(to) <= toMin(from)) back(date, { err: "Revisa el horario a bloquear." });
  await (await getDB())
    .prepare("INSERT INTO blocks (start_at, end_at, reason) VALUES (?, ?, ?)")
    .bind(stamp(date, toMin(from)), stamp(date, toMin(to)), s(f, "motivo").slice(0, 80) || null)
    .run();
  revalidatePath("/panel");
  back(date, { ok: "Horario bloqueado." });
}

export async function removeBlock(f: FormData) {
  await requireSession();
  await (await getDB()).prepare("DELETE FROM blocks WHERE id = ?").bind(Number(s(f, "id"))).run();
  revalidatePath("/panel");
  const to = s(f, "volver");
  if (to === "horario") redirect("/panel/horario?ok=Bloqueo+quitado");
  back(s(f, "dia"), { ok: "Bloqueo quitado." });
}

/* Servicios */
export async function saveServices(f: FormData) {
  await requireSession();
  const db = await getDB();
  const ids = f.getAll("id").map(String);
  const stmts = ids.flatMap((id) => {
    const name = s(f, `name_${id}`);
    const price = Math.round(Number(s(f, `price_${id}`)));
    const duration = Math.round(Number(s(f, `duration_${id}`)));
    if (!name || !Number.isFinite(price) || price < 0 || !Number.isFinite(duration) || duration < 5 || duration > 480) return [];
    return [db.prepare("UPDATE services SET name = ?, price = ?, duration = ?, active = ? WHERE id = ?").bind(name, price, duration, f.get(`active_${id}`) === "on" ? 1 : 0, id)];
  });
  if (stmts.length) await db.batch(stmts);
  revalidatePath("/panel/servicios");
  revalidatePath("/reservar");
  redirect("/panel/servicios?ok=Servicios+guardados");
}

export async function addService(f: FormData) {
  await requireSession();
  const name = s(f, "name");
  const price = Math.round(Number(s(f, "price")));
  const duration = Math.round(Number(s(f, "duration")));
  if (!name || !(price >= 0) || !(duration >= 5)) redirect("/panel/servicios?err=Revisa+nombre,+precio+y+duración");
  const id = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || crypto.randomUUID().slice(0, 8);
  const db = await getDB();
  const max = await db.prepare("SELECT COALESCE(MAX(sort), 0) AS m FROM services").first<{ m: number }>();
  const res = await db
    .prepare("INSERT OR IGNORE INTO services (id, grp, name, note, price, duration, sort) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, s(f, "grp") || "Detalles", name, s(f, "note") || null, price, duration, (max?.m ?? 0) + 1)
    .run();
  revalidatePath("/panel/servicios");
  redirect(res.meta.changes ? "/panel/servicios?ok=Servicio+agregado" : "/panel/servicios?err=Ya+existe+un+servicio+con+ese+nombre");
}

/* Horario semanal */
export async function saveHours(f: FormData) {
  await requireSession();
  const db = await getDB();
  const stmts: D1PreparedStatement[] = [db.prepare("DELETE FROM hours")];
  for (let d = 0; d < 7; d++) {
    if (f.get(`open_${d}`) !== "on") continue;
    const a = s(f, `from_${d}`);
    const b = s(f, `to_${d}`);
    if (!isTime(a) || !isTime(b) || toMin(b) <= toMin(a)) redirect("/panel/horario?err=Revisa+los+horarios");
    stmts.push(db.prepare("INSERT INTO hours (dow, open_min, close_min) VALUES (?, ?, ?)").bind(d, toMin(a), toMin(b)));
  }
  await db.batch(stmts);
  revalidatePath("/panel/horario");
  redirect("/panel/horario?ok=Horario+guardado");
}
