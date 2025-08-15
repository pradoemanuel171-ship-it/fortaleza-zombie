
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const jar = cookies()
  let token = jar.get('fx_csrf')?.value
  if (!token) {
    token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
    jar.set('fx_csrf', token, { httpOnly: false, sameSite: 'lax', secure: true, path: '/', maxAge: 60*60*24*7 })
  }
  return NextResponse.json({ token })
}
