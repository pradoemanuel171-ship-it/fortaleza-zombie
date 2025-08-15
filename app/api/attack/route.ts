
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { readState, writeState } from '@/lib/state'
import { now, FIVE_MIN, lootAmount } from '@/lib/game'

export async function POST(req: Request){
  const s = readState(); const t = now()
  if (!s.raid || !s.raid.target) return NextResponse.json({ error:'No hay objetivo activo' }, { status: 400 })
  if (s.cooldownUntil && s.cooldownUntil > t) return NextResponse.json({ error:`En cooldown ${Math.ceil((s.cooldownUntil-t)/1000)}s` }, { status: 429 })
  const body = await req.json().catch(()=>null) as any
  const result = body?.result
  let msg=''
  if (result==='hit'){ const gain=lootAmount(s.raid.target.obrixEstimate); s.obrix += gain; msg = `¡Saqueo exitoso! +${gain} Obrix` }
  else { msg = 'El rival defendió su base. Perdiste el saqueo.' }
  s.cooldownUntil = t + FIVE_MIN; s.raid = undefined; writeState(s)
  return NextResponse.json({ ok:true, msg })
}
