export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { readState, writeState } from '@/lib/state'
import { now } from '@/lib/game'

export async function GET() {
  const s = readState()
  writeState(s)
  return NextResponse.json({
    obrix: s.obrix,
    cooldownUntil: s.cooldownUntil,
    skipCount: s.skipCount
  })
}
