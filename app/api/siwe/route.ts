import { NextResponse } from 'next/server'
import { setSession } from '@/lib/session'
import crypto from 'node:crypto'
import prisma from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(){
  // En producción, aquí validarías el payload del MiniKit/World ID.
  // Para demo: creamos un usuario si no existe y seteamos sesión.
  const uid = crypto.randomUUID()
  const user = await prisma.user.create({ data: { id: uid } })
  setSession({ uid: user.id })
  return NextResponse.json({ ok: true })
}
