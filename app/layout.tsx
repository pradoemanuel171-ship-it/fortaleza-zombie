import './globals.css';
import type { Metadata } from 'next';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Fortaleza: World App Demo',
  description: 'Miniapp gated by World ID – demo skeleton without DB.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="container">
          <header className="header">
            <strong>🧟 Fortaleza</strong>
            <span className="hint">Demo</span>
          </header>
          <main className="bottom-pad" style={{ flex: 1 }}>{children}</main>
          <div className="nav"><BottomNav/></div>
        </div>
      </body>
    </html>
  );
}
