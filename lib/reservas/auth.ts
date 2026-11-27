import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getEnv } from "./db";

// Sesión del panel: una cookie firmada con HMAC (sin base de usuarios: hay una sola clave, la de Gitano).
const COOKIE = "gitano_panel";
const DAYS = 30;

const enc = new TextEncoder();
async function key(secret: string) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}
async function sign(value: string, secret: string) {
  const sig = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
/** Compara sin cortar en el primer carácter distinto. */
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function secrets() {
  const env = await getEnv();
  const password = env.PANEL_PASSWORD || process.env.PANEL_PASSWORD;
  const secret = env.SESSION_SECRET || process.env.SESSION_SECRET;
  if (!password || !secret) throw new Error("Faltan PANEL_PASSWORD y SESSION_SECRET");
  return { password, secret };
}

export async function checkPassword(input: string) {
  const { password } = await secrets();
  return same(input, password);
}

export async function startSession() {
  const { secret } = await secrets();
  const exp = String(Date.now() + DAYS * 864e5);
  (await cookies()).set(COOKIE, `${exp}.${await sign(exp, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function hasSession() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const { secret } = await secrets();
  return same(sig, await sign(exp, secret));
}

/** Para cada página y acción del panel. */
export async function requireSession() {
  if (!(await hasSession())) redirect("/panel/entrar");
}
