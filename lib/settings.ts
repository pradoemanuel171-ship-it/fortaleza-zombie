import prisma from '@/lib/db'

const DEFAULTS: Record<string,string> = {
  OBRIX_DAILY_LIMIT: '50',
  OBRIX_PER_SEC: (50 / 86400).toString(), // 50 por día
  ATTACK_BASE_COST: '5',
  ATTACK_COST_STEP: '3',
  ATTACK_COOLDOWN_SEC: (5*60).toString(), // 5 minutos
  SHIELD_AFTER_ATTACK_SEC: (30*60).toString() // 30 minutos
}

export async function getSettings() {
  const rows = await prisma.adminSetting.findMany()
  const map = new Map(Object.entries(DEFAULTS))
  for (const r of rows) map.set(r.key, r.value)
  return map
}

export function parseNumber(map: Map<string,string>, key: string): number {
  const v = map.get(key)
  if (!v) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
