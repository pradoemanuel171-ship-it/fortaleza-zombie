export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/session'
import { ensureState, calcPool } from '@/lib/game'
import { getSettings } from '@/lib/settings'
export async function GET(){
  const s = requireSession()
  const { st, season } = await ensureState(s.uid)
  const settings = await getSettings()
  const { pool, remainingDaily } = calcPool(st, settings)
  return NextResponse.json({ obrix: st.obrixTotal, pool, basePurchased: st.basePurchased, cooldownUntil: st.attackCooldownUntil, shieldUntil: st.shieldUntil, remainingDaily, season: { id: season.id, number: season.number } })
}
