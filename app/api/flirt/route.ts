import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

function containsProfanity(text: string): boolean {
  const normalized = text.toLowerCase()
  return BLOCKED_WORDS.some((word) => normalized.includes(word))
}

export async function POST(req: NextRequest) {
  try {
    const { barId, from, to, message } = (await req.json()) as {
      barId: string
      from: number
      to: number
      message: string
    }

    if (!barId || from === undefined || to === undefined || !message) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
    }

    if (containsProfanity(message)) {
      return NextResponse.json({ ok: false, error: 'content_blocked' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('flirts')
      .insert({
        bar_id: barId,
        from_table: from,
        to_table: to,
        message,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, flirt: data })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const barId = searchParams.get('barId')
  const table = searchParams.get('table')

  if (!barId || !table) {
    return NextResponse.json({ flirts: [] })
  }

  const { data } = await supabaseAdmin
    .from('flirts')
    .select('*')
    .eq('bar_id', barId)
    .eq('to_table', Number(table))
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ flirts: data ?? [] })
}
