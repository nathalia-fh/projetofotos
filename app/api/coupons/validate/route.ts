import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { code, barId } = (await req.json()) as { code: string; barId: string }

    if (!code || !barId) {
      return NextResponse.json({ valid: false, error: 'missing_fields' }, { status: 400 })
    }

    const { data: coupon } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('bar_id', barId)
      .maybeSingle()

    if (!coupon || coupon.is_used) {
      return NextResponse.json({ valid: false })
    }

    await supabaseAdmin.from('coupons').update({ is_used: true }).eq('id', coupon.id)

    return NextResponse.json({ valid: true, coupon })
  } catch (err) {
    return NextResponse.json({ valid: false, error: 'server_error' }, { status: 500 })
  }
}
