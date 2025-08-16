import prisma from '@/lib/db'
import { getCurrentSeason } from '@/lib/season'
import { parseNumber, getSettings } from '@/lib/settings'

export async function ensureState(userId: string){
  const season = await getCurrentSeason()
  let st = await prisma.economyState.findUnique({ where: { userId_seasonId: { userId, seasonId: season.id } } })
  if (!st) {
    st = await prisma.economyState.create({ data: { userId, seasonId: season.id } })
  }
  return { st, season }
}

export function calcAccrual(st: { basePurchased: boolean, lastCollectedAt: Date | null }, settings: Map<string,string>) {
  if (!st.basePurchased) return { pool: 0 }
  const perSec = parseNumber(settings, 'OBRIX_PER_SEC')
  const dailyCap = parseNumber(settings, 'OBRIX_DAILY_LIMIT')
  const last = st.lastCollectedAt ? new Date(st.lastCollectedAt) : new Date()
  const now = new Date()
  const elapsed = Math.max(0, Math.floor((now.getTime() - last.getTime()) / 1000))
  let pool = Math.floor(perSec * elapsed)
  pool = Math.min(pool, dailyCap) // cap diario
  return { pool }
}

export function nextAttackCost(attackStep: number, settings: Map<string,string>){
  const base = parseNumber(settings, 'ATTACK_BASE_COST')
  const step = parseNumber(settings, 'ATTACK_COST_STEP')
  return base + step * Math.max(0, attackStep)
}
