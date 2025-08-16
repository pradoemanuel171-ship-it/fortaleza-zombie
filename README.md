## Setup rápido (Supabase + Vercel)
1. Copiá de Supabase:
   - `DATABASE_URL` (pooled/6543 + `?pgbouncer=true&connection_limit=1`)
   - `DIRECT_DATABASE_URL` (directa/5432)
2. En Vercel agrega:
   - `DATABASE_URL`, `DIRECT_DATABASE_URL`, `APP_SECRET`
   - `NEXT_PUBLIC_WLD_APP_ID`, `NEXT_PUBLIC_TREASURY_ADDRESS`
   - `PAYMENTS_DEMO=1`
3. Local:
   ```bash
   npm i
   npx prisma generate
   npx prisma db push
   npm run dev
   ```
4. Deploy. Abrí desde World App para pasar el gate.
