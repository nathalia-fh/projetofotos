'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function MesasView({ barId, count }: { barId: string; count: number }) {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const tables = Array.from({ length: count }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-white p-8 text-black print:p-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black uppercase">QR Codes das Mesas</h1>
          <p className="text-sm text-black/60">
            Imprima e cole um em cada mesa do bar (acrílico ou adesivo).
          </p>
        </div>
        <form className="flex items-center gap-2" method="get">
          <input
            type="number"
            name="count"
            min={1}
            max={100}
            defaultValue={count}
            className="w-20 rounded-lg border border-black/20 px-3 py-2 text-center"
          />
          <button
            type="submit"
            className="rounded-full border border-black px-4 py-2 text-xs font-bold uppercase"
          >
            Gerar
          </button>
        </form>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-black px-6 py-3 text-sm font-bold uppercase text-white"
        >
          Imprimir / Salvar PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 print:grid-cols-2">
        {tables.map((table) => (
          <div
            key={table}
            className="flex flex-col items-center gap-2 rounded-xl border border-black/10 p-6 text-center break-inside-avoid"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-black/50">
              REVELA
            </p>
            {origin && <QRCodeSVG value={`${origin}/b/${barId}?mesa=${table}`} size={140} />}
            <p className="text-2xl font-black">MESA {table}</p>
            <p className="text-[10px] text-black/50">Escaneie e tire fotos grátis</p>
          </div>
        ))}
      </div>
    </div>
  )
}
