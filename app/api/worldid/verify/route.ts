// app/api/worldid/verify/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

type ProofBody = {
  // Estructura que IDKit/World App envía al backend
  merkle_root: string
  nullifier_hash: string
  proof: string
  credential_type: 'orb' | 'device' | 'phone'
  action?: string
  signal?: string
}

const VERIFY_URL = 'https://developer.worldcoin.org/api/v1/verify'

// Helper: arma headers con Bearer y hace fallback a x-client-secret si hace falta
async function verifyWithWorldID(body: ProofBody, secret: string) {
  // 1) Intento con Authorization: Bearer (formato más nuevo)
  let res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(body),
  })

  if (res.status === 401 || res.status === 403) {
    // 2) Fallback: algunos ejemplos antiguos usan x-client-secret
    res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-secret': secret,
      } as any,
      body: JSON.stringify(body),
    })
  }

  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

export async function POST(req: Request) {
  try {
    const secret = process.env.WORLD_ID_APP_SECRET
    const defaultAction = process.env.WORLD_ID_ACTION || 'fortaleza_login'

    if (!secret) {
      return NextResponse.json(
        { ok: false, error: 'missing_world_id_secret' },
        { status: 500 },
      )
    }

    const incoming = (await req.json().catch(() => null)) as
      | Partial<ProofBody>
      | null
    if (!incoming) {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
    }

    // Validaciones mínimas
    const { merkle_root, nullifier_hash, proof, credential_type } = incoming
    if (!merkle_root || !nullifier_hash || !proof || !credential_type) {
      return NextResponse.json(
        { ok: false, error: 'missing_fields' },
        { status: 400 },
      )
    }

    // Forzamos action a uno conocido por el backend (evita “action spoofing”)
    const verifyPayload: ProofBody = {
      merkle_root,
      nullifier_hash,
      proof,
      credential_type,
      action: defaultAction,
      signal: incoming.signal || '',
    }

    const { ok, status, data } = await verifyWithWorldID(verifyPayload, secret)
    if (!ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.code || 'verify_failed',
          details: data,
        },
        { status: status === 200 ? 400 : status },
      )
    }

    // Si todo OK, sellamos sesión con cookies HTTPOnly
    const res = NextResponse.json({
      ok: true,
      result: 'verified',
      nullifier: nullifier_hash,
    })

    // Autenticado por 24h; ajustá Max-Age según tu UX.
    res.cookies.set('wid', '1', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      secure: true,
    })
    res.cookies.set('wid_null', nullifier_hash, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      secure: true,
    })

    return res
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: 'server_error', message: String(err?.message || err) },
      { status: 500 },
    )
  }
}
