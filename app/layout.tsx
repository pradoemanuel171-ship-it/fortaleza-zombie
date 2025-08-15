
import './globals.css'
import type { Metadata } from 'next'
import { BottomNav } from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Fortaleza — v1',
  description: 'MiniApp para World App — v1 limpio'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh">
        <div className="mx-auto max-w-md min-h-dvh flex flex-col">
          <main className="flex-1 pb-20 px-4 pt-4">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
