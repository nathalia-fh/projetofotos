'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, type Photo } from '@/lib/supabase'

function photoUrl(path: string): string {
  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

export default function PainelPage() {
  const params = useParams<{ barId: string }>()
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [totalCoupons, setTotalCoupons] = useState(0)
  const [totalFlirts, setTotalFlirts] = useState(0)
  const [topPhotos, setTopPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const [photosRes, couponsRes, flirtsRes, topRes] = await Promise.all([
        supabase
          .from('photos')
          .select('id', { count: 'exact', head: true })
          .eq('bar_id', params.barId)
          .gte('created_at', startOfDay.toISOString()),
        supabase
          .from('coupons')
          .select('id', { count: 'exact', head: true })
          .eq('bar_id', params.barId)
          .gte('created_at', startOfDay.toISOString()),
        supabase
          .from('flirts')
          .select('id', { count: 'exact', head: true })
          .eq('bar_id', params.barId)
          .gte('created_at', startOfDay.toISOString()),
        supabase
          .from('photos')
          .select('*')
          .eq('bar_id', params.barId)
          .order('aesthetic_score', { ascending: false })
          .limit(10),
      ])

      setTotalPhotos(photosRes.count ?? 0)
      setTotalCoupons(couponsRes.count ?? 0)
      setTotalFlirts(flirtsRes.count ?? 0)
      setTopPhotos(topRes.data ?? [])
      setLoading(false)
    }

    load()
  }, [params.barId])

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

        <h2 className="mt-12 text-left text-lg font-black uppercase">
          Top 10 fotos da noite
        </h2>
        {!loading && topPhotos.length === 0 && (
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
