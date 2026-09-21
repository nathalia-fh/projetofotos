'use client'

/**
 * RevelaPreview
 * -------------------------------------------------------------------
 * Versão de design mais elaborada da experiência do Revela (câmera,
 * telão, correio elegante e perfil), reconstruída a partir de um
 * protótipo visual. Usa dados MOCKADOS (useState local) — não chama
 * o Supabase nem a API de flert reais.
 *
 * Serve como referência de UI. Para ligar de verdade, troque os
 * setState locais pelas chamadas que já existem em
 * app/b/[barId]/page.tsx e components/CameraFantasma.tsx.
 * -------------------------------------------------------------------
 */

import { useEffect, useState } from 'react'
import {
  Award,
  Ban,
  Camera,
  Check,
  ChevronLeft,
  Gift,
  Heart,
  Image as ImageIcon,
  Images,
  MapPin,
  MessageCircle,
  Pause,
  Send,
  Smile,
  Timer,
  TriangleAlert,
  Trophy,
  User,
  X,
  Zap,
} from 'lucide-react'

type TabId = 'camera' | 'album' | 'flert' | 'perfil'

type Foto = {
  id: string
  url: string
  mesa: number
  minha: boolean
  likes: number
  curtida: boolean
  status: 'aprovada' | 'pendente'
  hora: string
}

type Correio = {
  id: string
  deMesa: number
  deNome: string
  deAvatar?: string
  paraMesa: number
  paraNome: string
  mensagem: string
  hora: string
  novo?: boolean
  status: string
  direcao: 'recebido' | 'enviado'
  fotoAnexada?: string
}

type Match = {
  id: string
  correioId: string
  mesa: number
  nome: string
  avatar: string
  expiraEm: number
  mensagens: { de: 'eu' | 'ele'; texto: string; hora: string }[]
}

const FOTOS_EXEMPLO = [
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&q=80',
  'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&q=80',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80',
]

const AVATARES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
]

const MENSAGENS_RAPIDAS = [
  'Adorei a energia da sua mesa! ✨',
  'Vocês estão arrasando nas fotos 👀',
  'Bora brindar juntos? 🥂',
  'Sua vibe tá contagiante!',
]

const PALAVRAS_BLOQUEADAS = ['gostosa', 'gostoso', 'safada', 'safado', 'peit', 'bunda']

function contemPalavraBloqueada(texto: string) {
  const t = texto.toLowerCase()
  return PALAVRAS_BLOQUEADAS.some((p) => t.includes(p))
}

function formatarTempoRestante(expiraEm: number, agora: number) {
  const ms = Math.max(0, expiraEm - agora)
  const min = Math.floor(ms / 60000)
  const seg = Math.floor((ms % 60000) / 1000)
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
}

export default function RevelaPreview() {
  const [tab, setTab] = useState<TabId>('camera')
  const [fotos, setFotos] = useState<Foto[]>([
    { id: '1', url: FOTOS_EXEMPLO[0], mesa: 5, minha: true, likes: 12, curtida: false, status: 'aprovada', hora: '21:42' },
    { id: '2', url: FOTOS_EXEMPLO[1], mesa: 2, minha: false, likes: 8, curtida: true, status: 'aprovada', hora: '21:44' },
    { id: '3', url: FOTOS_EXEMPLO[2], mesa: 7, minha: false, likes: 23, curtida: false, status: 'aprovada', hora: '21:45' },
  ])
  const [flash, setFlash] = useState(false)
  const [fotoRevelada, setFotoRevelada] = useState<Foto | null>(null)

  const [recebidos, setRecebidos] = useState<Correio[]>([
    {
      id: 'r1',
      deMesa: 2,
      deNome: 'Lina • Mesa 2',
      deAvatar: AVATARES[0],
      paraMesa: 5,
      paraNome: 'Você',
      mensagem: 'Amei o look da sua amiga! Vocês são de onde? 👀',
      hora: '21:50',
      novo: true,
      status: 'Pendente',
      direcao: 'recebido',
    },
  ])
  const [enviados, setEnviados] = useState<Correio[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [chatAberto, setChatAberto] = useState<Match | null>(null)
  const [mensagemChat, setMensagemChat] = useState('')
  const [subTabFlert, setSubTabFlert] = useState<'recebidos' | 'enviados' | 'matches'>('recebidos')
  const [modalNovoCorreio, setModalNovoCorreio] = useState(false)
  const [avisoModeracao, setAvisoModeracao] = useState(false)
  const [rascunho, setRascunho] = useState<{ mesa: number | null; msg: string }>({ mesa: null, msg: '' })
  const [agora, setAgora] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const minhasFotos = fotos.filter((f) => f.minha)
  const faltamParaCupom = Math.max(0, 5 - minhasFotos.length)
  const progresso = Math.min(100, (minhasFotos.length / 5) * 100)
  const novosCorreios = recebidos.filter((c) => c.novo).length

  function tirarFoto() {
    setFlash(true)
    setTimeout(() => setFlash(false), 250)
    setTimeout(() => {
      const url = FOTOS_EXEMPLO[Math.floor(Math.random() * FOTOS_EXEMPLO.length)]
      setFotoRevelada({
        id: Date.now().toString(),
        url,
        mesa: 5,
        minha: true,
        likes: 0,
        curtida: false,
        status: 'pendente',
        hora: 'agora',
      })
    }, 300)
  }

  function enviarParaTelao() {
    if (!fotoRevelada) return
    setFotos((prev) => [{ ...fotoRevelada, status: 'aprovada', hora: 'agora' }, ...prev])
    setFotoRevelada(null)
  }

  function curtir(id: string) {
    setFotos((prev) =>
      prev.map((f) => (f.id === id ? { ...f, curtida: !f.curtida, likes: f.curtida ? f.likes - 1 : f.likes + 1 } : f))
    )
  }

  function aceitarCorreio(correio: Correio) {
    setRecebidos((prev) => prev.filter((c) => c.id !== correio.id))
    const novoMatch: Match = {
      id: 'm' + Date.now(),
      correioId: correio.id,
      mesa: correio.deMesa,
      nome: correio.deNome,
      avatar: correio.deAvatar ?? AVATARES[0],
      expiraEm: Date.now() + 30 * 60 * 1000,
      mensagens: [{ de: 'ele', texto: correio.mensagem, hora: correio.hora }],
    }
    setMatches((prev) => [novoMatch, ...prev])
    setChatAberto(novoMatch)
  }

  function enviarNovoCorreio() {
    if (!rascunho.mesa) return
    if (contemPalavraBloqueada(rascunho.msg)) {
      setAvisoModeracao(true)
      return
    }
    const correio: Correio = {
      id: 'e' + Date.now(),
      deMesa: 5,
      deNome: 'Você',
      paraMesa: rascunho.mesa,
      paraNome: `Mesa ${rascunho.mesa}`,
      mensagem: rascunho.msg || MENSAGENS_RAPIDAS[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pendente',
      direcao: 'enviado',
    }
    setEnviados((prev) => [correio, ...prev])
    setModalNovoCorreio(false)
    setRascunho({ mesa: null, msg: '' })
  }

  function enviarMensagemChat() {
    if (!mensagemChat.trim() || !chatAberto) return
    if (contemPalavraBloqueada(mensagemChat)) {
      setAvisoModeracao(true)
      return
    }
    const atualizado: Match = {
      ...chatAberto,
      mensagens: [
        ...chatAberto.mensagens,
        { de: 'eu', texto: mensagemChat, hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ],
    }
    setChatAberto(atualizado)
    setMatches((prev) => prev.map((m) => (m.id === atualizado.id ? atualizado : m)))
    setMensagemChat('')
  }

  return (
    <div className="flex h-[100dvh] w-full justify-center bg-background text-white">
      <div className="relative flex w-full max-w-[440px] flex-col border-x border-white/[0.06] bg-background">
        {/* topo */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-background/90 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime">
              <Zap className="h-4 w-4 fill-black text-black" />
            </div>
            <span className="text-[13px] font-black tracking-tight">REVELA</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-white/60">
            <span className="h-2 w-2 animate-pulse rounded-full bg-lime" />
            AO VIVO
          </div>
        </header>

        {/* conteúdo */}
        <main className="flex-1 overflow-y-auto pb-24">
          {tab === 'camera' && (
            <section className="px-4 pt-4">
              <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[#141414]">
                {flash && <div className="absolute inset-0 z-30 animate-pulse bg-white" />}
                <div className="text-center">
                  <div className="mb-2 text-[10px] font-black tracking-[0.3em] text-white/40">DISPOSABLE</div>
                  <div className="text-[22px] font-black tracking-tighter">APERTE O BOTÃO</div>
                  <div className="mt-1 text-[11px] font-bold text-white/50">Fotos sem filtro. Só momento.</div>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center">
                <button
                  onClick={tirarFoto}
                  className="h-[84px] w-[84px] rounded-full bg-white p-[6px] shadow-[0_0_0_8px_rgba(255,255,255,0.08),0_0_40px_rgba(212,255,0,0.3)] transition active:scale-95"
                  aria-label="Tirar foto"
                >
                  <div className="h-full w-full rounded-full border-4 border-black bg-white">
                    <div className="m-auto h-12 w-12 rounded-full bg-black" />
                  </div>
                </button>
                <div className="mt-4 text-[11px] font-bold tracking-widest text-white/40">
                  TOQUE PARA REVELAR
                </div>
              </div>

              <div className="mt-8 rounded-[20px] border border-white/10 bg-[#141414] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-lime" />
                    <span className="text-[13px] font-black tracking-wide">RECOMPENSA DA NOITE</span>
                  </div>
                  <span className="rounded-full bg-lime px-2 py-1 text-[11px] font-black text-black">
                    {faltamParaCupom === 0 ? 'DESBLOQUEADA!' : `Faltam ${faltamParaCupom}`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-lime transition-all" style={{ width: `${progresso}%` }} />
                </div>
                <div className="mt-2 text-[12px] font-bold text-white/60">
                  Mais {faltamParaCupom} fotos = <span className="text-lime">10% OFF</span> na próxima rodada
                </div>
              </div>

              {fotoRevelada && (
                <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-[440px] rounded-[28px] border border-white/10 bg-[#151515] p-4">
                    <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/20" />
                    <div className="mb-4 aspect-[4/3] overflow-hidden rounded-[20px]">
                      <img src={fotoRevelada.url} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={enviarParaTelao}
                        className="flex h-14 items-center justify-center gap-2 rounded-full bg-white text-[13px] font-black text-black"
                      >
                        <Images className="h-4 w-4" /> Enviar pro telão
                      </button>
                      <button
                        onClick={() => {
                          setRascunho({ mesa: null, msg: '' })
                          setModalNovoCorreio(true)
                          setFotoRevelada(null)
                        }}
                        className="flex h-14 items-center justify-center gap-2 rounded-full bg-flert text-[13px] font-black text-white"
                      >
                        Correio Elegante 💌
                      </button>
                    </div>
                    <button
                      onClick={() => setFotoRevelada(null)}
                      className="mt-3 h-11 w-full rounded-full bg-white/10 text-[13px] font-bold"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {tab === 'album' && (
            <section className="px-4 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[22px] font-black tracking-tighter">TELÃO AO VIVO</h2>
                <div className="flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-[10px] font-black tracking-widest text-black">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black" /> LIVE
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {fotos.map((foto) => (
                  <div key={foto.id} className="overflow-hidden rounded-[18px] border border-white/10 bg-[#141414]">
                    <img src={foto.url} className="aspect-[4/5] w-full object-cover" alt="" />
                    <div className="flex items-center justify-between p-2.5">
                      <span className="rounded-full bg-black/70 px-2 py-1 text-[10px] font-black tracking-widest">
                        MESA {foto.mesa}
                      </span>
                      <button
                        onClick={() => curtir(foto.id)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black transition ${
                          foto.curtida ? 'bg-flert text-white' : 'bg-white/10 text-white/60'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${foto.curtida ? 'fill-white' : ''}`} /> {foto.likes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'flert' && (
            <section className="pt-4">
              <div className="mb-4 flex items-center justify-between px-4">
                <h2 className="flex items-center gap-2 text-[22px] font-black tracking-tighter">
                  CORREIO ELEGANTE <span className="text-flert">💌</span>
                </h2>
              </div>

              <div className="px-4">
                <div className="flex rounded-full border border-white/10 bg-[#141414] p-1">
                  {(['recebidos', 'enviados', 'matches'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setSubTabFlert(v)}
                      className={`relative flex-1 rounded-full py-2 text-[11px] font-black capitalize tracking-widest transition ${
                        subTabFlert === v ? 'bg-white text-black' : 'text-white/50'
                      }`}
                    >
                      {v}
                      {v === 'recebidos' && novosCorreios > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-flert text-[10px] font-black">
                          {novosCorreios}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 px-4">
                {subTabFlert === 'recebidos' &&
                  (recebidos.length === 0 ? (
                    <p className="mt-16 text-center text-[13px] text-white/50">Nenhum correio ainda...</p>
                  ) : (
                    recebidos.map((c) => (
                      <div key={c.id} className="mb-3 rounded-[20px] border border-white/10 bg-[#141414] p-3">
                        <div className="flex gap-3">
                          <img src={c.deAvatar ?? AVATARES[0]} className="h-11 w-11 rounded-full object-cover" alt="" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-black">{c.deNome}</span>
                              <span className="text-[10px] font-bold text-white/40">{c.hora}</span>
                            </div>
                            <div className="mt-1 text-[13px] text-white/80">"{c.mensagem}"</div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => aceitarCorreio(c)}
                            className="flex h-10 items-center justify-center gap-1 rounded-full bg-flert text-[12px] font-black text-white"
                          >
                            <Heart className="h-4 w-4 fill-white" /> Aceitar
                          </button>
                          <button
                            onClick={() => setRecebidos((prev) => prev.filter((x) => x.id !== c.id))}
                            className="h-10 rounded-full bg-white/10 text-[12px] font-black text-white/60"
                          >
                            Ignorar
                          </button>
                        </div>
                      </div>
                    ))
                  ))}

                {subTabFlert === 'enviados' &&
                  (enviados.length === 0 ? (
                    <p className="mt-16 text-center text-[13px] text-white/50">Você ainda não enviou nenhum.</p>
                  ) : (
                    enviados.map((c) => (
                      <div key={c.id} className="mb-3 flex gap-3 rounded-[20px] border border-white/10 bg-[#141414] p-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#1A1A1A] text-[12px] font-black">
                          M{c.paraMesa}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-black">Para {c.paraNome}</span>
                            <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-white/50">
                              {c.status}
                            </span>
                          </div>
                          <div className="mt-1 text-[13px] text-white/70">"{c.mensagem}"</div>
                        </div>
                      </div>
                    ))
                  ))}

                {subTabFlert === 'matches' &&
                  (matches.length === 0 ? (
                    <div className="mt-16 text-center">
                      <div className="font-black">Nenhum match ainda 💔</div>
                      <div className="mt-1 text-[13px] text-white/50">
                        Quando alguém aceitar seu correio, o chat aparece aqui por 30min
                      </div>
                    </div>
                  ) : (
                    matches.map((m) => {
                      const expirado = m.expiraEm <= agora
                      return (
                        <button
                          key={m.id}
                          onClick={() => !expirado && setChatAberto(m)}
                          className="mb-3 flex w-full items-center gap-3 rounded-[20px] border border-white/10 bg-[#141414] p-3 text-left"
                        >
                          <div className="relative">
                            <img src={m.avatar} className="h-12 w-12 rounded-full object-cover" alt="" />
                            <div className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full border border-white/20 bg-black px-1.5 py-0.5 text-[8px] font-black">
                              <Timer className="h-3 w-3 text-lime" />
                              {formatarTempoRestante(m.expiraEm, agora)}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-black">{m.nome}</div>
                            <div className="truncate text-[12px] text-white/50">
                              {m.mensagens[m.mensagens.length - 1]?.texto}
                            </div>
                          </div>
                          <ChevronLeft className="h-4 w-4 rotate-180 text-white/20" />
                        </button>
                      )
                    })
                  ))}
              </div>

              <div className="fixed bottom-24 right-4 z-10">
                <button
                  onClick={() => setModalNovoCorreio(true)}
                  className="flex h-14 items-center gap-2 rounded-full bg-flert px-5 text-[13px] font-black text-white shadow-[0_8px_24px_rgba(255,46,138,0.4)]"
                >
                  <Send className="h-4 w-4" /> Novo Correio
                </button>
              </div>
            </section>
          )}

          {tab === 'perfil' && (
            <section className="px-4 pb-8 pt-4">
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#141414] p-5">
                <div className="flex items-center gap-4">
                  <img src={AVATARES[0]} className="h-16 w-16 rounded-full border-2 border-white/20 object-cover" alt="" />
                  <div>
                    <div className="text-[18px] font-black tracking-tighter">Você • Mesa 5</div>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-[11px] font-black text-black">
                      <Trophy className="h-3.5 w-3.5" /> TOP 3 DA NOITE
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-[16px] border border-white/10 bg-background p-3 text-center">
                    <div className="text-[20px] font-black">{minhasFotos.length}</div>
                    <div className="text-[10px] font-black tracking-widest text-white/40">FOTOS</div>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-background p-3 text-center">
                    <div className="text-[20px] font-black">{enviados.length}</div>
                    <div className="text-[10px] font-black tracking-widest text-white/40">CORREIOS</div>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-background p-3 text-center">
                    <div className="text-[20px] font-black text-flert">{matches.length}</div>
                    <div className="text-[10px] font-black tracking-widest text-white/40">MATCHES</div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-black tracking-widest">
                  <Award className="h-4 w-4 text-lime" /> RECOMPENSAS
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] border border-white/10 bg-[#1A1A1A] p-3">
                    <Check className="mb-2 h-8 w-8 rounded-full bg-lime p-1.5 text-black" />
                    <div className="text-[12px] font-black">Reveladora Iniciante</div>
                    <div className="mt-1 text-[11px] text-white/50">3 fotos no telão</div>
                  </div>
                  <div
                    className={`rounded-[18px] border p-3 ${
                      minhasFotos.length >= 5
                        ? 'border-lime bg-lime text-black'
                        : 'border-white/10 bg-[#1A1A1A] opacity-60'
                    }`}
                  >
                    <Zap className="mb-2 h-8 w-8" />
                    <div className="text-[12px] font-black">Fotógrafa da Noite</div>
                    <div className="mt-1 text-[11px] opacity-70">5 fotos = 10% OFF</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[20px] border border-white/10 bg-[#141414] p-2">
                <button className="flex h-12 w-full items-center gap-2 rounded-full px-4 text-[13px] font-black text-white/60">
                  <Ban className="h-4 w-4" /> Bloquear mesa
                </button>
              </div>
            </section>
          )}
        </main>

        {/* navegação inferior */}
        <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[440px] -translate-x-1/2 items-center justify-around border-t border-white/10 bg-background/95 px-2 py-2 backdrop-blur-xl">
          {(
            [
              ['camera', 'CÂMERA', Camera],
              ['album', 'TELÃO', Images],
              ['flert', 'FLERT', Heart, novosCorreios],
              ['perfil', 'PERFIL', User],
            ] as [TabId, string, typeof Camera, number?][]
          ).map(([id, label, Icone, badge]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex flex-col items-center gap-1 rounded-full px-5 py-1.5 transition ${
                tab === id ? 'bg-white text-black' : 'text-white/40'
              }`}
            >
              <div className="relative">
                <Icone className="h-5 w-5" />
                {!!badge && (
                  <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-flert px-1 text-[10px] font-black">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-black tracking-widest">{label}</span>
            </button>
          ))}
        </nav>

        {/* chat de match */}
        {chatAberto && (
          <div className="fixed inset-0 z-50 mx-auto flex max-w-[440px] flex-col bg-background">
            <div className="flex items-center justify-between border-b border-white/10 bg-background px-4 py-3">
              <button
                onClick={() => setChatAberto(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <img src={chatAberto.avatar} className="h-9 w-9 rounded-full" alt="" />
                <div>
                  <div className="text-[13px] font-black">{chatAberto.nome}</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-flert">
                    <Timer className="h-3 w-3" /> Chat se apaga em {formatarTempoRestante(chatAberto.expiraEm, agora)}
                  </div>
                </div>
              </div>
              <div className="w-9" />
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-[#0F0F0F] px-4 py-4">
              <div className="text-center">
                <span className="rounded-full bg-lime px-3 py-1 text-[10px] font-black tracking-widest text-black">
                  MATCH! Vocês se curtiram 💘
                </span>
              </div>
              {chatAberto.mensagens.map((m, i) => (
                <div key={i} className={`flex ${m.de === 'eu' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-[18px] px-4 py-2.5 ${
                      m.de === 'eu'
                        ? 'rounded-br-[6px] bg-lime text-black'
                        : 'rounded-bl-[6px] border border-white/10 bg-[#1E1E1E] text-white'
                    }`}
                  >
                    <div className="text-[13px] font-medium leading-snug">{m.texto}</div>
                    <div className={`mt-1 text-[9px] font-bold ${m.de === 'eu' ? 'text-black/50' : 'text-white/30'}`}>
                      {m.hora}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-white/10 bg-background p-3">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <Smile className="h-5 w-5 text-white/60" />
              </button>
              <input
                value={mensagemChat}
                onChange={(e) => setMensagemChat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviarMensagemChat()}
                placeholder="Mensagem..."
                className="h-11 flex-1 rounded-full border border-white/10 bg-[#1A1A1A] px-4 text-[13px] font-medium outline-none focus:border-flert"
              />
              <button
                onClick={enviarMensagemChat}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-flert text-white"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* modal novo correio */}
        {modalNovoCorreio && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="flex max-h-[88vh] w-full max-w-[440px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#161616]">
              <div className="flex items-center justify-between p-5 pb-3">
                <h3 className="text-[18px] font-black tracking-tighter">Novo Correio Elegante 💌</h3>
                <button
                  onClick={() => setModalNovoCorreio(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                <div className="mb-3 text-[12px] font-black tracking-widest text-white/50">MESA DESTINO</div>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRascunho((r) => ({ ...r, mesa: n }))}
                      className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-[18px] border-2 transition ${
                        rascunho.mesa === n
                          ? 'border-flert bg-flert text-white'
                          : 'border-white/10 bg-[#1E1E1E] text-white/60'
                      }`}
                    >
                      <MapPin className="h-5 w-5" />
                      <span className="text-[14px] font-black">MESA {n}</span>
                    </button>
                  ))}
                </div>

                <div className="mb-3 text-[12px] font-black tracking-widest text-white/50">MENSAGEM</div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {MENSAGENS_RAPIDAS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setRascunho((r) => ({ ...r, msg: m }))}
                      className={`rounded-full border px-3 py-2 text-[12px] font-bold transition ${
                        rascunho.msg === m ? 'border-white bg-white text-black' : 'border-white/10 bg-[#1E1E1E] text-white/70'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <textarea
                  value={rascunho.msg}
                  onChange={(e) => setRascunho((r) => ({ ...r, msg: e.target.value }))}
                  placeholder="Ou escreva algo seu..."
                  rows={3}
                  maxLength={120}
                  className="w-full resize-none rounded-[18px] border border-white/10 bg-[#1E1E1E] p-4 text-[13px] font-medium outline-none focus:border-flert"
                />
              </div>
              <div className="flex gap-3 border-t border-white/10 bg-[#161616] p-4">
                <button
                  disabled={!rascunho.mesa}
                  onClick={enviarNovoCorreio}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-flert text-[13px] font-black text-white disabled:pointer-events-none disabled:opacity-30"
                >
                  <Send className="h-4 w-4" /> Enviar Correio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* aviso de moderação */}
        {avisoModeracao && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
            <div className="w-full max-w-[360px] rounded-[24px] border border-white/10 bg-[#1A1A1A] p-6 text-center">
              <TriangleAlert className="mx-auto mb-4 h-14 w-14 rounded-full bg-flert/20 p-3.5 text-flert" />
              <h3 className="text-[18px] font-black tracking-tighter">Opa, vamos manter leve? ✨</h3>
              <p className="mt-2 text-[13px] font-medium leading-snug text-white/60">
                Essa mensagem parece ofensiva. No Revela a gente curte flerte respeitoso.
              </p>
              <div className="mt-5">
                <button
                  onClick={() => setAvisoModeracao(false)}
                  className="h-11 w-full rounded-full bg-lime text-[13px] font-black text-black"
                >
                  Entendi, vou reformular
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
