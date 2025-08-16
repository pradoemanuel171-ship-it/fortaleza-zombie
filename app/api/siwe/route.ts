export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { setSession } from '@/lib/session'
export async function POST(req: Request){
  const body = await req.json().catch(()=>null) as any
  if (!body?.payload) return NextResponse.json({ error:'bad request' }, { status:400 })
  const addr = body.payload?.address || 'worldapp'
  let user = await prisma.user.findUnique({ where: { walletAddress: addr } })
  if (!user){ user = await prisma.user.create({ data: { walletAddress: addr } }) }
  setSession(user.id, addr)
  return NextResponse.json({ ok:true })
}
