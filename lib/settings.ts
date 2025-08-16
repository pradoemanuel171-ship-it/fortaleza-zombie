import { prisma } from './db'
const DEFAULTS: Record<string,string> = {
  base_price_wld: '1',
  base_to_pot_pct: '1.00',
  gen_rate_per_hour: '30',
  gen_cap_per_day: '50',
  attack_base_pct: '0.025',
  attack_cost_min: '60',
  attack_cost_max: '400',
  fatigue_step_bonus: '0.20',
  fatigue_window_minutes: '15',
  fatigue_decay_minutes: '20',
  loot_pct: '0.06',
  cooldown_minutes: '5',
  shield_minutes: '30',
  revenge_enabled: 'true',
  revenge_daily_limit: '4',
  revenge_window_minutes: '10',
  revenge_cost_multiplier: '1.25',
  season_length_days: '6',
  ranking_gen_weight: '1.0',
  ranking_buy_weight: '0.5',
  store_creator_cut: '0.65',
  store_to_pot_pct: '0.35'
}
let cache: Record<string,string> | null = null
export async function getSettings(){
  if (cache) return cache
  const rows = await prisma.adminSetting.findMany()
  cache = { ...DEFAULTS }
  for (const r of rows) cache[r.key] = r.value
  return cache
}
export function parseNumber(v: string){ return Number(v) }
export function parseBool(v: string){ return v === 'true' }
