import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { Template, User } from '@/models'
import { auth } from '@/lib/auth'
import { TemplateViewClient } from '@/components/templates/TemplateViewClient'
import { PublicNav, PublicFooter } from '@/components/public/PublicNav'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  await connectDB()
  const t = await Template.findOne({
    $or: [{ slug }, { _id: slug.match(/^[0-9a-f]{24}$/i) ? slug : null }],
    status: 'published',
  }).select('title description').lean()
  if (!t) return { title: 'Template not found' }
  return {
    title: `${(t as any).title} — SlideVantage`,
    description: (t as any).description,
  }
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params
  await connectDB()

  const template = await Template.findOne({
    status: 'published',
    $or: [
      { slug },
      ...(slug.match(/^[0-9a-f]{24}$/i) ? [{ _id: slug }] : []),
    ],
  }).populate('category', 'name slug').lean()

  if (!template) notFound()

  const session = await auth()
  const me      = session?.user as any
  const isAdmin = ['admin', 'super_admin'].includes(me?.role)
  const isSub   = me?.role === 'subscriber'

  const userDoc = me?.id
    ? await User.findById(me.id).select('favourites').lean()
    : null
  const isFavourited = (userDoc as any)?.favourites?.some(
    (f: any) => f.toString() === (template as any)._id.toString()
  ) ?? false

  const rawUrls = (template as any).fileUrls
  const fileUrls: Record<string, string> = rawUrls instanceof Map
    ? Object.fromEntries(rawUrls)
    : typeof rawUrls === 'object' && rawUrls !== null ? rawUrls : {}

  return (
    <div className="public-layout">
      <PublicNav />
      <main>
      <TemplateViewClient
        template={JSON.parse(JSON.stringify({ ...template, fileUrls }))}
        isModal={false}
        isFavourited={isFavourited}
        canDownloadFree={!!me}
        canDownloadPremium={isAdmin || isSub}
        isLoggedIn={!!me}
      />
      </main>
      <PublicFooter />
    </div>
  )
}
