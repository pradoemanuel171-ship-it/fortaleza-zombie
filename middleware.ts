import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export function middleware(req: NextRequest){
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname==='/favicon.ico' || pathname.startsWith('/assets')) return NextResponse.next()
  if (pathname==='/gate') return NextResponse.next()
  const hasSess = req.cookies.get('fx_sid')
  const wapp = req.cookies.get('wapp')?.value === '1'
  if (hasSess || wapp) return NextResponse.next()
  const url = req.nextUrl.clone(); url.pathname='/gate'
  return NextResponse.redirect(url)
}
export const config = { matcher: ['/((?!_next/|favicon.ico|api/|assets/).*)'] }
