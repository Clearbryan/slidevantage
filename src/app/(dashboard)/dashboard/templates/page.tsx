import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Template, Category, User } from '@/models'
import { TemplatesClient } from './TemplatesClient'
import { TemplateBrowse } from './TemplateBrowse'
export const metadata: Metadata = { title: 'Templates' }

interface Props {
  searchParams: Promise<{q?:string;status?:string;tier?:string;category?:string;page?:string}>
}

export default async function TemplatesPage({ searchParams }: Props) {
  const session  = await auth()
  const me       = session?.user as any
  const isAdmin  = ['admin','super_admin'].includes(me?.role)
  const p        = await searchParams
  const page     = Math.max(1, Number(p.page ?? 1))
  const pageSize = isAdmin ? 20 : 24

  await connectDB()

  const filter: Record<string,unknown> = {}
  if (!isAdmin) filter.status = 'published'
  else if (p.status) filter.status = p.status
  if (p.q)        filter.$or = [{ title:{$regex:p.q,$options:'i'} }, { tags:{$regex:p.q,$options:'i'} }]
  if (p.tier)     filter.tier = p.tier
  if (p.category) filter.category = p.category

  const [docs, total, cats] = await Promise.all([
    Template.find(filter)
      .populate('category', 'name slug')
      .sort('-createdAt')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Template.countDocuments(filter),
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
  ])

  const data       = JSON.parse(JSON.stringify(docs))
  const categories = JSON.parse(JSON.stringify(cats))

  if (!isAdmin) {
    // Fetch user's existing favourites so hearts show correctly
    const userDoc = await User.findById(me?.id).select('favourites').lean()
    const favouriteIds: string[] = (userDoc as any)?.favourites?.map((f: any) => f.toString()) ?? []

    return (
      <Suspense>
        <TemplateBrowse
          data={data} total={total} page={page} pageSize={pageSize}
          categories={categories} userRole={me?.role}
          favouriteIds={favouriteIds}
        />
      </Suspense>
    )
  }

  return (
    <Suspense>
      <TemplatesClient data={data} total={total} page={page} pageSize={pageSize} categories={categories}/>
    </Suspense>
  )
}
