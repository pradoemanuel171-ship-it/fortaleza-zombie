import { prisma } from './db'
import { getSettings, parseNumber } from './settings'
import { now, floorToUtcDate, add } from './time'

export async function ensureState(userId: string){
  const season = await (await import('./season')).getCurrentSeason()
  let st = await prisma.economyState.findUnique({ where: { userId_seasonId: { userId, seasonId: season.id } } })
  if (!st){
    st = await prisma.economyState.create({ data: { userId, seasonId: season.id, dailyResetUtc: floorToUtcDate(now()) } })
  }
  return { st, season }
}
export function calcPool(st: any, settings: Record<string,string>){
  if (!st.basePurchased || !st.baseStartedAt) return { pool: 0, remainingDaily: remDaily(st, settings) }
  const lastTick = st.lastCollectedAt ? new Date(st.lastCollectedAt) : new Date(st.baseStartedAt)
  const elapsedSec = Math.max(0, Math.floor((now().getTime() - lastTick.getTime())/1000))
  const ratePerHour = parseNumber(settings.gen_rate_per_hour)
  const ratePerSec = ratePerHour / 3600 * Number(st.boostMultiplier ?? 1)
  const rawAdd = Math.floor(elapsedSec * ratePerSec)
  const remaining = remDaily(st, settings)
  const pool = Math.max(0, Math.min(rawAdd, remaining))
  return { pool, remainingDaily: remaining }
}
function remDaily(st: any, settings: Record<string,string>){
  const cap = parseNumber(settings.gen_cap_per_day)
  const today = floorToUtcDate(now())
  const last = st.dailyResetUtc ? new Date(st.dailyResetUtc) : today
  const daily = (last.getTime() === today.getTime()) ? st.dailyGeneratedToday : 0
  return Math.max(0, cap - daily)
}
export function computeAttackCost(obrix: number, step: number, settings: Record<string,string>){
  const basePct = parseNumber(settings.attack_base_pct)
  const minC = parseNumber(settings.attack_cost_min)
  const maxC = parseNumber(settings.attack_cost_max)
  const fatigue = parseNumber(settings.fatigue_step_bonus)
  const base = Math.max(minC, Math.min(maxC, Math.ceil(obrix * basePct)))
  const cost = Math.floor(base * (1 + fatigue * step))
  return cost
}
export function decayAttackStep(st: any, settings: Record<string,string>){
  const dec = parseNumber(settings.fatigue_decay_minutes)
  if (!st.lastAttackAt) return st.attackStep
  const mins = Math.floor((now().getTime() - new Date(st.lastAttackAt).getTime())/60000)
  const stepsDown = Math.floor(mins / dec)
  return Math.max(0, st.attackStep - stepsDown)
}
export function computeLoot(defObrix: number, settings: Record<string,string>){
  const pct = parseNumber(settings.loot_pct)
  return Math.max(5, Math.floor(defObrix * pct))
}
export function nextCooldown(settings: Record<string,string>){
  return add(now(), { minutes: parseNumber(settings.cooldown_minutes) })
}
export function nextShield(settings: Record<string,string>){
  return add(now(), { minutes: parseNumber(settings.shield_minutes) })
}
