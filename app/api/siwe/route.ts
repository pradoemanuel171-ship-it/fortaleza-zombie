
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSession } from '@/lib/session'
import { verifySiweMessage } from '@worldcoin/minikit-js'

export async function POST(req: Request){
  const body = await req.json().catch(()=>null) as any
  const saved = cookies().get('siwe')?.value
  if (!saved || body?.nonce !== saved) return NextResponse.json({ ok:false, error:'bad nonce' }, { status:400 })
  try{
    const res = await verifySiweMessage(body.payload, body.nonce)
    if (!res.isValid) return NextResponse.json({ ok:false, error:'invalid sig' }, { status:401 })
    createSession(body.payload.address)
    return NextResponse.json({ ok:true })
  }catch(e:any){
    return NextResponse.json({ ok:false, error: e?.message || 'verify failed' }, { status:400 })
  }
}
