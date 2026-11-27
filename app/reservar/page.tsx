import type { Metadata } from "next";
import "../reservas.css";
import BookingFlow from "./BookingFlow";
import BkHeader from "@/components/reservas/BkHeader";
import { FRESHA_URL, WHATSAPP_URL } from "@/lib/data";
import { getDB, listServices, ReservasOff } from "@/lib/reservas/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda tu cita | Gitano Studio · Barbería en Mérida",
  description: "Elige servicio, día y hora, y aparta tu lugar en Gitano Studio, barbería de autor en Mérida. Pagas en el estudio.",
  alternates: { canonical: "/reservar" },
};

export default async function Reservar() {
  let services: Awaited<ReturnType<typeof listServices>> | null = null;
  try {
    services = await listServices(await getDB());
  } catch (e) {
    if (!(e instanceof ReservasOff)) throw e;
  }

  return (
    <div className="bk">
      <BkHeader />
      <main className="bk-main">
        <h1 className="bk-giant">Aparta tu lugar.</h1>
        <p className="bk-lead">Una cabeza a la vez, con cita. Eliges, confirmas y pagas en el estudio.</p>

        {services ? (
          <BookingFlow services={services.map(({ id, grp, name, note, price, duration }) => ({ id, grp, name, note, price, duration }))} whatsapp={WHATSAPP_URL} />
        ) : (
          // Sin base de datos (por ejemplo, fuera de Cloudflare) se sigue agendando como antes.
          <section className="bk-step">
            <p className="bk-note">La agenda en línea se está actualizando. Mientras, aparta tu lugar por aquí:</p>
            <div className="bk-actions">
              <a className="bk-btn" href={FRESHA_URL} target="_blank" rel="noopener">Agendar en línea</a>
              <a className="bk-inline" href={WHATSAPP_URL} target="_blank" rel="noopener">WhatsApp</a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
