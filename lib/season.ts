import prisma from '@/lib/db'
import { SeasonStatus } from '@prisma/client'

const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000

export async function getCurrentSeason() {
  const now = new Date()
  let season = await prisma.season.findFirst({
    where: { status: SeasonStatus.ACTIVE, startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { startsAt: 'desc' }
  })
  if (!season) {
    const last = await prisma.season.findFirst({ orderBy: { ordinal: 'desc' } })
    const ordinal = (last?.ordinal ?? 0) + 1
    const startsAt = now
    const endsAt = new Date(startsAt.getTime() + SIX_DAYS_MS)
    season = await prisma.season.create({
      data: { ordinal, startsAt, endsAt, status: SeasonStatus.ACTIVE }
    })
  }
  return season
}
