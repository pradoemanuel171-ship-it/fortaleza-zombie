export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/session'
import { ensureState } from '@/lib/game'
function botId(kind: 'weak' | 'even' | 'strong', obrix: number){ return `bot-${kind}-${obrix}` }
export async function GET(){
  const s = requireSession()
  const { st } = await ensureState(s.uid)
  const my = st.obrixTotal
  const weak = Math.max(10, Math.floor(my * 0.4))
  const even = Math.max(15, Math.floor(my * 0.9 + Math.random()*my*0.2))
  const strong = Math.max(20, Math.floor(my * (1.2 + Math.random()*0.8)))
  const targets = [
    { id: botId('weak', weak), kind:'weak', obrix: weak },
    { id: botId('even', even), kind:'even', obrix: even },
    { id: botId('strong', strong), kind:'strong', obrix: strong },
  ]
  return NextResponse.json({ targets })
}
