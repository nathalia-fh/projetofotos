import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

// Autenticação simples por "código de acesso do bar" para proteger /painel e
// /caixa — não exige cadastro nem senha de usuário, só o código de 6
// caracteres enviado ao dono por WhatsApp na criação do bar.

export function sessionCookieName(barId: string): string {
  return `revela_session_${barId}`
}

export function computeSessionToken(barId: string, accessCode: string): string {
  const secret =
    process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'revela-dev-secret'
  return createHash('sha256').update(`${barId}:${accessCode.toUpperCase()}:${secret}`).digest('hex')
}

export async function isAuthorized(barId: string): Promise<boolean> {
  const { data: bar } = await supabaseAdmin
    .from('bars')
    .select('access_code')
    .eq('id', barId)
    .maybeSingle()

  if (!bar?.access_code) return false

  const token = cookies().get(sessionCookieName(barId))?.value
  if (!token) return false

  return token === computeSessionToken(barId, bar.access_code)
}
