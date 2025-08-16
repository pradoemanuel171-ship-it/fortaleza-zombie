import './globals.css'
import { ReactNode } from 'react'
import { MiniKitBootstrap } from '@/components/MiniKitLayer'
import BottomNav from '@/components/BottomNav'
import LangSwitch from '@/components/LangSwitch'
import AudioLayer from '@/components/AudioLayer'
export default function RootLayout({ children }: { children: ReactNode }){
  return (
    <html lang="es">
      <body>
        <LangSwitch />
        <AudioLayer />
        <div className="mx-auto max-w-md min-h-dvh flex flex-col">
          <MiniKitBootstrap />
          <main className="flex-1 pb-20 px-4 pt-4">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
