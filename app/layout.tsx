
import './globals.css'
import type { Metadata } from 'next'
import { BottomNav } from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Fortaleza — Infección Total',
  description: 'Saquea, defiende y escala con Obrix. Demo sin DB.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-bg text-text antialiased">
        <div className="mx-auto max-w-md min-h-dvh flex flex-col">
          <main className="flex-1 pb-20 px-4 pt-4">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
