// Moderação 100% automática (nunca humana). Usa a OpenAI Moderation API
// quando OPENAI_API_KEY está configurada; caso contrário cai em um fallback
// simples para não travar o fluxo em desenvolvimento.

const MODERATION_MODEL = 'omni-moderation-latest'
const MODERATION_URL = 'https://api.openai.com/v1/moderations'

const BLOCKED_WORDS = [
  'porra',
  'caralho',
  'merda',
  'puta',
  'buceta',
  'piroca',
  'vagabunda',
  'desgraça',
  'foder',
  'fdp',
]

type ModerationResult = { approved: boolean; reason?: string }

async function callModerationApi(input: unknown): Promise<ModerationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(MODERATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: MODERATION_MODEL, input }),
    })

    if (!res.ok) {
      console.error('[ia] moderation api error', res.status, await res.text())
      return null
    }

    const data = await res.json()
    const result = data?.results?.[0]
    if (!result) return null

    const reason = result.flagged
      ? Object.keys(result.categories ?? {}).find((k) => result.categories[k])
      : undefined

    return { approved: !result.flagged, reason }
  } catch (err) {
    console.error('[ia] moderation api request failed', err)
    return null
  }
}

// Recebe a foto em data URL (data:image/jpeg;base64,...). Se a API de
// moderação estiver indisponível, aprova por padrão (fail-open) para manter
// o pilar de "100% virtual, nunca trava a festa" — o telão/painel continuam
// funcionando mesmo se o provedor de IA cair.
export async function moderateImage(imageDataUrl: string): Promise<ModerationResult> {
  const result = await callModerationApi([{ type: 'image_url', image_url: { url: imageDataUrl } }])
  return result ?? { approved: true }
}

export async function moderateText(text: string): Promise<ModerationResult> {
  const result = await callModerationApi(text)
  if (result) return result

  const normalized = text.toLowerCase()
  const blocked = BLOCKED_WORDS.some((word) => normalized.includes(word))
  return { approved: !blocked, reason: blocked ? 'blocked_word_fallback' : undefined }
}

export function calculateAestheticScore(): number {
  // TODO produção: substituir por um modelo real de estética (ex: fal.ai / LAION
  // aesthetic predictor). Por ora, score simulado só para ordenar o "top fotos".
  return Math.round((5 + Math.random() * 4.5) * 10) / 10
}
