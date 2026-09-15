'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase, type Photo, type Flirt, type Coupon } from '@/lib/supabase'
import CameraFantasma from '@/components/CameraFantasma'

type Tab = 'camera' | 'telao' | 'flert' | 'perfil'

function photoUrl(path: string): string {
  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

export default function BarClientPage() {
  const params = useParams<{ barId: string }>()
  const searchParams = useSearchParams()
  const table = Number(searchParams.get('mesa') ?? '0')
  const [tab, setTab] = useState<Tab>('camera')

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        {tab === 'camera' && <CameraFantasma barId={params.barId} table={table} />}
        {tab === 'telao' && <TelaoTab barId={params.barId} />}
        {tab === 'flert' && <FlertTab barId={params.barId} table={table} />}
        {tab === 'perfil' && <PerfilTab barId={params.barId} table={table} />}
      </div>

      <nav className="flex border-t border-white/10 bg-black">
        {(
          [
            ['camera', 'CÂMERA'],
            ['telao', 'TELÃO'],
            ['flert', 'FLERT'],
            ['perfil', 'PERFIL'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-4 text-xs font-bold uppercase ${
              tab === key ? 'text-lime' : 'text-white/40'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function TelaoTab({ barId }: { barId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    let active = true

    async function load() {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('bar_id', barId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(40)
      if (active && data) setPhotos(data)
    }

    load()

    const channel = supabase
      .channel(`b-photos-${barId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos', filter: `bar_id=eq.${barId}` },
        (payload) => {
          const newPhoto = payload.new as Photo
          if (newPhoto.is_approved) {
            setPhotos((prev) => [newPhoto, ...prev].slice(0, 40))
          }
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [barId])

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-black uppercase text-lime">Telão ao vivo</h2>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="aspect-[3/4] overflow-hidden rounded-lg bg-white/5">
            <img src={photoUrl(photo.storage_path)} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      {photos.length === 0 && (
        <p className="mt-8 text-center text-sm text-white/40">Nenhuma foto ainda.</p>
      )}
    </div>
  )
}

function FlertTab({ barId, table }: { barId: string; table: number }) {
  const [toTable, setToTable] = useState('')
  const [message, setMessage] = useState('')
  const [received, setReceived] = useState<Flirt[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadReceived() {
    const res = await fetch(`/api/flirt?barId=${barId}&table=${table}`)
    const data = await res.json()
    setReceived(data.flirts ?? [])
  }

  useEffect(() => {
    loadReceived()
    const interval = setInterval(loadReceived, 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barId, table])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    setLoading(true)

    try {
      const res = await fetch('/api/flirt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barId, from: table, to: Number(toTable), message }),
      })
      const data = await res.json()
      if (data.ok) {
        setStatus('Correio enviado anonimamente!')
        setMessage('')
        setToTable('')
      } else {
        setStatus('Mensagem bloqueada. Tente ser mais gentil.')
      }
    } catch (err) {
      setStatus('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-black uppercase text-flert">Correio Elegante</h2>
      <p className="mt-1 text-xs text-white/50">
        Envie uma mensagem anônima para outra mesa.
      </p>

      <form onSubmit={handleSend} className="mt-4 flex flex-col gap-3">
        <input
          required
          type="number"
          min={1}
          value={toTable}
          onChange={(e) => setToTable(e.target.value)}
          placeholder="Número da mesa destino"
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-flert"
        />
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreva sua mensagem..."
          rows={3}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-flert"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-flert px-6 py-3 text-sm font-bold uppercase text-white disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar anonimamente'}
        </button>
        {status && <p className="text-sm text-white/70">{status}</p>}
      </form>

      <h3 className="mt-8 text-sm font-black uppercase text-white/60">
        Recebidos
      </h3>
      <div className="mt-3 flex flex-col gap-2">
        {received.map((flirt) => (
          <div key={flirt.id} className="rounded-lg bg-white/5 p-3">
            <p className="text-xs text-flert">Mesa anônima</p>
            <p className="mt-1 text-sm">{flirt.message}</p>
          </div>
        ))}
        {received.length === 0 && (
          <p className="text-sm text-white/40">Nenhum correio recebido ainda.</p>
        )}
      </div>
    </div>
  )
}

function PerfilTab({ barId, table }: { barId: string; table: number }) {
  const [photoCount, setPhotoCount] = useState(0)
  const [coupons, setCoupons] = useState<Coupon[]>([])

  useEffect(() => {
    async function load() {
      const [{ count }, { data: couponData }] = await Promise.all([
        supabase
          .from('photos')
          .select('id', { count: 'exact', head: true })
          .eq('bar_id', barId)
          .eq('table_number', table),
        supabase
          .from('coupons')
          .select('*')
          .eq('bar_id', barId)
          .eq('table_number', table)
          .order('created_at', { ascending: false }),
      ])
      setPhotoCount(count ?? 0)
      setCoupons(couponData ?? [])
    }
    load()
  }, [barId, table])

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-black uppercase text-lime">Sua mesa</h2>
      <p className="mt-1 text-sm text-white/50">Mesa {table}</p>

      <div className="mt-6 rounded-2xl bg-white/5 p-6 text-center">
        <p className="text-4xl font-black text-lime">{photoCount}</p>
        <p className="mt-1 text-xs font-bold uppercase text-white/50">
          Fotos tiradas
        </p>
      </div>

      <h3 className="mt-8 text-sm font-black uppercase text-white/60">
        Meus cupons
      </h3>
      <div className="mt-3 flex flex-col gap-2">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`rounded-lg p-3 ${coupon.is_used ? 'bg-white/5 text-white/40' : 'bg-lime/10 text-lime'}`}
          >
            <p className="font-bold">{coupon.code}</p>
            <p className="text-xs">{coupon.is_used ? 'Já utilizado' : 'Disponível'}</p>
          </div>
        ))}
        {coupons.length === 0 && (
          <p className="text-sm text-white/40">
            Tire 3 fotos para ganhar seu primeiro cupom.
          </p>
        )}
      </div>
    </div>
  )
}
