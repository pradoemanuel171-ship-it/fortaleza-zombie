export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { getCurrentSeason } from '@/lib/season'
export async function GET(){
  const s = requireSession()
  const season = await getCurrentSeason()
  const slots = await prisma.revengeSlot.findMany({ where: { userId: s.uid, seasonId: season.id }, orderBy: { slotIndex: 'asc' } })
  const filled = [...slots]
  for (let i=0;i<4;i++){
    if (!filled.find(x=>x.slotIndex===i)){
      filled.push({ id: `dummy-${i}`, userId: s.uid, seasonId: season.id, slotIndex: i, targetUserId: null, targetIsBot: false, targetObrix: null, expiresAt: null, locked: true, createdAt: new Date() } as any)
    }
  }
  return NextResponse.json({ slots: filled.sort((a,b)=>a.slotIndex-b.slotIndex) })
}
