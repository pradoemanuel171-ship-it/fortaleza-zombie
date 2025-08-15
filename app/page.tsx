
import { detectLocale, t } from '@/lib/i18n'
import { readState } from '@/lib/state'

export default function HomePage(){
  const loc = detectLocale()
  const s = readState()
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t(loc,'home.title')}</h1>
      <div className="rounded-2xl bg-surface p-4 shadow-soft space-y-2">
        <div className="text-sm text-muted">{t(loc,'home.obrix')}</div>
        <div className="text-4xl font-bold text-brand.obrix">{s.obrix}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <form action="/api/collect" method="post">
          <button className="w-full rounded-xl bg-brand.obrix/15 text-brand.obrix py-3 font-semibold hover:bg-brand.obrix/25 active:scale-[0.99]">{t(loc,'home.collect')}</button>
        </form>
        <a href="/raid" className="w-full text-center rounded-xl bg-brand.atq/15 text-brand.atq py-3 font-semibold hover:bg-brand.atq/25 active:scale-[0.99]">{t(loc,'home.raid')}</a>
      </div>
      <div className="rounded-2xl bg-surface p-4 text-sm text-muted">{t(loc,'home.demo')} · {t(loc,'home.rules')}</div>
    </div>
  )
}
