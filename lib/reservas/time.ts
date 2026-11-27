// Fechas y horas en Mérida. Todo se maneja como texto local 'YYYY-MM-DD' y minutos desde las 00:00.
export const TZ = "America/Merida";

export const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const pad = (n: number) => String(n).padStart(2, "0");

/** Fecha y minuto actuales en Mérida. */
export function nowLocal(): { date: string; min: number } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, min: Number(get("hour")) * 60 + Number(get("minute")) };
}

export const isDate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + "T00:00:00Z"));
export const isTime = (s: unknown): s is string => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
export const fmtMin = (min: number) => `${Math.floor(min / 60)}:${pad(min % 60)}`;
export const hhmm = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
export const stamp = (date: string, min: number) => `${date}T${hhmm(min)}`;
export const splitStamp = (s: string) => ({ date: s.slice(0, 10), min: toMin(s.slice(11, 16)) });

const utc = (date: string) => new Date(date + "T12:00:00Z");
export const dow = (date: string) => utc(date).getUTCDay();
export function addDays(date: string, n: number) {
  const d = utc(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** "Martes 3 de diciembre" */
export function fmtDate(date: string) {
  const d = utc(date);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}
/** "Mar 3 dic" */
export function fmtDateShort(date: string) {
  const d = utc(date);
  return `${DAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}
