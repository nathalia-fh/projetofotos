import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWhatsApp, generateNightReport } from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: bars } = await supabaseAdmin.from('bars').select('*')

  if (!bars) {
    return NextResponse.json({ ok: true, processed: 0 })
  }

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  let processed = 0

  for (const bar of bars) {
    const [{ count: photos }, { count: coupons }, { count: flirts }] = await Promise.all([
      supabaseAdmin
        .from('photos')
        .select('id', { count: 'exact', head: true })
        .eq('bar_id', bar.id)
        .gte('created_at', startOfDay.toISOString()),
      supabaseAdmin
        .from('coupons')
        .select('id', { count: 'exact', head: true })
        .eq('bar_id', bar.id)
        .gte('created_at', startOfDay.toISOString()),
      supabaseAdmin
        .from('flirts')
        .select('id', { count: 'exact', head: true })
        .eq('bar_id', bar.id)
        .gte('created_at', startOfDay.toISOString()),
    ])

    const totalPhotos = photos ?? 0
    const totalCoupons = coupons ?? 0
    const totalFlirts = flirts ?? 0

    if (totalPhotos > 0 && bar.owner_whatsapp) {
      const report = generateNightReport(bar.name, {
        photos: totalPhotos,
        coupons: totalCoupons,
        flirts: totalFlirts,
      })
      await sendWhatsApp(bar.owner_whatsapp, report)
      processed++
    }
  }

  return NextResponse.json({ ok: true, processed })
}
