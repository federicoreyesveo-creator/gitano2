import { createBooking } from "@/lib/reservas/bookings";
import { getDB, ReservasOff } from "@/lib/reservas/db";
import { notifyStudio, sendConfirmation } from "@/lib/reservas/email";
import { isDate, isTime } from "@/lib/reservas/time";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

/** POST { servicio, fecha, hora, nombre, telefono, email?, nota?, web? } → { token } */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : "");
  // Campo trampa: los bots lo llenan, las personas no lo ven.
  if (str("web")) return Response.json({ error: "No se pudo reservar." }, { status: 400 });
  if (!isDate(body.fecha) || !isTime(body.hora)) return Response.json({ error: "Elige día y hora." }, { status: 400 });

  try {
    const db = await getDB();
    const res = await createBooking(
      db,
      { serviceId: str("servicio"), date: body.fecha, time: body.hora, name: str("nombre"), phone: str("telefono"), email: str("email"), notes: str("nota") },
      { source: "web" },
    );
    if (!res.ok) return Response.json({ error: res.error }, { status: res.taken ? 409 : 400 });
    // Los emails salen después de responder, para que el cliente no espere.
    const mails = Promise.all([sendConfirmation(res.booking), notifyStudio(res.booking, "nueva")]);
    try {
      getCloudflareContext().ctx.waitUntil(mails);
    } catch {
      await mails;
    }
    return Response.json({ token: res.booking.token });
  } catch (e) {
    return Response.json({ error: e instanceof ReservasOff ? "Las reservas en línea no están activas." : "No se pudo reservar. Intenta de nuevo." }, { status: 503 });
  }
}
