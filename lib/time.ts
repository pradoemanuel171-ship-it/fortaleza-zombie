export function now(){ return new Date() }
export function add(d: Date, { days=0, minutes=0 }: { days?: number, minutes?: number }){
  const t = new Date(d.getTime())
  if (days) t.setUTCDate(t.getUTCDate() + days)
  if (minutes) t.setUTCMinutes(t.getUTCMinutes() + minutes)
  return t
}
export function floorToUtcDate(d: Date){
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}
