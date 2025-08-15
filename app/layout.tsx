
import './globals.css'
import type { Metadata } from 'next'
import { BottomNav } from '@/components/BottomNav'
import GlobalGateAuth from '@/components/GlobalGateAuth'
import { detectLocale } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Fortaleza — v1',
  description: 'MiniApp para World App — v1 limpio'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const loc = detectLocale()
  return (
    <html lang="es">
      <body className="min-h-dvh">
        <div className="mx-auto max-w-md min-h-dvh flex flex-col">
          <GlobalGateAuth loc={loc as any} />
          <main className="flex-1 pb-20 px-4 pt-4">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
