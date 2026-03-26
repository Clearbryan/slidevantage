import type { Metadata } from 'next'
import { Suspense } from 'react'
import { connectDB } from '@/lib/db'
import { Template, Category } from '@/models'
import { PublicTemplatesClient } from './PublicTemplatesClient'
import { PublicNav, PublicFooter } from '@/components/public/PublicNav'

export const metadata: Metadata = {
  title: 'Templates — SlideVantage',
  description: 'Browse and download professional presentation templates for PowerPoint, Google Slides, and Keynote.',
}

interface Props {
  searchParams: Promise<{ q?: string; tier?: string; category?: string; page?: string }>
}

export default async function PublicTemplatesPage({ searchParams }: Props) {
  const p        = await searchParams
  const page     = Math.max(1, Number(p.page ?? 1))
  const pageSize = 24

  await connectDB()

  const filter: Record<string, unknown> = { status: 'published' }
  if (p.q)        filter.$or = [{ title: { $regex: p.q, $options: 'i' } }, { tags: { $regex: p.q, $options: 'i' } }]
  if (p.tier)     filter.tier = p.tier
  if (p.category) filter.category = p.category

  const [docs, total, cats] = await Promise.all([
    Template.find(filter)
      .populate('category', 'name slug')
      .sort({ downloadCount: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Template.countDocuments(filter),
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
  ])

  return (
    <div className="public-layout">
      <PublicNav />
      <main>
      <Suspense>
      <PublicTemplatesClient
        data={JSON.parse(JSON.stringify(docs))}
        total={total} page={page} pageSize={pageSize}
        categories={JSON.parse(JSON.stringify(cats))}
      />
    </Suspense>
      </main>
      <PublicFooter />
    </div>
  )
}
