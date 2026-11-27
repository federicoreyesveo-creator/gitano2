import { MAX_DAYS, MIN_NOTICE, SLOT_STEP } from "./config";
import { addDays, dow, hhmm, nowLocal, stamp } from "./time";
import { listBusy, listHours, type Hours } from "./db";

type Busy = { start_at: string; end_at: string };
export type Day = { date: string; open: boolean; slots: string[] };

/** Horarios libres de un día para un servicio de `duration` minutos. Pura: no toca la base. */
export function daySlots(date: string, duration: number, hours: Hours | undefined, busy: Busy[], now = nowLocal()): string[] {
  if (!hours) return [];
  const out: string[] = [];
  const earliest = date === now.date ? now.min + MIN_NOTICE : date < now.date ? Infinity : -Infinity;
  for (let m = hours.open_min; m + duration <= hours.close_min; m += SLOT_STEP) {
    if (m < earliest) continue;
    const s = stamp(date, m);
    const e = stamp(date, m + duration);
    if (busy.some((b) => b.start_at < e && b.end_at > s)) continue;
    out.push(hhmm(m));
  }
  return out;
}

/** Los próximos MAX_DAYS días con sus horarios libres, en dos consultas. */
export async function availability(db: D1Database, duration: number): Promise<Day[]> {
  const now = nowLocal();
  const last = addDays(now.date, MAX_DAYS);
  const [hours, busy] = await Promise.all([listHours(db), listBusy(db, `${now.date}T00:00`, `${last}T23:59`)]);
  const days: Day[] = [];
  for (let i = 0; i <= MAX_DAYS; i++) {
    const date = addDays(now.date, i);
    const h = hours[dow(date)];
    days.push({ date, open: !!h, slots: daySlots(date, duration, h, busy, now) });
  }
  return days;
}

/** ¿Este horario sigue libre y dentro de las reglas de la reserva en línea? */
export async function isBookable(db: D1Database, date: string, time: string, duration: number) {
  const now = nowLocal();
  if (date < now.date || date > addDays(now.date, MAX_DAYS)) return false;
  const [hours, busy] = await Promise.all([listHours(db), listBusy(db, `${date}T00:00`, `${date}T23:59`)]);
  return daySlots(date, duration, hours[dow(date)], busy, now).includes(time);
}
