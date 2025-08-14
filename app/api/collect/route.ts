export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { readState, writeState } from '@/lib/state'

export async function POST() {
  const s = readState()
  // In this demo, production is already accrued on read.
  // We'll just echo state back.
  writeState(s)
  return NextResponse.json({ ok: true, obrix: s.obrix })
}
