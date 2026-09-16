// MVP: moderação e score simulados. Em produção (PRO), integrar Sightengine/OpenAI
// para moderação e fal.ai para score estético.

export function moderateImage(_base64: string): { approved: boolean } {
  const approved = Math.random() > 0.08
  return { approved }
}

export function calculateAestheticScore(): number {
  return Math.round((5 + Math.random() * 4.5) * 10) / 10
}
