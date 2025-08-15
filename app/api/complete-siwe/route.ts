
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'
import { createSession } from '@/lib/security'
import { requireCsrf } from '@/lib/security'

interface IRequestPayload { payload: MiniAppWalletAuthSuccessPayload, nonce: string }
export async function POST(req: Request) {
  requireCsrf()
  const body = await req.json() as IRequestPayload
  const saved = cookies().get('siwe')?.value
  if (!saved || body.nonce !== saved) return NextResponse.json({ status:'error', isValid:false, message:'Invalid nonce' }, { status: 400 })
  try {
    const res = await verifySiweMessage(body.payload, body.nonce)
    if (!res.isValid) return NextResponse.json({ status:'error', isValid:false }, { status: 401 })
    createSession(body.payload.address, undefined)
    return NextResponse.json({ status:'success', isValid:true })
  } catch (e:any) {
    return NextResponse.json({ status:'error', isValid:false, message: e?.message || 'verify failed' }, { status: 400 })
  }
}
