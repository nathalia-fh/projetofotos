import Link from 'next/link'
import { supabaseAdmin, type Photo } from '@/lib/supabase'
import { isAuthorized } from '@/lib/auth'
import LoginGate from '@/components/LoginGate'

function photoUrl(path: string): string {
  const { data } = supabaseAdmin.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

async function loadStats(barId: string) {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [photosRes, couponsRes, flirtsRes, topRes] = await Promise.all([
    supabaseAdmin
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .eq('bar_id', barId)
      .gte('created_at', startOfDay.toISOString()),
    supabaseAdmin
      .from('coupons')
      .select('id', { count: 'exact', head: true })
      .eq('bar_id', barId)
      .gte('created_at', startOfDay.toISOString()),
    supabaseAdmin
      .from('flirts')
      .select('id', { count: 'exact', head: true })
      .eq('bar_id', barId)
      .gte('created_at', startOfDay.toISOString()),
    supabaseAdmin
      .from('photos')
      .select('*')
      .eq('bar_id', barId)
      .order('aesthetic_score', { ascending: false })
      .limit(10),
  ])

  return {
    totalPhotos: photosRes.count ?? 0,
    totalCoupons: couponsRes.count ?? 0,
    totalFlirts: flirtsRes.count ?? 0,
    topPhotos: (topRes.data ?? []) as Photo[],
  }
}

export default async function PainelPage({ params }: { params: { barId: string } }) {
  const authorized = await isAuthorized(params.barId)
  if (!authorized) {
    return <LoginGate barId={params.barId} title="Painel do Dono" />
  }

  const { totalPhotos, totalCoupons, totalFlirts, topPhotos } = await loadStats(params.barId)

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime">
          Painel do Dono
        </p>
        <h1 className="mt-4 text-3xl font-black uppercase leading-tight">
          👻 Modo Fantasma Ativo
        </h1>
        <p className="mt-2 text-white/60">
          Você não precisa fazer nada. Tudo é automático.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-3xl font-black text-lime">{totalPhotos}</p>
            <p className="mt-1 text-xs font-bold uppercase text-white/50">
              Fotos hoje
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-3xl font-black text-lime">{totalCoupons}</p>
            <p className="mt-1 text-xs font-bold uppercase text-white/50">
              Cupons hoje
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-3xl font-black text-flert">{totalFlirts}</p>
            <p className="mt-1 text-xs font-bold uppercase text-white/50">
              Correios hoje
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/telao/${params.barId}`}
            className="rounded-full border border-white/20 px-5 py-2 text-xs font-bold uppercase text-white"
          >
            Abrir telão
          </Link>
          <Link
            href={`/caixa/${params.barId}`}
            className="rounded-full border border-white/20 px-5 py-2 text-xs font-bold uppercase text-white"
          >
            Abrir caixa
          </Link>
          <Link
            href={`/painel/${params.barId}/mesas`}
            className="rounded-full bg-lime px-5 py-2 text-xs font-bold uppercase text-black"
          >
            Imprimir QR das mesas
          </Link>
        </div>

        <h2 className="mt-12 text-left text-lg font-black uppercase">
          Top 10 fotos da noite
        </h2>
        {topPhotos.length === 0 && (
          <p className="mt-4 text-left text-white/40">Nenhuma foto ainda.</p>
        )}
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {topPhotos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-[3/4] overflow-hidden rounded-lg bg-white/5"
            >
              <img
                src={photoUrl(photo.storage_path)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
