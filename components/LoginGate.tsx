'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type LoginGateProps = {
  barId: string
  title: string
}

export default function LoginGate({ barId, title }: LoginGateProps) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barId, code }),
      })
      const data = await res.json()
      if (data.ok) {
        router.refresh()
      } else {
        setError('Código incorreto. Confira o código enviado no WhatsApp.')
      }
    } catch (err) {
      setError('Erro ao validar o código. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime">
          Acesso restrito
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase">{title}</h1>
        <p className="mt-2 text-sm text-white/60">
          Digite o código de acesso do seu bar.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CÓDIGO"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-4 text-center text-xl font-bold tracking-widest text-white outline-none focus:border-lime"
          />
          {error && <p className="text-sm text-flert">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-lime px-6 py-3 text-sm font-bold uppercase text-black disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-xs text-white/40">
          O código foi enviado por WhatsApp quando o bar foi criado.
        </p>
      </div>
    </main>
  )
}
