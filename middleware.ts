import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon') ) {
    return NextResponse.next()
  }
  const sid = req.cookies.get('sid')?.value
  if (!sid && pathname !== '/gate') {
    const url = req.nextUrl.clone()
    url.pathname = '/gate'
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}
export const config = { matcher: ['/((?!_next|favicon.ico).*)'] }
