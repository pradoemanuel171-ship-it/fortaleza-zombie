export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

export async function POST(req: Request){
  const body = await req.json().catch(()=>null) as any
  if (!body?.payload) return NextResponse.json({ error:'bad request' }, { status:400 })
  const addr = body.payload?.address || 'worldapp'
  createSession(addr)
  return NextResponse.json({ ok:true })
}
