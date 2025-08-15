
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { readState } from '@/lib/state'
export async function GET(){ const s=readState(); return NextResponse.json({ obrix: s.obrix, cooldownUntil: s.cooldownUntil, skipCount: s.skipCount }) }
