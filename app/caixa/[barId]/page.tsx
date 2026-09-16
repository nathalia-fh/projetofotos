import { isAuthorized } from '@/lib/auth'
import LoginGate from '@/components/LoginGate'
import CaixaView from './CaixaView'

export default async function CaixaPage({ params }: { params: { barId: string } }) {
  const authorized = await isAuthorized(params.barId)
  if (!authorized) {
    return <LoginGate barId={params.barId} title="Caixa" />
  }

  return <CaixaView barId={params.barId} />
}
