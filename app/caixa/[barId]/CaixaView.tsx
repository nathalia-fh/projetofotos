'use client'

import { useState } from 'react'

type ValidationResult = {
  valid: boolean
  coupon?: { type: string; table_number: number }
}

const TYPE_LABELS: Record<string, string> = {
  '10off': '10% OFF',
  drink: 'Drink grátis',
  top: 'Brinde especial',
}

export default function CaixaView({ barId }: { barId: string }) {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, barId }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ valid: false })
    } finally {
      setLoading(false)
      setCode('')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime">
          Validador de Cupom
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase">Caixa</h1>

        <form onSubmit={handleValidate} className="mt-8 flex flex-col gap-4">
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="REVELA-XXXXXX"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-4 text-center text-xl font-bold tracking-widest text-white outline-none focus:border-lime"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-lime px-6 py-3 text-sm font-bold uppercase text-black disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Validar'}
          </button>
        </form>

        {result && (
          <div
            className={`mt-6 rounded-2xl p-6 ${
              result.valid ? 'bg-lime text-black' : 'bg-flert/20 text-flert'
            }`}
          >
            {result.valid ? (
              <>
                <p className="text-2xl font-black uppercase">Cupom válido!</p>
                <p className="mt-1 text-sm font-semibold">
                  {result.coupon ? TYPE_LABELS[result.coupon.type] : ''} — Mesa{' '}
                  {result.coupon?.table_number}
                </p>
              </>
            ) : (
              <p className="text-lg font-black uppercase">
                Cupom inválido ou já utilizado
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
