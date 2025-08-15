
import { detectLocale, t } from '@/lib/i18n'
import { readState } from '@/lib/state'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import CollectButton from '@/components/CollectButton'
import ObrixCounter from '@/components/ObrixCounter'

export default function HomePage(){
  const loc = detectLocale()
  const s = readState()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t(loc,'home.title')}</h1>
        <LanguageSwitcher />
      </div>
      <div className="rounded-2xl bg-surface p-4 shadow-soft space-y-2 anim-pop">
        <div className="text-sm text-muted">{t(loc,'home.obrix')}</div>
        <ObrixCounter initial={s.obrix} />
      </div>
      <div className="grid grid-cols-2 gap-3 anim-slide-up">
        {/* Collect via fetch without leaving the page */}
        <CollectButton label={t(loc,'home.collect')} />
        <a href="/raid" className="w-full text-center rounded-xl bg-brand.atq/15 text-brand.atq py-3 font-semibold hover:bg-brand.atq/25 active:scale-[0.99]">{t(loc,'home.raid')}</a>
      </div>
      <div className="rounded-2xl bg-surface p-4 text-sm text-muted">{t(loc,'home.demo')} · {t(loc,'home.rules')}</div>
    </div>
  )
}
