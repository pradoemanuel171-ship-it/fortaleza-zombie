# Fortaleza – World App Mini App (World ID gated)

**Puntos clave**
- Sin Prisma. Supabase directo (`SUPABASE_SERVICE_ROLE` en rutas de API servidor).
- Gating fuerte: fuera de World App se muestra pantalla de bloqueo.
- Autenticación con **World ID (IDKit)**. Tras verificar, se guarda **cookie cifrada (HS256)** y no vuelve a pedir dentro de la miniapp.
- Demo de economía: comprar base → genera Orbix por segundo con tope diario. Recolectar acredita en BD.

## Variables de entorno
Crea en Vercel (o `.env.local`):
```
APP_SECRET=...cadena-larga...
SUPABASE_URL=https://XXXXXXXX.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOi...
WORLD_ID_APP_ID=app_staging_xxxxx
WORLD_ID_ACTION=orbix_login
```

## Tablas en Supabase
Ejecuta en el SQL editor de Supabase el archivo `db/migrations/001_init.sql`.

## Arranque local
```
npm i
npm run dev
```

## Deploy en Vercel
Sube todo este repo. No hay `postinstall` pesados.
