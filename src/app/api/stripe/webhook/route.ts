import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { connectDB } from '@/lib/db'
import { User, Subscription, Payment, Plan } from '@/models'
import type Stripe from 'stripe'

// Raw body required for Stripe signature verification
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  await connectDB()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutCompleted(session)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await handleSubscriptionCancelled(sub)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentFailed(invoice)
      break
    }
    default:
      // Unhandled event type — ignore
      break
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId
  const planId = session.metadata?.planId

  if (!userId || !planId) {
    console.error('Webhook: missing userId or planId in session metadata', session.id)
    return
  }

  const plan = await Plan.findById(planId).lean()
  if (!plan) {
    console.error('Webhook: plan not found', planId)
    return
  }

  // Fetch full subscription from Stripe to get period dates
  const stripeSubId = session.subscription as string
  let periodStart   = new Date()
  let periodEnd     = new Date()

  if (stripeSubId) {
    const stripeSub   = await stripe.subscriptions.retrieve(stripeSubId)
    periodStart       = new Date(stripeSub.current_period_start * 1000)
    periodEnd         = new Date(stripeSub.current_period_end   * 1000)
  } else {
    // One-time payment (shouldn't happen with subscription mode, but handle it)
    periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + ((plan as any).interval === 'annual' ? 12 : 1))
  }

  // Create Subscription record
  const sub = await Subscription.create({
    user:                 userId,
    plan:                 planId,
    status:               'active',
    paymentProvider:      'stripe',
    priceAtPurchase:      (session.amount_total ?? 0) / 100,
    currency:             (session.currency ?? 'usd').toUpperCase(),
    stripeSubscriptionId: stripeSubId,
    currentPeriodStart:   periodStart,
    currentPeriodEnd:     periodEnd,
  })

  // Create Payment record
  await Payment.create({
    user:             userId,
    subscription:     sub._id,
    amount:           (session.amount_total ?? 0) / 100,
    currency:         (session.currency ?? 'usd').toUpperCase(),
    provider:         'stripe',
    status:           'succeeded',
    description:      `${(plan as any).name} subscription`,
    stripePaymentId:  session.payment_intent as string,
  })

  // Upgrade user to subscriber role and link subscription
  await User.findByIdAndUpdate(userId, {
    subscription: sub._id,
    role:         'subscriber',
  })
}

async function handleSubscriptionCancelled(stripeSub: Stripe.Subscription) {
  const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id })
  if (!sub) return

  await Subscription.findByIdAndUpdate(sub._id, {
    status:      'cancelled',
    cancelledAt: new Date(),
  })

  // Downgrade user role if they have no other active subscription
  const otherActive = await Subscription.findOne({
    user:   sub.user,
    status: 'active',
    _id:    { $ne: sub._id },
  })

  if (!otherActive) {
    await User.findByIdAndUpdate(sub.user, { role: 'free' })
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: invoice.subscription as string },
    { status: 'expired' }
  )
}
