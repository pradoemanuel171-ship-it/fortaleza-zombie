export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'
import { getSettings, parseNumber } from '@/lib/settings'
import { getCurrentSeason } from '@/lib/season'
export async function POST(req: Request){
  const s = requireSession()
  const season = await getCurrentSeason()
  const settings = await getSettings()
  const price = parseNumber(settings.base_price_wld)
  const demo = process.env.PAYMENTS_DEMO === '1'
  if (!demo){
    const body = await req.json().catch(()=>null) as any
    if (!body?.txHash) return NextResponse.json({ error:'txHash required' }, { status:400 })
  }
  await prisma.$transaction(async(tx)=>{
    await tx.economyState.upsert({
      where: { userId_seasonId: { userId: s.uid, seasonId: season.id } },
      update: { basePurchased: true, baseStartedAt: new Date(), lastCollectedAt: new Date() },
      create: { userId: s.uid, seasonId: season.id, basePurchased: true, baseStartedAt: new Date(), lastCollectedAt: new Date() }
    })
    await tx.season.update({ where: { id: season.id }, data: { potWld: { increment: price } } })
  })
  return NextResponse.json({ ok:true })
}
