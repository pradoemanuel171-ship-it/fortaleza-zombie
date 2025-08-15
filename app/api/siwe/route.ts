
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySiweMessage, MiniAppWalletAuthSuccessPayload } from '@worldcoin/minikit-js'
import { createSession } from '@/lib/session'

export async function POST(req: Request){
  const body = await req.json() as { payload: MiniAppWalletAuthSuccessPayload, nonce: string }
  const saved = cookies().get('siwe')?.value
  if (!saved || body.nonce !== saved) return NextResponse.json({ ok:false, error:'bad nonce' }, { status: 400 })
  const res = await verifySiweMessage(body.payload, body.nonce)
  if (!res.isValid) return NextResponse.json({ ok:false, error:'invalid sig' }, { status: 401 })
  createSession(body.payload.address)
  return NextResponse.json({ ok:true })
}
