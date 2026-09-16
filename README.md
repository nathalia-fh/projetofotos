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
9. Ao pagar em `/criar-bar`, o dono recebe automaticamente por WhatsApp os links do telão/painel/caixa e o **código de acesso** do bar (gerado sozinho, sem contato humano).

## Moderação por IA

`lib/ia.ts` usa a **OpenAI Moderation API** (`omni-moderation-latest`) para moderar fotos (`/api/upload`) e mensagens do Correio Elegante (`/api/flirt`) automaticamente — nunca há revisão manual. Se `OPENAI_API_KEY` não estiver configurada, o app cai em um fallback simples (aprova fotos e bloqueia só uma lista básica de palavrões em texto) para não travar o ambiente de desenvolvimento. Em produção, defina `OPENAI_API_KEY` para moderação real.

Se a chamada à API de moderação falhar (rede, rate limit etc.), a foto é aprovada por padrão (fail-open) — prioriza nunca travar a festa em vez de bloquear tudo por um erro temporário de rede.

## Acesso ao Painel e ao Caixa

`/painel/[barId]` e `/caixa/[barId]` são protegidos por um **código de acesso de 6 caracteres**, gerado automaticamente na tabela `bars` (coluna `access_code`) quando o bar é criado. O dono recebe esse código por WhatsApp. Ao digitar o código correto, um cookie de sessão (`httpOnly`) é gravado por 12h — sem necessidade de cadastro de usuário/senha.

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
| `OPENAI_API_KEY` | Chave da OpenAI usada para moderação real de fotos e mensagens (recomendado em produção) |
| `AUTH_SECRET` | (opcional) segredo para assinar o cookie de sessão de `/painel` e `/caixa` |

## Banco de dados

Execute `supabase/schema.sql` no SQL Editor do seu projeto Supabase. Isso cria as tabelas `bars`, `photos`, `flirts`, `matches`, `messages`, `coupons`, habilita Realtime em `photos`, `flirts` e `coupons`, e ativa **Row Level Security**: a chave anon (usada no navegador) só consegue ler `photos` e `coupons`; todo o resto (incluindo `access_code` do bar) só é acessível pelas rotas de servidor com a service role key.

Se você já tinha o schema anterior (sem `access_code`/RLS), rode as instruções de migração comentadas no final de `supabase/schema.sql`.

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
- `/painel/[barId]` — painel fantasma do dono (somente leitura, protegido por código de acesso)
- `/painel/[barId]/mesas` — grade de QR codes por mesa, pronta para imprimir/salvar em PDF (protegido por código de acesso)
- `/caixa/[barId]` — validador de cupom no caixa (protegido por código de acesso)

## Ícones PWA

Adicione `public/icon-192.png` e `public/icon-512.png` (referenciados em `public/manifest.json`) com a identidade visual do seu bar/marca antes de publicar.
