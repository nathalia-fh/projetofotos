import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime">
        Câmera Descartável Digital
      </p>
      <h1 className="mt-4 text-5xl font-black uppercase tracking-tight">
        REVELA
      </h1>
      <p className="mt-4 max-w-md text-sm text-white/70">
        A câmera descartável coletiva para bares, baladas e eventos. 100%
        fantasma: seus clientes se divertem, você não faz nada.
      </p>

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/criar-bar"
          className="rounded-full bg-lime px-6 py-3 text-sm font-bold uppercase text-black"
        >
          Criar meu bar
        </Link>
        <a
          href="#como-funciona"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold uppercase text-white"
        >
          Como funciona
        </a>
      </div>

      <section id="como-funciona" className="mt-16 grid max-w-md gap-4 text-left">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-lime font-black">1.</p>
          <p className="text-sm text-white/80">
            Cliente escaneia o QR da mesa e entra na câmera, sem baixar app.
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-lime font-black">2.</p>
          <p className="text-sm text-white/80">
            Tira até 24 fotos. A IA corrige a luz do bar e modera sozinha.
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-lime font-black">3.</p>
          <p className="text-sm text-white/80">
            Fotos aparecem no telão ao vivo. A cada 3 fotos, cupom de 10% OFF.
          </p>
        </div>
        <div className="rounded-2xl bg-flert/10 p-4">
          <p className="text-flert font-black">💌</p>
          <p className="text-sm text-white/80">
            Correio Elegante Digital: flerte anônimo entre mesas, com chat de
            30 minutos.
          </p>
        </div>
      </section>

      <footer className="mt-16 pb-10 text-xs text-white/40">
        REVELA © {new Date().getFullYear()} — R$149/mês por bar
      </footer>
    </main>
  )
}
