// app/api/complete-siwe/route.ts
import { NextResponse } from 'next/server'
import { SiweMessage } from 'siwe'
import prisma from '@/lib/db'
import { saveSession } from '@/lib/session'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { message, signature, nonce } = await req.json()
    if (!message || !signature || !nonce) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }

    // Validar nonce (anti-replay)
    const n = await prisma.nonce.findUnique({ where: { nonce } })
    if (!n || n.used) {
      return NextResponse.json({ error: 'invalid_nonce' }, { status: 400 })
    }

    // Verificar SIWE
    const msg = new SiweMessage(message)
    const host = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').host

    const result = await msg.verify({
      signature,
      domain: host,
      nonce
    })

    if (!result.success) {
      return NextResponse.json({ error: 'siwe_verify_failed' }, { status: 401 })
    }

    // Marcar nonce como usado
    await prisma.nonce.update({
      where: { nonce },
      data: { used: true }
    })

    // Crear/obtener usuario por wallet
    const wallet = msg.address.toLowerCase()
    const user = await prisma.user.upsert({
      where: { walletAddress: wallet },
      update: {},
      create: { walletAddress: wallet }
    })

    // Guardar sesión (ajustá según tu helper)
    await saveSession({
      uid: user.id,
      wallet: user.walletAddress
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('complete-siwe error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
