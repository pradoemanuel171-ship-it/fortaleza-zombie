// app/api/collect/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { getSettings } from '@/lib/settings'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const s = await requireSession()
    const settings = await getSettings()

    return await prisma.$transaction(async (tx) => {
      // Asegura que el estado (season + economyState) exista para el usuario
      const game = await import('@/lib/game')
      const { st } = await game.ensureState(s.userId)

      const fresh = await tx.economyState.findUnique({
        where: { userId_seasonId: { userId: st.userId, seasonId: st.seasonId } }
      })
      if (!fresh) throw new Error('state missing')
      if (!fresh.basePurchased) {
        return NextResponse.json({ error: 'no_base' }, { status: 400 })
      }

      // Calcula cuánto se generó desde la última recolección (usa tu lógica existente)
      const { calcPool } = game
      const { pool } = calcPool(fresh, settings) // se asume que devuelve un entero

      if (pool <= 0) {
        return NextResponse.json({ ok: true, added: 0, obrix: fresh.obrixTotal })
      }

      const now = new Date()
      const updated = await tx.economyState.update({
        where: { userId_seasonId: { userId: st.userId, seasonId: st.seasonId } },
        data: {
          obrixTotal: fresh.obrixTotal + pool,
          dailyGeneratedToday: (fresh.dailyGeneratedToday ?? 0) + pool,
          lastCollectedAt: now
        }
      })

      return NextResponse.json({
        ok: true,
        added: pool,
        obrix: updated.obrixTotal
      })
    })
  } catch (err: any) {
    if (err?.message === 'UNAUTH') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
