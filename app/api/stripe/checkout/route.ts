import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { barName, email, whatsapp } = (await req.json()) as {
      barName: string
      email: string
      whatsapp: string
    }

    if (!barName || !email || !whatsapp) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: process.env.STRIPE_PRICE_ID
        ? [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }]
        : [
            {
              price_data: {
                currency: 'brl',
                product_data: { name: 'REVELA - Assinatura Mensal' },
                unit_amount: 14900,
                recurring: { interval: 'month' },
              },
              quantity: 1,
            },
          ],
      metadata: { barName, whatsapp },
      success_url: `${baseUrl}/criar-bar?success=true`,
      cancel_url: `${baseUrl}/criar-bar?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
