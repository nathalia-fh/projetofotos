import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { moderateImage, calculateAestheticScore } from '@/lib/ia'

const COUPON_TYPES = ['10off', 'drink', 'top']

function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `REVELA-${code}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image, barId, table, filter } = body as {
      image: string
      barId: string
      table: number
      filter?: string
    }

    if (!image || !barId || table === undefined) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
    }

    const { approved } = moderateImage(image)

    if (!approved) {
      return NextResponse.json({ ok: true, moderated: true })
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const path = `${barId}/${table}-${Date.now()}.jpg`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('photos')
      .upload(path, buffer, { contentType: 'image/jpeg' })

    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 })
    }

    const aestheticScore = calculateAestheticScore()

    const { data: photo, error: insertError } = await supabaseAdmin
      .from('photos')
      .insert({
        bar_id: barId,
        table_number: table,
        storage_path: path,
        is_approved: true,
        aesthetic_score: aestheticScore,
        filter_used: filter ?? 'auto',
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 })
    }

    const { count } = await supabaseAdmin
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .eq('bar_id', barId)
      .eq('table_number', table)

    let coupon = null
    if (count && count % 3 === 0) {
      const type = COUPON_TYPES[Math.floor(Math.random() * COUPON_TYPES.length)]
      const { data: couponData } = await supabaseAdmin
        .from('coupons')
        .insert({
          bar_id: barId,
          code: generateCouponCode(),
          table_number: table,
          type,
        })
        .select()
        .single()
      coupon = couponData
    }

    return NextResponse.json({ ok: true, photo, coupon })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
