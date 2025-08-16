// app/api/buy-base/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { getCurrentSeason } from '@/lib/season'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const s = await requireSession()
    const season = await getCurrentSeason()
    const now = new Date()

    await prisma.$transaction(async (tx) => {
      await tx.economyState.upsert({
        where: {
          userId_seasonId: { userId: s.userId, seasonId: season.id },
        },
        update: {
          basePurchased: true,
          baseStartedAt: now,
          lastCollectedAt: now,
        },
        create: {
          userId: s.userId,
          seasonId: season.id,
          basePurchased: true,
          baseStartedAt: now,
          lastCollectedAt: now,
        },
      })
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err?.message === 'UNAUTH') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
