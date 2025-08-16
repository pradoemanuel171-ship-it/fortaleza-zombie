import { prisma } from '@/lib/db'
import { addDays } from '@/lib/utils'

export async function getCurrentSeason() {
  const now = new Date()
  const active = await prisma.season.findFirst({
    where: { status: 'active', endsAt: { gt: now } },
    orderBy: { startsAt: 'desc' }
  })
  if (active) return active

  const last = await prisma.season.findFirst({ orderBy: { ordinal: 'desc' } })
  const ordinal = (last?.ordinal ?? 0) + 1
  const startsAt = now
  const endsAt = addDays(startsAt, 6)
  return prisma.season.create({
    data: { ordinal, startsAt, endsAt, status: 'active' }
  })
}
