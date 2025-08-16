import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(){
  // Placeholder fijo para UI (4 slots)
  const slots = [
    { id: 'r1', user: 'WhaleX', obrix: 12000 },
    { id: 'r2', user: 'BossY', obrix: 9800 },
    { id: 'r3', user: 'HunterZ', obrix: 8600 },
    { id: 'r4', user: 'NexusQ', obrix: 7900 }
  ]
  return NextResponse.json({ slots })
}
