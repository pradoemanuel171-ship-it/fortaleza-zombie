import { prisma } from '@/lib/db'
import { getCurrentSeason } from '@/lib/season'
import { startOfUtcDay } from '@/lib/utils'
import type { GameSettings } from '@/lib/settings'

export async function ensureState(userId: string) {
  const season = await getCurrentSeason()
  const st = await prisma.economyState.upsert({
    where: { userId_seasonId: { userId, seasonId: season.id } },
    update: {},
    create: { userId, seasonId: season.id }
  })
  return { season, st }
}

export function calcPool(st: { basePurchased: boolean; baseStartedAt: Date | null; lastCollectedAt: Date | null; obrixAccruedToday: number }, settings: GameSettings, now = new Date()) {
  if (!st.basePurchased || !st.baseStartedAt) return { pool: 0, dailyRemaining: settings.MAX_DAILY_O_BRIX - st.obrixAccruedToday }
  // Reinicio diario (cálculo 'soft': si cambió el día, asumimos accruedToday=0 para preview)
  const today0 = startOfUtcDay(now)
  const last = st.lastCollectedAt ?? st.baseStartedAt
  const lastSameDay = (last && startOfUtcDay(last).getTime() === today0.getTime())
  const accruedBase = lastSameDay ? st.obrixAccruedToday : 0
  const seconds = Math.max(0, Math.floor((now.getTime() - (st.lastCollectedAt ?? st.baseStartedAt).getTime())/1000))
  const potential = Math.floor(seconds * settings.BASE_RATE_PER_SEC)
  const dailyRemaining = Math.max(0, settings.MAX_DAILY_O_BRIX - accruedBase)
  const pool = Math.max(0, Math.min(potential, dailyRemaining))
  return { pool, dailyRemaining }
}

export function attackCost(streak: number, settings: GameSettings) {
  return Math.min(settings.ATTACK_COST_CAP, settings.ATTACK_COST_BASE + Math.floor(settings.ATTACK_COST_STEP * streak))
}
