import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { connectDB } from '@/lib/db'
import { Plan, User } from '@/models'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 })
    }

    const { planId, promoCode } = await req.json()
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    await connectDB()

    const plan = await Plan.findById(planId).lean()
    if (!plan || !(plan as any).isActive) {
      return NextResponse.json({ error: 'Plan not found or inactive' }, { status: 404 })
    }

    if (!(plan as any).stripePriceId) {
      return NextResponse.json({ error: 'This plan is not configured for Stripe payments. Please contact support.' }, { status: 400 })
    }

    const userId = (session.user as any).id
    const user   = await User.findById(userId).select('email name surname').lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const checkoutParams: any = {
      mode:               'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price:    (plan as any).stripePriceId,
        quantity: 1,
      }],
      customer_email:    (user as any).email,
      client_reference_id: userId,
      metadata: {
        userId,
        planId:    planId.toString(),
        planName:  (plan as any).name,
      },
      success_url: `${appUrl}/dashboard/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/dashboard/billing?cancelled=1`,
      subscription_data: {
        metadata: { userId, planId: planId.toString() },
      },
    }

    // Apply promo code if provided
    if (promoCode) {
      const promotionCodes = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 })
      if (promotionCodes.data.length > 0) {
        checkoutParams.discounts = [{ promotion_code: promotionCodes.data[0].id }]
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams)

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create checkout session' }, { status: 500 })
  }
}
