import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/session'
import { ensureState, calcPool } from '@/lib/game'
import { getSettings } from '@/lib/settings'

export async function GET() {
  try {
    const s = requireSession()
    const { st } = await ensureState(s.uid)
    const settings = await getSettings()
    const { pool, dailyRemaining } = calcPool(st, settings)
    return NextResponse.json({
      basePurchased: st.basePurchased,
      obrixTotal: st.obrixTotal,
      pool,
      dailyRemaining
    })
  } catch (e) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
}
