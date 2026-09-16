import { isAuthorized } from '@/lib/auth'
import LoginGate from '@/components/LoginGate'
import MesasView from './MesasView'

export default async function MesasPage({
  params,
  searchParams,
}: {
  params: { barId: string }
  searchParams: { count?: string }
}) {
  const authorized = await isAuthorized(params.barId)
  if (!authorized) {
    return <LoginGate barId={params.barId} title="Painel do Dono" />
  }

  const count = Math.min(Math.max(Number(searchParams.count) || 20, 1), 100)

  return <MesasView barId={params.barId} count={count} />
}
