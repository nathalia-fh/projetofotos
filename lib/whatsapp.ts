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
