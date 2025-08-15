
import AutoLogin from '@/components/AutoLogin'
import CollectButton from '@/components/CollectButton'
import { readState } from '@/lib/state'
import { detectLocale, t } from '@/lib/i18n'
import { now } from '@/lib/game'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function Home() {
  const loc = detectLocale()
  const s = readState()
  const cd = Math.max(0, s.cooldownUntil - now())

  return (
    <div className="space-y-6">
      <AutoLogin />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t(loc,'home.title')}</h1>
        <span className="text-sm text-muted">{t(loc,'home.demo')}</span>
      </header>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted">{loc.toUpperCase()}</div>
        <LanguageSwitcher />
      </div>

      <div className="rounded-2xl bg-surface p-4 shadow-soft space-y-2">
        <div className="text-sm text-muted">{t(loc,'home.obrix')}</div>
        <div className="text-4xl font-bold text-brand.obrix">{s.obrix}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* pass translated label from server */}
        <CollectButton label={t(loc,'home.collect')} />
        <a href="/raid" className={`w-full text-center rounded-xl bg-brand.atq/15 text-brand.atq py-3 font-semibold hover:bg-brand.atq/25 active:scale-[0.99] ${cd>0?'pointer-events-none opacity-50':''}`}>
          {cd>0? `${t(loc,'home.raid')} (${Math.ceil(cd/1000)}s)` : t(loc,'home.raid')}
        </a>
      </div>

      <div className="rounded-2xl bg-surface p-4 text-sm text-muted">
        {t(loc,'home.rules')}
      </div>
    </div>
  )
}
