export async function sendWhatsApp(to: string, message: string): Promise<void> {
  const zapiUrl = process.env.ZAPI_URL

  if (!zapiUrl) {
    console.log(`[WhatsApp MOCK] Para: ${to}\n${message}`)
    return
  }

  await fetch(zapiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: to, message }),
  })
}

type NightStats = {
  photos: number
  coupons: number
  flirts: number
}

export function generateWelcomeMessage(barName: string, barId: string, accessCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://revela.app'
  return (
    `👻 *Bem-vindo ao REVELA, ${barName}!*\n\n` +
    `Seu modo fantasma está ativo. Aqui estão seus links:\n\n` +
    `📺 Telão: ${baseUrl}/telao/${barId}\n` +
    `👤 Painel: ${baseUrl}/painel/${barId}\n` +
    `💳 Caixa: ${baseUrl}/caixa/${barId}\n\n` +
    `🔑 Código de acesso do Painel e do Caixa: *${accessCode}*\n\n` +
    `Guarde esse código — ele é a senha do seu bar. Sem ele, ninguém mais acessa suas fotos e cupons.\n\n` +
    `_REVELA - Câmera Descartável Digital_`
  )
}

export function generateNightReport(barName: string, stats: NightStats): string {
  const { photos, coupons, flirts } = stats
  return (
    `📸 *REVELA - Relatório da Noite*\n\n` +
    `Olá, *${barName}*! Aqui está o resumo de hoje:\n\n` +
    `📷 Fotos tiradas: *${photos}*\n` +
    `🎟️ Cupons gerados: *${coupons}*\n` +
    `💌 Correios enviados: *${flirts}*\n\n` +
    `Você não precisa fazer nada. O modo fantasma cuidou de tudo. 👻\n\n` +
    `_REVELA - Câmera Descartável Digital_`
  )
}
