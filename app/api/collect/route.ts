export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { ensureState, calcPool } from '@/lib/game'
import { getSettings } from '@/lib/settings'
import { floorToUtcDate } from '@/lib/time'
export async function POST(){
  const s = requireSession()
  const settings = await getSettings()
  return await prisma.$transaction(async(tx)=>{
    const { st } = await (await import('@/lib/game')).ensureState(s.uid)
    const fresh = await tx.economyState.findUnique({ where: { userId_seasonId: { userId: st.userId, seasonId: st.seasonId } } })
    if (!fresh) throw new Error('state missing')
    const { pool } = calcPool(fresh, settings)
    const today = floorToUtcDate(new Date())
    const lastReset = fresh.dailyResetUtc ? new Date(fresh.dailyResetUtc) : today
    const sameDay = lastReset.getTime() === today.getTime()
    const newDaily = (sameDay ? fresh.dailyGeneratedToday : 0) + pool
    const updated = await tx.economyState.update({
      where: { userId_seasonId: { userId: fresh.userId, seasonId: fresh.seasonId } },
      data: {
        obrixTotal: fresh.obrixTotal + pool,
        generatedLifetime: fresh.generatedLifetime + pool,
        dailyGeneratedToday: newDaily,
        dailyResetUtc: today,
        lastCollectedAt: new Date()
      }
    })
    return NextResponse.json({ ok:true, obrix: updated.obrixTotal, collected: pool })
  })
}
