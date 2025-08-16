import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/session'
import prisma from '@/lib/db'
import { ensureState, calcAccrual } from '@/lib/game'
import { getSettings, parseNumber } from '@/lib/settings'

export const runtime = 'nodejs'

export async function GET(req: Request){
  const s = requireSession()
  const settings = await getSettings()
  const { st } = await ensureState(s.uid)
  const { pool } = calcAccrual(st, settings)
  const dailyCap = parseNumber(settings, 'OBRIX_DAILY_LIMIT')
  return NextResponse.json({ obrixTotal: st.obrixTotal, basePurchased: st.basePurchased, pool, dailyCap })
}

export async function POST(req: Request){
  const s = requireSession()
  const settings = await getSettings()
  const { st } = await ensureState(s.uid)
  const url = new URL(req.url)
  const preview = url.searchParams.get('preview') === '1'
  const { pool } = calcAccrual(st, settings)

  if (preview) {
    const dailyCap = parseNumber(settings, 'OBRIX_DAILY_LIMIT')
    return NextResponse.json({ obrixTotal: st.obrixTotal, basePurchased: st.basePurchased, pool, dailyCap })
  }

  if (pool <= 0) return NextResponse.json({ ok: true, obrix: st.obrixTotal, collected: 0 })

  const updated = await prisma.economyState.update({
    where: { userId_seasonId: { userId: st.userId, seasonId: st.seasonId } },
    data: { obrixTotal: st.obrixTotal + pool, lastCollectedAt: new Date() }
  })
  return NextResponse.json({ ok: true, obrix: updated.obrixTotal, collected: pool })
}
