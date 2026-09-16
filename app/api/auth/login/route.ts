import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { computeSessionToken, sessionCookieName } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { barId, code } = (await req.json()) as { barId: string; code: string }

    if (!barId || !code) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
    }

    const { data: bar } = await supabaseAdmin
      .from('bars')
      .select('access_code')
      .eq('id', barId)
      .maybeSingle()

    if (!bar?.access_code || bar.access_code.toUpperCase() !== code.trim().toUpperCase()) {
      return NextResponse.json({ ok: false, error: 'invalid_code' }, { status: 401 })
    }

    const token = computeSessionToken(barId, bar.access_code)
    const res = NextResponse.json({ ok: true })
    res.cookies.set(sessionCookieName(barId), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    })
    return res
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
