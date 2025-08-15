
export type State = {
  obrix: number
  productionLastAt: number
  cooldownUntil: number
  skipCount: number
  raid?: { startedAt: number, cost: number, target?: Opponent }
}
export type Opponent = { id: string, name: string, level: number, obrixEstimate: number, hint: 'más débil'|'similar'|'más fuerte', isBot: boolean }
export const FIVE_MIN = 5*60*1000
export function now(){ return Date.now() }
export function defaultState(): State { return { obrix: 1200, productionLastAt: now(), cooldownUntil: 0, skipCount: 0 } }
export function accrue(s: State){ const elapsed = now()-s.productionLastAt; const rate=30; const add = Math.floor((elapsed/3600000)*rate); if(add>0){ s.obrix += add; s.productionLastAt = now() } }
export function attackCost(obrix: number){ return Math.max(25, Math.min(250, Math.floor(obrix*0.015))) }
export function lootAmount(target: number){ return Math.max(1, Math.floor(target*0.05)) }
export function genBot(myObrix: number): Opponent{
  const r = Math.random(); let scale=1.0; let hint:'más débil'|'similar'|'más fuerte'='similar'
  if (r<0.2){ scale=0.6; hint='más débil' } else if (r>0.8){ scale=1.6; hint='más fuerte' }
  const ob = Math.max(100, Math.floor(myObrix*scale)); const lvl = Math.max(1, Math.floor(ob/300))
  return { id: 'BOT-'+Math.random().toString(16).slice(2,6), name:'Saqueador', level:lvl, obrixEstimate: ob, hint, isBot:true }
}
