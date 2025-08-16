export function secondsSince(dateStr: string){
  const t = Math.floor((Date.now() - new Date(dateStr).getTime())/1000)
  return Math.max(0, t)
}

export function calcPool(state: any, settings: Record<string,string>){
  const genPerSec = Number(settings.GEN_PER_SEC || '0.2')
  const dailyCap = Number(settings.DAILY_CAP || '50')
  const since = state.base_purchased ? secondsSince(state.last_collected_at || state.base_started_at) : 0
  const raw = since * genPerSec
  const today = Math.min(dailyCap, (state.generated_today || 0) + raw)
  const pool = Math.max(0, today - (state.generated_today || 0))
  return { pool, today }
}

export function attackCost(step: number, settings: Record<string,string>){
  const base = Number(settings.ATTACK_COST_BASE || '3')
  const inc  = Number(settings.ATTACK_COST_STEP || '1')
  return base + step*inc
}
