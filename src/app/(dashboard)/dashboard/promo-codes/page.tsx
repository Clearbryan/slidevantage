import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { PromoCode } from '@/models'
import { PromoCodesClient } from './PromoCodesClient'
export const metadata: Metadata = { title: 'Promo Codes' }

interface Props { searchParams: Promise<{page?:string}> }

export default async function PromoCodesPage({ searchParams }: Props) {
  const session = await auth()
  if (!['admin','super_admin'].includes((session?.user as any)?.role)) redirect('/dashboard')
  const p = await searchParams
  const page = Math.max(1, Number(p.page??1))
  const pageSize = 20
  await connectDB()
  const [docs, total] = await Promise.all([
    PromoCode.find().sort({ createdAt:-1 }).skip((page-1)*pageSize).limit(pageSize).lean(),
    PromoCode.countDocuments(),
  ])
  return <Suspense><PromoCodesClient data={JSON.parse(JSON.stringify(docs))} total={total} page={page} pageSize={pageSize}/></Suspense>
}
