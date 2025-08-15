
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { readState, writeState } from '@/lib/state'
import { requireSession, requireCsrf } from '@/lib/security'
export async function POST() {
  requireCsrf(); requireSession()
  const s = readState()
  writeState(s)
  return NextResponse.json({ ok:true, obrix: s.obrix })
}
