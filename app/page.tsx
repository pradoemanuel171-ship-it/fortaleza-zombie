import WorldIdGate from '@/components/WorldIdGate'
import HomeClient from './ui/HomeClient'

export default function Page(){
  return (
    <WorldIdGate>
      <HomeClient />
    </WorldIdGate>
  )
}
