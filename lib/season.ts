import { prisma } from './db'
import { add } from './time'
export async function getCurrentSeason(){
  let s = await prisma.season.findFirst({ where: { status: 'active' }, orderBy: { number: 'desc' } })
  if (s) return s
  const last = await prisma.season.findFirst({ orderBy: { number: 'desc' } })
  const number = (last?.number ?? 0) + 1
  const startAt = new Date()
  const endAt = add(startAt, { days: 6 })
  s = await prisma.season.create({ data: { number, startAt, endAt, status: 'active', potWld: 0 } })
  return s
}
