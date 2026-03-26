import type { Metadata } from 'next'
import { connectDB } from '@/lib/db'
import { Plan } from '@/models'
import { auth } from '@/lib/auth'
import { PricingClient } from './PricingClient'
import { PublicNav, PublicFooter } from '@/components/public/PublicNav'

export const metadata: Metadata = {
  title: 'Pricing — SlideVantage',
  description: 'Simple, transparent pricing. Start free and upgrade when you need more.',
}

export default async function PricingPage() {
  await connectDB()
  const session = await auth()
  const me      = session?.user as any

  const plans = await Plan.find({ isActive: true }).sort({ priceUSD: 1 }).lean()

  return (
    <div className="public-layout">
      <PublicNav />
      <main>
      <PricingClient
      plans={JSON.parse(JSON.stringify(plans))}
      currentPlanId={me?.subscription?.plan?.toString() ?? null}
      isLoggedIn={!!me}
      userRole={me?.role ?? 'free'}
    />
      </main>
      <PublicFooter />
    </div>
  )
}
