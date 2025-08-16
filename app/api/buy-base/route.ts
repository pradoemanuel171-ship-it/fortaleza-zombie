import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireSession } from '@/lib/session'
import { getCurrentSeason } from '@/lib/season'

export const runtime = 'nodejs'

export async function POST(){
  const s = requireSession()
  const season = await getCurrentSeason()
  await prisma.economyState.upsert({
    where: { userId_seasonId: { userId: s.uid, seasonId: season.id } },
    update: { basePurchased: true, baseStartedAt: new Date(), lastCollectedAt: new Date() },
    create: { userId: s.uid, seasonId: season.id, basePurchased: true, baseStartedAt: new Date(), lastCollectedAt: new Date() }
  })
  return NextResponse.json({ ok: true })
}
