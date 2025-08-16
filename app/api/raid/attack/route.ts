// app/api/raid/attack/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export const runtime = 'nodejs'

type BotKind = 'weak' | 'even' | 'strong'

function successProb(kind: BotKind, hit: boolean) {
  // Probabilidad base según el rival; el "hit" del minijuego da un bonus
  const base =
    kind === 'weak' ? 0.75 :
    kind === 'even' ? 0.50 : 0.35
  const bonus = hit ? 0.20 : 0.0
  return Math.min(0.95, base + bonus)
}

function attackCost(step: number) {
  // Coste creciente: base 3 + 2 por cada intento en la ventana (cap en 10)
  const s = Math.min(step, 10)
  return 3 + s * 2
}

export async function POST(req: Request) {
  try {
    const sess = await requireSession()
    const body = await req.json().catch(() => null) as {
      hit?: boolean
      bot?: { kind: BotKind; obrix: number }
    } | null

    if (!body?.bot?.kind || typeof body.bot.obrix !== 'number') {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }

    const now = new Date()

    // Traemos la Season activa y el estado del usuario
    const season = await prisma.season.findFirst({
      where: { status: 'active', startAt: { lte: now }, endAt: { gte: now } },
      orderBy: { startAt: 'desc' }
    })
    if (!season) {
      return NextResponse.json({ error: 'no_active_season' }, { status: 400 })
    }

    const st = await prisma.economyState.findUnique({
      where: { userId_seasonId: { userId: sess.userId, seasonId: season.id } }
    })

    if (!st) {
      return NextResponse.json({ error: 'state_not_found' }, { status: 404 })
    }
    if (!st.basePurchased) {
      return NextResponse.json({ error: 'no_base' }, { status: 400 })
    }
    if (st.attackCooldownUntil && st.attackCooldownUntil > now) {
      return NextResponse.json({ error: 'on_cooldown', until: st.attackCooldownUntil }, { status: 429 })
    }
    if (st.shieldUntil && st.shieldUntil > now) {
      return NextResponse.json({ error: 'shield_active', until: st.shieldUntil }, { status: 429 })
    }

    const effectiveStep = st.attackStep ?? 0
    const cost = attackCost(effectiveStep)

    if (st.obrixTotal < cost) {
      return NextResponse.json({ error: 'insufficient_obrix' }, { status: 400 })
    }

    const win = Math.random() < successProb(body.bot.kind, !!body.hit)
    const loot = win ? Math.max(5, Math.floor(body.bot.obrix * 0.06)) : 0
    const cooldownUntil = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutos fijo por ahora
    const shieldUntil = new Date(now.getTime() + 30 * 60 * 1000)  // 30 minutos de escudo (si querés, quítalo)

    const result = await prisma.$transaction(async (tx) => {
      // Descontar coste y avanzar el step
      const afterCost = await tx.economyState.update({
        where: { userId_seasonId: { userId: st.userId, seasonId: st.seasonId } },
        data: {
          obrixTotal: st.obrixTotal - cost,
          attackStep: effectiveStep + 1,
          lastAttackAt: now,
          attackCooldownUntil: cooldownUntil,
          shieldUntil: win ? shieldUntil : st.shieldUntil
        }
      })

      // Si ganó, sumar loot
      const afterLoot = win
        ? await tx.economyState.update({
            where: { userId_seasonId: { userId: st.userId, seasonId: st.seasonId } },
            data: { obrixTotal: afterCost.obrixTotal + loot }
          })
        : afterCost

      // Log de combate
      await tx.combatLog.create({
        data: {
          seasonId: st.seasonId,
          attackerId: st.userId,
          defenderId: null,
          isBot: true,
          result: win ? 'win' : 'lose',
          cost,
          loot,
          cooldownAppliedUntil: cooldownUntil,
          shieldAppliedUntil: win ? shieldUntil : null,
          miniSeed: body.hit ? 'hit' : 'miss',
          miniTapMs: null,
          miniSuccess: !!body.hit
        }
      })

      return { obrix: afterLoot.obrixTotal }
    })

    return NextResponse.json({
      ok: true,
      result: win ? 'win' : 'lose',
      loot,
      cost,
      cooldownUntil,
      shieldUntil: win ? shieldUntil : null,
      obrix: result.obrix
    })
  } catch (err: any) {
    // Si viene de requireSession()
    if (err && err.message === 'UNAUTH') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
