import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWhatsApp, generateWelcomeMessage } from '@/lib/whatsapp'

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const random = Math.random().toString(36).slice(2, 6)
  return `${base}-${random}`
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const barName = session.metadata?.barName ?? 'Bar sem nome'
    const whatsapp = session.metadata?.whatsapp ?? null

    const { data: bar } = await supabaseAdmin
      .from('bars')
      .insert({
        name: barName,
        slug: slugify(barName),
        owner_whatsapp: whatsapp,
        stripe_customer_id: (session.customer as string) ?? null,
      })
      .select()
      .single()

    if (bar?.owner_whatsapp) {
      await sendWhatsApp(bar.owner_whatsapp, generateWelcomeMessage(bar.name, bar.id, bar.access_code))
    }
  }

  return NextResponse.json({ received: true })
}
