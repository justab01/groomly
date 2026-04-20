import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia' as any,
  })
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSuccess(paymentIntent)
      break
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailed(failedIntent)
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId, businessId } = paymentIntent.metadata

  if (bookingId) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        deposit_paid_cents: paymentIntent.amount,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', bookingId)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId } = paymentIntent.metadata

  if (bookingId) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await supabase
      .from('bookings')
      .update({
        payment_status: 'failed',
      })
      .eq('id', bookingId)
  }
}
