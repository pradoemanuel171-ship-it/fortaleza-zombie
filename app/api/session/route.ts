export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
export async function GET(){
  const s = getSession()
  if (!s) return NextResponse.json({ ok:false }, { status:401 })
  return NextResponse.json({ ok:true, uid: s.uid })
}
