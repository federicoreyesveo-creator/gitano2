# Reservas propias de Gitano Studio

Reemplazo de Fresha que vive dentro del sitio. Corre en **Cloudflare Workers** (plan gratis) con la base **D1**.

| Dirección | Quién la usa | Qué hace |
|---|---|---|
| `/reservar` | Clientes | Eligen servicio, día y hora, y dejan nombre y WhatsApp |
| `/reserva/<código>` | Cliente | Ve su cita, la agrega al calendario o la cancela (hasta 2 h antes) |
| `/panel` | Gitano | Agenda del día y la semana, agregar citas a mano, bloquear horarios, marcar atendida o no vino, WhatsApp al cliente |
| `/panel/servicios` | Gitano | Precios, duraciones, qué se reserva en línea, servicios nuevos |
| `/panel/horario` | Gitano | Días y horas de atención; lista de bloqueos |

Reglas (en `lib/reservas/config.ts`): horarios cada 30 min, 1 h mínima de anticipación, hasta 30 días adelante.
Dos personas no pueden quedarse con el mismo horario: lo frena la base de datos.

## Desarrollo local

```bash
cp .dev.vars.example .dev.vars        # clave del panel y secreto de sesión
npm run db:local                      # crea la base local con servicios y horario
echo NEXT_PUBLIC_RESERVAS=on > .env.local   # los botones "Agendar" van a /reservar
npm run dev                           # http://localhost:3101/reservar y /panel
```

## Publicar en Cloudflare (una sola vez)

1. Crear cuenta en Cloudflare y `npx wrangler login`.
2. `npx wrangler d1 create gitano-reservas` y pegar el `database_id` en `wrangler.jsonc`.
3. `npm run db:remote` (crea las tablas y carga servicios y horario).
4. Secretos: `npx wrangler secret put PANEL_PASSWORD` y `npx wrangler secret put SESSION_SECRET`
   (opcional: `RESEND_API_KEY`, `MAIL_FROM`, `NOTIFY_EMAIL`, `SITE_URL`).
5. Conectar el repo en Cloudflare → Workers → Builds, con
   build `npx opennextjs-cloudflare build`, deploy `npx opennextjs-cloudflare deploy`
   y la variable de build `NEXT_PUBLIC_RESERVAS=on`.
6. Apuntar el dominio al Worker.

Sin `NEXT_PUBLIC_RESERVAS=on`, los botones del sitio siguen yendo a Fresha. Así se puede publicar sin apuro.
