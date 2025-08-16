import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { getSettings } from '@/lib/settings'
import { ensureState, calcPool } from '@/lib/game'
import { startOfUtcDay } from '@/lib/utils'

export async function POST() {
  try {
    const s = requireSession()
    const settings = await getSettings()
    return await prisma.$transaction(async (tx) => {
      const { st } = await ensureState(s.uid)
      // Reset diario si cambió el día
      const now = new Date()
      const today0 = startOfUtcDay(now)
      const last = st.lastCollectedAt ?? st.baseStartedAt
      const sameDay = !!(last && startOfUtcDay(last).getTime() === today0.getTime())
      const preview = calcPool(st, settings, now)
      const pool = preview.pool
      const newAccrued = (sameDay ? st.obrixAccruedToday : 0) + pool
      const fresh = await tx.economyState.update({
        where: { userId_seasonId: { userId: st.userId, seasonId: st.seasonId } },
        data: {
          obrixTotal: st.obrixTotal + pool,
          obrixAccruedToday: newAccrued,
          lastCollectedAt: now
        }
      })
      return NextResponse.json({ ok: true, obrix: fresh.obrixTotal, gained: pool })
    })
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
}
