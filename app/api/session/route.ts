import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET(){
  const s = await getSession()
  if (!s) return NextResponse.json({ ok:true, auth:'none' })
  return NextResponse.json({ ok:true, auth:'ok', uid: s.uid })
}
