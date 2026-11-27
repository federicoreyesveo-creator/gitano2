"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action}>
      <div className="bk-field">
        <label htmlFor="clave">Clave</label>
        <input id="clave" name="clave" type="password" autoComplete="current-password" required autoFocus />
      </div>
      {state?.error && <p className="bk-error" role="alert">{state.error}</p>}
      <button className="bk-btn" type="submit" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
