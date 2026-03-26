import type { Metadata } from 'next'
import { Suspense } from 'react'
import { connectDB } from '@/lib/db'
import { User } from '@/models'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { UsersClient } from './UsersClient'
export const metadata: Metadata = { title: 'Users' }

interface Props { searchParams: Promise<{ q?:string; status?:string; plan?:string; page?:string }> }

export default async function UsersPage({ searchParams }: Props) {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!['admin','super_admin'].includes(role)) redirect('/dashboard')

  const p        = await searchParams
  const page     = Math.max(1, Number(p.page??1))
  const pageSize = 20

  await connectDB()
  const filter: Record<string,unknown> = {}
  if (p.q) filter.$or = [
    { name:    { $regex: p.q, $options:'i' } },
    { surname: { $regex: p.q, $options:'i' } },
    { email:   { $regex: p.q, $options:'i' } },
  ]
  if (p.status==='active')    filter.isActive = true
  if (p.status==='suspended') filter.isActive = false
  if (p.plan==='free')        filter.role = 'free'
  if (p.plan==='subscriber')  filter.role = 'subscriber'

  const [docs, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .populate({ path:'subscription', populate:{ path:'plan', select:'name type interval priceUSD' } })
      .sort({ createdAt:-1 })
      .skip((page-1)*pageSize)
      .limit(pageSize)
      .lean(),
    User.countDocuments(filter),
  ])

  return (
    <Suspense>
      <UsersClient
        data={JSON.parse(JSON.stringify(docs))}
        total={total} page={page} pageSize={pageSize}
      />
    </Suspense>
  )
}
