import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "../../reservas.css";
import BkHeader from "@/components/reservas/BkHeader";
import { hasSession } from "@/lib/reservas/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel | Gitano Studio", robots: { index: false, follow: false } };

export default async function Entrar() {
  if (await hasSession()) redirect("/panel");
  return (
    <div className="bk">
      <BkHeader />
      <main className="pn-login">
        <div className="pn-login-card">
          <h1>Tu agenda.</h1>
          <p className="bk-lead">Entra con la clave del estudio.</p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
