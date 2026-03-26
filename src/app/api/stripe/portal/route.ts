import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { connectDB } from '@/lib/db'
import { Subscription } from '@/models'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = (session.user as any).id
    const sub = await Subscription.findOne({ user: userId, status: 'active' }).lean()

    if (!sub || !(sub as any).stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active Stripe subscription found' }, { status: 404 })
    }

    // Get Stripe subscription to find the customer ID
    const stripeSub = await stripe.subscriptions.retrieve((sub as any).stripeSubscriptionId)
    const customerId = stripeSub.customer as string

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${appUrl}/dashboard/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err: any) {
    console.error('Billing portal error:', err)
    return NextResponse.json({ error: err.message || 'Failed to open billing portal' }, { status: 500 })
  }
}
