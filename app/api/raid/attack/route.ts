export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { ensureState, computeAttackCost, computeLoot, decayAttackStep } from '@/lib/game'
function parseBot(id: string){ const m = id.match(/^bot\-(weak|even|strong)\-(\d+)$/); if (!m) return null; return { kind: m[1] as 'weak'|'even'|'strong', obrix: parseInt(m[2],10) } }
function successProb(kind: 'weak'|'even'|'strong', hit: boolean){ let p = kind==='weak'?0.7:kind==='even'?0.5:0.3; p += hit?0.2:-0.2; return Math.min(0.9, Math.max(0.1, p)) }
export async function POST(req: Request){
  const s = requireSession()
  const body = await req.json().catch(()=>null) as any
  if (!body?.targetId || typeof body?.hit !== 'boolean') return NextResponse.json({ error:'bad request' }, { status:400 })
  const bot = parseBot(body.targetId); if (!bot) return NextResponse.json({ error:'invalid target' }, { status:400 })
  return await prisma.$transaction(async(tx)=>{
    const { st, season } = await ensureState(s.uid)
    const effectiveStep = decayAttackStep(st, { fatigue_decay_minutes:'20' } as any)
    const cost = computeAttackCost(st.obrixTotal, effectiveStep, { attack_base_pct:'0.025', attack_cost_min:'60', attack_cost_max:'400', fatigue_step_bonus:'0.20' } as any)
    if (st.attackCooldownUntil && new Date(st.attackCooldownUntil).getTime() > Date.now()) return NextResponse.json({ error:'cooldown' }, { status:429 })
    if (st.obrixTotal < cost) return NextResponse.json({ error:'insufficient_obrix' }, { status:400 })
    const afterCost = await tx.economyState.update({ where: { userId_seasonId: { userId: st.userId, seasonId: st.seasonId } }, data: { obrixTotal: st.obrixTotal - cost, attackStep: effectiveStep + 1, lastAttackAt: new Date() } })
    const win = Math.random() < successProb(bot.kind, !!body.hit)
    const loot = win ? Math.max(5, Math.floor(bot.obrix * 0.06)) : 0  # placeholder will be fixed
    return NextResponse.json({ ok:true, result: win?'win':'lose', loot, cost, cooldownUntil: new Date(Date.now()+5*60*1000), obrix: afterCost.obrixTotal + loot })
  })
}
