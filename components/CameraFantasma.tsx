'use client'

import { useEffect, useRef, useState } from 'react'

type Filter = 'auto' | 'flash' | 'neon' | 'retrato' | 'pb'

const FILTERS: Record<Filter, string> = {
  auto: 'brightness(1.1) contrast(1.15)',
  flash: 'brightness(1.4) contrast(1.2) saturate(1.1)',
  neon: 'brightness(1.05) contrast(1.3) saturate(1.6) hue-rotate(-10deg)',
  retrato: 'brightness(1.1) contrast(1.05) saturate(0.95) sepia(0.08)',
  pb: 'grayscale(1) contrast(1.2) brightness(1.1)',
}

const FILTER_LABELS: Record<Filter, string> = {
  auto: 'AUTO',
  flash: 'FLASH',
  neon: 'NEON',
  retrato: 'RETRATO',
  pb: 'P&B',
}

const MAX_PHOTOS = 24

type CameraFantasmaProps = {
  barId: string
  table: number
}

type CouponResult = {
  code: string
  type: string
}

export default function CameraFantasma({ barId, table }: CameraFantasmaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [filter, setFilter] = useState<Filter>('auto')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState<CouponResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        setError('Não foi possível acessar a câmera. Verifique as permissões.')
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  async function take() {
    if (loading || total >= MAX_PHOTOS) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    setLoading(true)
    setFlash(true)
    setTimeout(() => setFlash(false), 200)

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setLoading(false)
      return
    }
    ctx.filter = FILTERS[filter]
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          barId,
          table,
          filter,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        if (!data.moderated) {
          setTotal((t) => t + 1)
        }
        if (data.coupon) {
          setCoupon({ code: data.coupon.code, type: data.coupon.type })
        }
      }
    } catch (err) {
      setError('Erro ao enviar foto. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const remaining = MAX_PHOTOS - total

  return (
    <div className="relative flex h-full flex-col bg-black">
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ filter: FILTERS[filter] }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {flash && <div className="absolute inset-0 bg-white animate-pulse" />}

        <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-sm font-bold text-lime">
          {remaining} FOTOS RESTANTES
        </div>

        {error && (
          <div className="absolute inset-x-4 top-16 rounded-lg bg-red-600/90 p-3 text-center text-sm text-white">
            {error}
          </div>
        )}

        {coupon && (
          <div className="absolute inset-x-4 top-1/3 rounded-2xl bg-lime p-6 text-center shadow-xl">
            <p className="text-xs font-bold uppercase tracking-wide text-black">Cupom Desbloqueado!</p>
            <p className="mt-2 text-3xl font-black uppercase text-black">{coupon.code}</p>
            <p className="mt-1 text-sm font-semibold text-black">Mostre no caixa</p>
            <button
              onClick={() => setCoupon(null)}
              className="mt-4 rounded-full bg-black px-4 py-2 text-xs font-bold uppercase text-lime"
            >
              Fechar
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2 overflow-x-auto bg-black/80 px-4 py-3">
        {(Object.keys(FILTERS) as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase transition ${
              filter === f ? 'bg-lime text-black' : 'bg-white/10 text-white'
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center bg-black pb-8 pt-4">
        <button
          onClick={take}
          disabled={loading || remaining <= 0}
          className="h-20 w-20 rounded-full border-4 border-lime bg-white disabled:opacity-40"
          aria-label="Tirar foto"
        >
          <span className="sr-only">Tirar foto</span>
        </button>
      </div>
    </div>
  )
}
