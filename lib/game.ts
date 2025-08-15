
export type State = {
  obrix: number
  productionLastAt: number
  cooldownUntil: number
  skipCount: number
  raid?: { startedAt: number, cost: number, target?: Opponent, sessionId: string }
  dayKey: string
  lostToday: number
}
export type Opponent = { id: string, name: string, level: number, obrixEstimate: number, hint: 'más débil'|'similar'|'más fuerte', isBot: boolean }
export const FIVE_MIN = 5*60*1000
export const THIRTY_MIN = 30*60*1000
export function now(){ return Date.now() }
export function startOfLocalDay(ts=now()){ const d=new Date(ts); d.setHours(0,0,0,0); return d.getTime() }
export function defaultState(): State {
  return { obrix: 1200, productionLastAt: now(), cooldownUntil: 0, skipCount: 0, dayKey: new Date(startOfLocalDay()).toISOString(), lostToday: 0 }
}
export function accrueProduction(s: State, ts=now()): void {
  const elapsed = ts - s.productionLastAt
  if (elapsed <= 0) return
  const ratePerHour = 30
  const gained = Math.floor((elapsed/3600000)*ratePerHour)
  s.obrix += Math.max(0, gained)
  s.productionLastAt = ts
}
export function attackCost(obrix: number){ return Math.max(25, Math.min(250, Math.floor(obrix*0.015))) }
export function lootAmount(targetObrix: number){ return Math.max(1, Math.floor(targetObrix*0.05)) }
export function genOpponent(myObrix: number){
  const r = Math.random()
  let scale=1.0; let hint: Opponent['hint']='similar'
  if (r<0.2){ scale=0.6; hint='más débil' } else if (r>0.8){ scale=1.6; hint='más fuerte' }
  const ob = Math.max(100, Math.floor(myObrix*scale))
  const lvl = Math.max(1, Math.floor(ob/300))
  return { id: `NPC-${Math.random().toString(16).slice(2,6)}`, name:'Saqueador', level:lvl, obrixEstimate: ob, hint, isBot:true }
}
export function resetDailyIfNeeded(s: State){ const key=new Date(startOfLocalDay()).toISOString(); if (s.dayKey!==key){ s.dayKey=key; s.lostToday=0 } }
