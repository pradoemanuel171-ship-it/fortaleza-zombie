
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
export async function GET() {
  const nonce = crypto.randomUUID().replace(/-/g,'')
  cookies().set('siwe', nonce, { secure:true, httpOnly:true, sameSite:'lax', path:'/' })
  return NextResponse.json({ nonce })
}
