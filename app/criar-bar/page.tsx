'use client'

import { useState } from 'react'

export default function CriarBarPage() {
  const [barName, setBarName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barName, email, whatsapp }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Não foi possível iniciar o pagamento. Tente novamente.')
        setLoading(false)
      }
    } catch (err) {
      setError('Erro ao conectar. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime">
          Assinatura REVELA
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase">Crie seu bar</h1>
        <p className="mt-2 text-sm text-white/60">
          R$149/mês. Cancele quando quiser. Modo fantasma ativado
          automaticamente após o pagamento.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-white/60">
              Nome do bar
            </label>
            <input
              required
              value={barName}
              onChange={(e) => setBarName(e.target.value)}
              placeholder="Ex: Bar do Zé"
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-lime"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-white/60">
              WhatsApp
            </label>
            <input
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+55 11 91234-5678"
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-lime"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-white/60">
              E-mail
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@bar.com"
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-lime"
            />
          </div>

          {error && <p className="text-sm text-flert">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-lime px-6 py-3 text-sm font-bold uppercase text-black disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Ir para pagamento'}
          </button>
        </form>
      </div>
    </main>
  )
}
