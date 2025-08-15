
# Fortaleza — Mini App demo (World App WebView ready)

Incluye:
- Next.js 14, Tailwind, TypeScript
- Autologin con World App (MiniKit) + SIWE server-side
- Seguridad: JWT de sesión httpOnly, CSRF, runtime Node.js en API
- i18n ES/EN (autodetección + selector)
- Flujo de saqueo: coste 1.5%, 3 skips, círculo (2 chances), cooldown 5 min, bots
- Sin DB (estado firmado en cookie). Luego se migra a Postgres.

## Env vars (Vercel)
- NEXT_PUBLIC_WLD_APP_ID=app_0b2177978f881d03251605b2f6dde563
- APP_SECRET=F0rTaLeZa_2025_OBRIX!x7Rj9QkV2pLm

## Scripts
npm i
npm run dev
