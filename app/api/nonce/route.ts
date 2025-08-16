import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  const nonce = crypto.randomBytes(16).toString('hex')
  const res = NextResponse.json({ nonce })
  res.cookies.set('siwe_nonce', nonce, {
    httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 5
  })
  return res
}
