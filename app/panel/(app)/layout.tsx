import type { Metadata } from "next";
import "../../reservas.css";
import BkHeader from "@/components/reservas/BkHeader";
import { requireSession } from "@/lib/reservas/auth";
import { logout } from "../actions";
import PanelNav from "./PanelNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel | Gitano Studio", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return (
    <div className="bk pn">
      <BkHeader>
        <PanelNav />
        <form action={logout}>
          <button className="pn-out" type="submit">Salir</button>
        </form>
      </BkHeader>
      {children}
    </div>
  );
}
