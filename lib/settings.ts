import { prisma } from '@/lib/db'

export type GameSettings = {
  MAX_DAILY_O_BRIX: number
  BASE_RATE_PER_SEC: number
  ATTACK_COST_BASE: number
  ATTACK_COST_STEP: number
  ATTACK_COST_CAP: number
  COOLDOWN_MINUTES: number
  SHIELD_MINUTES: number
}

const DEFAULTS: GameSettings = {
  MAX_DAILY_O_BRIX: 50,
  BASE_RATE_PER_SEC: 50 / 86400, // 50 por día
  ATTACK_COST_BASE: 3,
  ATTACK_COST_STEP: 2,
  ATTACK_COST_CAP: 10,
  COOLDOWN_MINUTES: 5,
  SHIELD_MINUTES: 30
}

export function parseNumber(v: string | null | undefined, def: number) {
  const n = Number(v)
  return Number.isFinite(n) ? n : def
}

export async function getSettings(): Promise<GameSettings> {
  const all = await prisma.adminSetting.findMany()
  const map = new Map(all.map(s => [s.key, s.value]))
  return {
    MAX_DAILY_O_BRIX: parseNumber(map.get('MAX_DAILY_O_BRIX'), DEFAULTS.MAX_DAILY_O_BRIX),
    BASE_RATE_PER_SEC: parseNumber(map.get('BASE_RATE_PER_SEC'), DEFAULTS.BASE_RATE_PER_SEC),
    ATTACK_COST_BASE: parseNumber(map.get('ATTACK_COST_BASE'), DEFAULTS.ATTACK_COST_BASE),
    ATTACK_COST_STEP: parseNumber(map.get('ATTACK_COST_STEP'), DEFAULTS.ATTACK_COST_STEP),
    ATTACK_COST_CAP: parseNumber(map.get('ATTACK_COST_CAP'), DEFAULTS.ATTACK_COST_CAP),
    COOLDOWN_MINUTES: parseNumber(map.get('COOLDOWN_MINUTES'), DEFAULTS.COOLDOWN_MINUTES),
    SHIELD_MINUTES: parseNumber(map.get('SHIELD_MINUTES'), DEFAULTS.SHIELD_MINUTES),
  }
}
