
import './globals.css'
import type { Metadata } from 'next'
import { BottomNav } from '@/components/BottomNav'
import MiniKitBootstrap from '@/components/MiniKitBootstrap'
import { detectLocale } from '@/lib/i18n'
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider'

export const metadata: Metadata = {
  title: 'Fortaleza — Secure v1',
  description: 'World App MiniApp — secure demo'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const loc = detectLocale()
  return (
    <html lang={loc}>
      <MiniKitProvider>
      <body className="min-h-dvh">
        <div className="mx-auto max-w-md min-h-dvh flex flex-col">
          <MiniKitBootstrap loc={loc as any} />
          <main className="flex-1 pb-20 px-4 pt-4">{children}</main>
          <BottomNav />
        </div>
      </body>
    </MiniKitProvider>
    </html>
  )
}
