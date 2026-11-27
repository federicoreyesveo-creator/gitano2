import { getDB, ReservasOff, type Service } from "@/lib/reservas/db";
import { availability } from "@/lib/reservas/slots";

export const dynamic = "force-dynamic";

/** GET ?servicio=corte → los próximos días con sus horarios libres. */
export async function GET(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("servicio") ?? "";
    const db = await getDB();
    const svc = await db.prepare("SELECT * FROM services WHERE id = ? AND active = 1").bind(id).first<Service>();
    if (!svc) return Response.json({ error: "Servicio no encontrado" }, { status: 404 });
    return Response.json({ days: await availability(db, svc.duration) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return Response.json({ error: e instanceof ReservasOff ? "off" : "Error" }, { status: 503 });
  }
}
