import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { Subscription, Plan } from '@/models'
import { SubscriptionsClient } from './SubscriptionsClient'
export const metadata: Metadata = { title: 'Subscriptions' }

interface Props { searchParams: Promise<{status?:string;provider?:string;view?:string;page?:string}> }

export default async function SubscriptionsPage({ searchParams }: Props) {
  const session = await auth()
  const me = session?.user as any
  if (!['admin','super_admin'].includes(me?.role)) redirect('/dashboard')
  const p = await searchParams
  const page = Math.max(1, Number(p.page??1))
  const pageSize = 20
  await connectDB()
  const filter: Record<string,unknown> = {}
  if (p.status)   filter.status = p.status
  if (p.provider) filter.paymentProvider = p.provider
  const [docs, total, plans] = await Promise.all([
    Subscription.find(filter).populate('user','name surname email').populate('plan','name type interval priceUSD').sort({createdAt:-1}).skip((page-1)*pageSize).limit(pageSize).lean(),
    Subscription.countDocuments(filter),
    Plan.find().sort({priceUSD:1}).lean(),
  ])
  return (
    <Suspense>
      <SubscriptionsClient
        data={JSON.parse(JSON.stringify(docs))}
        total={total} page={page} pageSize={pageSize}
        plans={JSON.parse(JSON.stringify(plans))}
        view={p.view??'subscribers'}
        isSuperAdmin={me?.role==='super_admin'}
      />
    </Suspense>
  )
}
