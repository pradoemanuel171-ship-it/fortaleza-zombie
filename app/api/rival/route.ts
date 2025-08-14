export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { readState, writeState } from '@/lib/state'
import { attackCost, genOpponent, now, FIVE_MIN } from '@/lib/game'

export async function POST() {
  const s = readState()
  const t = now()
  if (s.cooldownUntil && s.cooldownUntil > t) {
    const remain = s.cooldownUntil - t
    return NextResponse.json({ error: `En cooldown ${Math.ceil(remain/1000)}s` }, { status: 429 })
  }
  // start new raid session: charge cost
  const cost = attackCost(s.obrix)
  if (s.obrix < cost) {
    return NextResponse.json({ error: 'No tenés Obrix suficiente para atacar.' }, { status: 400 })
  }
  s.obrix -= cost
  s.skipCount = 0
  s.raid = {
    startedAt: t,
    cost,
    sessionId: Math.random().toString(16).slice(2,10),
  }
  // assign target
  const rival = genOpponent(s.obrix)
  s.raid.target = rival
  writeState(s)
  return NextResponse.json({ rival, skips: s.skipCount })
}
