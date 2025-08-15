
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
export async function GET(){
  const nonce = crypto.randomUUID().replace(/-/g,'')
  cookies().set('siwe', nonce, { httpOnly:true, sameSite:'lax', secure:true, path:'/' })
  return NextResponse.json({ nonce })
}
