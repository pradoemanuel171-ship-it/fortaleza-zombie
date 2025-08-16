import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { getCurrentSeason } from '@/lib/season'
import { getSettings } from '@/lib/settings'
import { attackCost } from '@/lib/game'

type Target = { id: string; label: string; obrix: number; kind: 'weak'|'even'|'strong' }

function successProb(kind: 'weak'|'even'|'strong', hit: boolean) {
  const base = kind==='weak' ? 0.72 : kind==='even' ? 0.54 : 0.36
  const bonus = hit ? 0.22 : -0.12
  return Math.max(0.05, Math.min(0.95, base + bonus))
}

export async function POST(req: Request) {
  try {
    const s = requireSession()
    const body = await req.json() as { target: Target; hit: boolean }
    const target = body?.target
    const hit = !!body?.hit
    if (!target) return NextResponse.json({ error: 'bad_target' }, { status: 400 })

    const settings = await getSettings()
    const season = await getCurrentSeason()

    return await prisma.$transaction(async (tx) => {
      const st = await tx.economyState.findUnique({ where: { userId_seasonId: { userId: s.uid, seasonId: season.id } } })
      if (!st) return NextResponse.json({ error: 'state_missing' }, { status: 400 })

      const now = new Date()
      if (st.lastAttackAt && now.getTime() - st.lastAttackAt.getTime() < settings.COOLDOWN_MINUTES * 60 * 1000) {
        const until = new Date(st.lastAttackAt.getTime() + settings.COOLDOWN_MINUTES * 60 * 1000)
        return NextResponse.json({ error: 'cooldown', cooldownUntil: until.toISOString() }, { status: 429 })
      }

      const cost = attackCost(st.attackStep, settings)
      if (st.obrixTotal < cost) return NextResponse.json({ error: 'insufficient_obrix' }, { status: 400 })

      const win = Math.random() < successProb(target.kind, hit)
      const loot = win ? Math.max(5, Math.floor(target.obrix * 0.06)) : 0

      const updated = await tx.economyState.update({
        where: { userId_seasonId: { userId: st.userId, seasonId: st.seasonId } },
        data: {
          obrixTotal: st.obrixTotal - cost + loot,
          attackStep: st.attackStep + 1,
          lastAttackAt: now,
          shieldUntil: win ? new Date(now.getTime() + 30 * 60 * 1000) : st.shieldUntil
        }
      })

      await tx.combatLog.create({
        data: {
          seasonId: season.id,
          attackerId: st.userId,
          opponentKind: target.kind,
          opponentObrix: target.obrix,
          result: win ? 'win' : 'lose',
          loot
        }
      })

      return NextResponse.json({
        ok: true,
        result: win ? 'win' : 'lose',
        loot,
        cost,
        cooldownUntil: new Date(now.getTime() + settings.COOLDOWN_MINUTES*60*1000).toISOString(),
        obrix: updated.obrixTotal
      })
    })
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
}
