
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { readState, writeState } from '@/lib/state'
import { attackCost, genBot, now } from '@/lib/game'
import { requireSession } from '@/lib/session'
export async function POST(){
  requireSession()
  const s = readState(); const t = now()
  if (s.cooldownUntil && s.cooldownUntil > t) {
    const remain = s.cooldownUntil - t
    return NextResponse.json({ error: `En cooldown ${Math.ceil(remain/1000)}s` }, { status: 429 })
  }
  const cost = attackCost(s.obrix)
  if (s.obrix < cost) return NextResponse.json({ error:'No hay Obrix suficiente' }, { status: 400 })
  s.obrix -= cost
  s.skipCount = 0
  s.raid = { startedAt: t, cost }
  const rival = genBot(s.obrix)
  s.raid.target = rival
  writeState(s)
  return NextResponse.json({ rival, skips: s.skipCount })
}
