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

export async function GET(req: Request){
  const sess = await requireSession()
  const url = new URL(req.url)
  const supa = supabaseAdmin()
  // ensure row exists
  let { data, error } = await supa.from('states').select('*').eq('user_id', sess.uid).single()
  if (!data){
    const ins = await supa.from('states').insert({
      user_id: sess.uid,
      base_purchased: false,
      obrix_total: 0,
      generated_today: 0,
    }).select('*').single()
    data = ins.data
  }
  const settings = await readSettings()
  let pool = 0
  if (url.searchParams.get('calc')){
    const c = calcPool(data, settings)
    pool = c.pool
  }
  return NextResponse.json({ ok:true, state: data, pool })
}
