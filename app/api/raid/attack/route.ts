import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/session'
import prisma from '@/lib/db'
import { getSettings, parseNumber } from '@/lib/settings'
import { ensureState, nextAttackCost } from '@/lib/game'

export const runtime = 'nodejs'

function successProb(kind: 'weak'|'even'|'strong', hit: boolean){
  const base = kind==='weak' ? 0.75 : kind==='even' ? 0.5 : 0.35
  return Math.max(0.05, Math.min(0.95, base + (hit ? 0.2 : -0.1)))
}

export async function POST(req: Request){
  const s = requireSession()
  const settings = await getSettings()
  const body = await req.json().catch(()=>null) as any
  if (!body?.target) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const { st } = await ensureState(s.uid)
  const cooldownSec = parseNumber(settings, 'ATTACK_COOLDOWN_SEC')
  const now = Date.now()
  if (st.canAttackAt && new Date(st.canAttackAt).getTime() > now) {
    return NextResponse.json({ error: 'cooldown' }, { status: 429 })
  }

  const cost = nextAttackCost(st.attackStep, settings)
  if (st.obrixTotal < cost) return NextResponse.json({ error: 'insufficient_obrix' }, { status: 400 })

  const win = Math.random() < successProb(body.target.kind, !!body.hit)
  const loot = win ? Math.max(5, Math.floor(body.target.obrix * 0.06)) : 0

  const updated = await prisma.economyState.update({
    where: { userId_seasonId: { userId: st.userId, seasonId: st.seasonId } },
    data: {
      obrixTotal: st.obrixTotal - cost + loot,
      attackStep: st.attackStep + 1,
      lastAttackAt: new Date(),
      canAttackAt: new Date(Date.now()+cooldownSec*1000)
    }
  })

  return NextResponse.json({
    ok: true,
    result: win ? 'win' : 'lose',
    loot,
    cost,
    obrix: updated.obrixTotal,
    cooldownUntil: updated.canAttackAt
  })
}
