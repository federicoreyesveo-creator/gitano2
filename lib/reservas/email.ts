import { ADDRESS, PHONE } from "@/lib/data";
import { getEnv, type Booking } from "./db";
import { fmtPhone } from "./bookings";
import { fmtDate, fmtMin, splitStamp } from "./time";

// Emails con Resend (gratis hasta 3.000 al mes). Sin RESEND_API_KEY no se manda nada y la reserva sigue igual.
async function send(to: string, subject: string, text: string) {
  const env = await getEnv();
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.MAIL_FROM, to, subject, text }),
    });
  } catch {
    // Un email que no sale no debe tumbar la reserva.
  }
}

const when = (b: Booking) => {
  const s = splitStamp(b.start_at);
  return `${fmtDate(s.date)}, ${fmtMin(s.min)}`;
};

export async function siteUrl() {
  const env = await getEnv();
  return (env.SITE_URL || "").replace(/\/$/, "");
}

export async function sendConfirmation(b: Booking) {
  if (!b.email) return;
  const link = `${await siteUrl()}/reserva/${b.token}`;
  await send(
    b.email,
    `Tu cita en Gitano Studio: ${when(b)}`,
    [
      `Hola, ${b.name}. Ya quedó tu cita.`,
      ``,
      `${b.service_name} · $${b.price} MXN`,
      `${when(b)}`,
      `${ADDRESS.line1}, ${ADDRESS.line2}`,
      ``,
      `Para ver, agregar a tu calendario o cancelar tu cita: ${link}`,
      ``,
      `¿Dudas? WhatsApp ${PHONE}.`,
      `Gitano Studio · Haz tuyo tu estilo.`,
    ].join("\n"),
  );
}

export async function notifyStudio(b: Booking, kind: "nueva" | "cancelada") {
  const env = await getEnv();
  if (!env.NOTIFY_EMAIL) return;
  await send(
    env.NOTIFY_EMAIL,
    `${kind === "nueva" ? "Nueva cita" : "Cita cancelada"}: ${b.name}, ${when(b)}`,
    [`${b.service_name} · $${b.price}`, when(b), `${b.name} · ${fmtPhone(b.phone)}${b.email ? ` · ${b.email}` : ""}`, b.notes ? `Nota: ${b.notes}` : "", ``, `${await siteUrl()}/panel`]
      .filter(Boolean)
      .join("\n"),
  );
}
