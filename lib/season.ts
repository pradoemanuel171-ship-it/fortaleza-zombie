import { prisma } from '@/lib/db'

/**
 * Devuelve la Season activa (status='active' y rango [startAt,endAt]).
 * Si no existe, crea una nueva de 6 días a partir de "ahora".
 */
export async function getCurrentSeason() {
  const now = new Date()

  // Busca una season activa que contenga "now"
  let season = await prisma.season.findFirst({
    where: {
      status: 'active',
      startAt: { lte: now },
      endAt: { gte: now }
    },
    orderBy: { startAt: 'desc' }
  })

  if (season) return season

  // Si no hay, crear una nueva de 6 días
  const start = now
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)

  // Número de season: tomar la última y sumar 1
  const last = await prisma.season.findFirst({
    orderBy: { number: 'desc' }
  })
  const nextNumber = (last?.number ?? 0) + 1

  season = await prisma.season.create({
    data: {
      number: nextNumber,
      startAt: start,
      endAt: end,
      status: 'active',
      potWld: 0
    }
  })

  return season
}
