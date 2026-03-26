import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { Payment } from '@/models'
import { PaymentsClient } from './PaymentsClient'
export const metadata: Metadata = { title: 'Payments' }

interface Props { searchParams: Promise<{status?:string;provider?:string;page?:string}> }

export default async function PaymentsPage({ searchParams }: Props) {
  const session = await auth()
  if (!['admin','super_admin'].includes((session?.user as any)?.role)) redirect('/dashboard')
  const p = await searchParams
  const page = Math.max(1, Number(p.page??1))
  const pageSize = 20
  await connectDB()
  const filter: Record<string,unknown> = {}
  if (p.status)   filter.status   = p.status
  if (p.provider) filter.provider = p.provider
  const [docs, total] = await Promise.all([
    Payment.find(filter).populate('user','name surname email').sort({ createdAt:-1 }).skip((page-1)*pageSize).limit(pageSize).lean(),
    Payment.countDocuments(filter),
  ])
  return <Suspense><PaymentsClient data={JSON.parse(JSON.stringify(docs))} total={total} page={page} pageSize={pageSize}/></Suspense>
}
