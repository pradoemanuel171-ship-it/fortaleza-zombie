import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySiweMessage } from 'siwe'
import { prisma } from '@/lib/db'
import { setSession } from '@/lib/session'

type WalletAuthPayload = {
  message: string
  signature: string
  address?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { payload: WalletAuthPayload }
    const nonce = cookies().get('siwe_nonce')?.value
    if (!nonce) return NextResponse.json({ error: 'missing_nonce' }, { status: 400 })

    const { message, signature } = body?.payload || ({} as WalletAuthPayload)
    if (!message || !signature) return NextResponse.json({ error: 'bad_payload' }, { status: 400 })

    const result = await verifySiweMessage({ message, signature, nonce })
    if (!result.success) return NextResponse.json({ error: 'siwe_verify_failed' }, { status: 401 })

    const address = result.data.address
    if (!address) return NextResponse.json({ error: 'no_address' }, { status: 400 })

    const user = await prisma.user.upsert({
      where: { walletAddress: address },
      update: {},
      create: { walletAddress: address }
    })

    const res = NextResponse.json({ ok: true, userId: user.id, address })
    setSession(res, { uid: user.id, address })
    res.cookies.delete('siwe_nonce')
    return res
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
