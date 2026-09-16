# REVELA

Câmera descartável digital coletiva para bares, baladas e eventos. PWA 100% virtual — o dono nunca precisa falar com clientes, moderar fotos ou aprovar nada manualmente.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Storage + Realtime)
- Stripe (assinatura mensal)
- Z-API (WhatsApp) com fallback em mock
- PWA

## Fluxo

1. Cliente escaneia o QR da mesa (`/b/[barSlug]?mesa=5`) e entra direto na câmera, sem cadastro.
2. Tira até 24 fotos. Cada foto passa por moderação automática (`lib/ia.ts`) e, se aprovada, é salva no Storage e no banco.
3. A cada 3ª foto da mesa, um cupom é gerado automaticamente.
4. As fotos aprovadas aparecem no telão (`/telao/[barId]`) via Supabase Realtime, em segundos.
5. O cliente pode enviar um Correio Elegante Digital anônimo para outra mesa (`/api/flirt`).
6. O caixa valida cupons em `/caixa/[barId]`.
7. Todo dia às 02h (horário de Brasília), o cron `/api/cron/revelacao` envia um relatório da noite por WhatsApp para o dono.
8. O painel do dono (`/painel/[barId]`) é somente leitura — "Modo Fantasma Ativo, você não precisa fazer nada".

## Configuração local

```bash
npm install
cp .env.example .env.local
# preencha as variáveis abaixo
npm run dev
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima (pública) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (uso apenas no servidor) |
| `NEXT_PUBLIC_URL` | URL pública do app (ex: `https://revela.app`) |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave publicável do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Segredo do webhook do Stripe |
| `STRIPE_PRICE_ID` | (opcional) ID de um Price recorrente de R$149/mês. Se omitido, o preço é criado dinamicamente no checkout |
| `ZAPI_URL` | URL do endpoint Z-API para envio de WhatsApp. Se vazio, mensagens são apenas logadas no console (mock) |
| `CRON_SECRET` | Segredo usado para autenticar o cron job |
| `OPENAI_API_KEY` | (opcional) para moderação/IA mais avançada no futuro |

## Banco de dados

Execute `supabase/schema.sql` no SQL Editor do seu projeto Supabase. Isso cria as tabelas `bars`, `photos`, `flirts`, `matches`, `messages`, `coupons` e habilita Realtime em `photos`, `flirts` e `coupons`.

Depois, crie manualmente um bucket público chamado **photos** em Storage → New bucket (marque "Public bucket").

## Stripe

1. Crie um produto recorrente de R$149,00/mês (ou deixe o checkout criar dinamicamente).
2. Configure um webhook apontando para `/api/stripe/webhook` escutando o evento `checkout.session.completed`.
3. Ao concluir o checkout, um novo registro é criado automaticamente na tabela `bars`.

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Configure todas as variáveis de ambiente do `.env.example`.
3. O `vercel.json` já configura o cron diário às 02h (05:00 UTC) que chama `/api/cron/revelacao`.
4. Configure o webhook do Stripe para apontar para `https://SEU_DOMINIO/api/stripe/webhook`.

## Estrutura de páginas

- `/` — home institucional
- `/criar-bar` — onboarding do dono (nome, WhatsApp, e-mail → Stripe Checkout)
- `/b/[barId]?mesa=N` — app do cliente (câmera, telão, flert, perfil)
- `/telao/[barId]` — telão ao vivo em tela grande
- `/painel/[barId]` — painel fantasma do dono (somente leitura)
- `/caixa/[barId]` — validador de cupom no caixa

## Ícones PWA

Adicione `public/icon-192.png` e `public/icon-512.png` (referenciados em `public/manifest.json`) com a identidade visual do seu bar/marca antes de publicar.
