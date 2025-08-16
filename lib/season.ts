import prisma from '@/lib/db'

export async function getCurrentSeason() {
  const now = new Date()
  let season = await prisma.season.findFirst({
    where: { startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { startsAt: 'desc' },
  })
  if (!season) {
    const startsAt = new Date(now)
    const endsAt = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)
    const last = await prisma.season.findFirst({ orderBy: { ordinal: 'desc' } })
    season = await prisma.season.create({
      data: { ordinal: (last?.ordinal ?? 0) + 1, startsAt, endsAt, status: 'active' },
    })
  }
  return season
}
