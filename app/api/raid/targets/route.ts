import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/session'
import { ensureState } from '@/lib/game'

export async function GET() {
  try {
    const s = requireSession()
    const { st } = await ensureState(s.uid)
    const my = Math.max(10, st.obrixTotal)
    const weak = Math.max(10, Math.floor(my * 0.4))
    const even = Math.max(15, Math.floor(my * 0.9 + Math.random()*my*0.2))
    const strong = Math.max(25, Math.floor(my * 2.2 + Math.random()*my*0.6))

    const targets = [
      { id: 't1', label: 'Saqueo fácil', obrix: weak, kind: 'weak' as const },
      { id: 't2', label: 'Saqueo medio', obrix: even, kind: 'even' as const },
      { id: 't3', label: 'Saqueo difícil', obrix: strong, kind: 'strong' as const },
    ]
    return NextResponse.json(targets)
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
}
