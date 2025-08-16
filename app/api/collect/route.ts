import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { calcPool } from '@/lib/game'

async function readSettings(){
  const s = await supabaseAdmin().from('admin_settings').select('key,value')
  const map: Record<string,string> = {}
  if (s.data) for (const row of s.data as any[]) map[row.key] = row.value
  if (!('GEN_PER_SEC' in map)) map.GEN_PER_SEC = '0.2'
  if (!('DAILY_CAP' in map)) map.DAILY_CAP = '50'
  return map
}

export async function POST(){
  const s = await requireSession()
  const supa = supabaseAdmin()
  const stq = await supa.from('states').select('*').eq('user_id', s.uid).single()
  if (!stq.data) return NextResponse.json({ ok:false, error:'state_missing' }, { status:404 })
  const settings = await readSettings()
  const { pool, today } = calcPool(stq.data, settings)
  const obrix_total = (stq.data.obrix_total||0) + Math.floor(pool)
  const upd = await supa.from('states').update({
    obrix_total,
    last_collected_at: new Date().toISOString(),
    generated_today: today,
  }).eq('user_id', s.uid).select('*').single()
  if (upd.error) return NextResponse.json({ ok:false, error: upd.error.message }, { status:400 })
  return NextResponse.json({ ok:true, collected: Math.floor(pool), state: upd.data })
}
