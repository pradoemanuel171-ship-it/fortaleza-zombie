
# Fortaleza — Demo sin DB (World App WebView Ready)

**Qué incluye**
- Next.js 14 + App Router + TypeScript
- TailwindCSS (estilo oscuro minimalista)
- Barra inferior con pestañas activas (resaltado)
- Flujo de Saqueo:
  - Coste dinámico (1.5% de tus Obrix; min 25, máx 250)
  - Rival 100% aleatorio (bots simulados)
  - 3 skips; si los agotas, pierdes el coste y empieza cooldown
  - Minijuego "Círculo Perfecto" con 2 oportunidades (hit/miss)
  - Cooldown global 5 min tras atacar; 30 min contra mismo objetivo (simulable luego)
- API stateless (sin base de datos): estado firmado en cookie HTTP-only
- Listo para Vercel (funciona en WebView de World App)

## Variables de entorno (opcional)
- `APP_SECRET` — secret para firmar el estado (si no, usa uno dev).
- `NEXT_PUBLIC_WLD_APP_ID` — tu APP_ID de Worldcoin (para checks/telemetría futura).

## Scripts
```bash
npm i
npm run dev
```
Abre http://localhost:3000

## Endpoints
- `GET /api/status` — estado actual.
- `POST /api/collect` — recolectar producción (ya se acumula en cada request).
- `POST /api/rival` — inicia un saqueo (cobra coste) y devuelve objetivo.
- `POST /api/skip` — consume un skip; al 3º finaliza como fallo y empieza cooldown.
- `POST /api/attack` — resuelve con resultado `hit|miss` (desde el círculo).

## Nota
Esto es **demo de pruebas**: no guarda datos persistentes y todos los rivales son bots simulados.
