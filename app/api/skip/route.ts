
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { readState, writeState } from '@/lib/state'
import { genBot, now, FIVE_MIN } from '@/lib/game'
import { requireSession } from '@/lib/session'
export async function POST(){
  requireSession()
  const s = readState(); const t = now()
  if (!s.raid) return NextResponse.json({ error:'No hay saqueo en curso' }, { status: 400 })
  if (s.cooldownUntil && s.cooldownUntil > t) return NextResponse.json({ error:'En cooldown' }, { status: 429 })
  s.skipCount = Math.min(3, s.skipCount + 1)
  if (s.skipCount >= 3) { s.cooldownUntil = t + FIVE_MIN; s.raid = undefined; writeState(s); return NextResponse.json({ done:true }) }
  const rival = genBot(s.obrix); s.raid.target = rival; writeState(s); return NextResponse.json({ rival, skips: s.skipCount })
}
