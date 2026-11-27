// Variables y bindings del Worker (wrangler.jsonc + .dev.vars / secretos de Cloudflare).
interface CloudflareEnv {
  DB: D1Database;
  ASSETS: Fetcher;
  PANEL_PASSWORD?: string;
  SESSION_SECRET?: string;
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  NOTIFY_EMAIL?: string;
  SITE_URL?: string;
}
