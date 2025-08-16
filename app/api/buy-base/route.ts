import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(){
  const s = await requireSession()
  const supa = supabaseAdmin()
  const upd = await supa.from('states').upsert({
    user_id: s.uid,
    base_purchased: true,
    base_started_at: new Date().toISOString(),
    last_collected_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).select('*').single()
  if (upd.error) return NextResponse.json({ ok:false, error: upd.error.message }, { status:400 })
  return NextResponse.json({ ok:true, state: upd.data })
}
