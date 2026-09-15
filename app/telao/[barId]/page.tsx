'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, type Photo } from '@/lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

function photoUrl(path: string): string {
  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

export default function TelaoPage() {
  const params = useParams<{ barId: string }>()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    setQrUrl(`${window.location.origin}/b/${params.barId}`)
  }, [params.barId])

  useEffect(() => {
    let active = true

    async function loadInitial() {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('bar_id', params.barId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(60)
      if (active && data) setPhotos(data)
    }

    loadInitial()

    const channel = supabase
      .channel(`photos-${params.barId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'photos',
          filter: `bar_id=eq.${params.barId}`,
        },
        (payload) => {
          const newPhoto = payload.new as Photo
          if (newPhoto.is_approved) {
            setPhotos((prev) => [newPhoto, ...prev].slice(0, 60))
          }
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [params.barId])

  return (
    <main className="min-h-screen bg-black p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase tracking-tight text-lime">
          REVELA · Telão Ao Vivo
        </h1>
        {qrUrl && (
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <QRCodeSVG value={qrUrl} size={64} bgColor="transparent" fgColor="#D4FF00" />
            <p className="max-w-[10rem] text-xs font-bold uppercase text-white/70">
              Escaneie e apareça aqui
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {photos.map((photo) => (
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

      {photos.length === 0 && (
        <p className="mt-16 text-center text-white/40">
          Aguardando as primeiras fotos da noite...
        </p>
      )}
    </main>
  )
}
