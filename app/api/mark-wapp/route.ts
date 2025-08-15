export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(){
  cookies().set('wapp','1',{ httpOnly:true, sameSite:'lax', secure:true, path:'/' })
  return NextResponse.json({ ok:true })
}
