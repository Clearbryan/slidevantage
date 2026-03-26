import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User, Plan, Payment } from '@/models'
import { BillingClient } from './BillingClient'
export const metadata: Metadata = { title: 'Subscription & Billing' }

export default async function BillingPage() {
  const session = await auth()
  const me = session?.user as any
  await connectDB()

  const [user, plans, payments] = await Promise.all([
    User.findById(me?.id)
      .populate({ path:'subscription', populate:{ path:'plan', select:'name type interval priceUSD priceZWL features maxDownloadsPerMonth' } })
      .lean(),
    Plan.find({ isActive:true }).sort({ priceUSD:1 }).lean(),
    Payment.find({ user:me?.id, status:'succeeded' }).sort({ createdAt:-1 }).limit(10).lean(),
  ])

  return (
    <Suspense>
      <BillingClient
        user={JSON.parse(JSON.stringify(user??{}))}
        plans={JSON.parse(JSON.stringify(plans))}
        payments={JSON.parse(JSON.stringify(payments))}
      />
    </Suspense>
  )
}
