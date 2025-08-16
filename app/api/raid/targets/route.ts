import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/session'
import { ensureState } from '@/lib/game'

export const runtime = 'nodejs'

export async function GET(){
  const s = requireSession()
  const { st } = await ensureState(s.uid)
  const my = st.obrixTotal
  const weak = Math.max(10, Math.floor(my * 0.4))
  const even = Math.max(15, Math.floor(my * 0.9 + Math.random()*my*0.2))
  const strong = Math.max(20, Math.floor(my * 1.6 + 10))
  const targets = [
    { id: 't1', kind: 'weak', obrix: weak },
    { id: 't2', kind: 'even', obrix: even },
    { id: 't3', kind: 'strong', obrix: strong }
  ]
  return NextResponse.json({ targets })
}
