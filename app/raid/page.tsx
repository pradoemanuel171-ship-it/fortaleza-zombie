
import RaidClient from '@/components/RaidClient'
import { detectLocale } from '@/lib/i18n'

export default function Page(){
  const loc = detectLocale()
  return <RaidClient loc={loc} />
}
