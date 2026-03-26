import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Template, User } from '@/models'
import { TemplateViewClient } from '@/components/templates/TemplateViewClient'

interface Props { params: Promise<{ id: string }> }

export default async function TemplateModalPage({ params }: Props) {
  const { id } = await params
  await connectDB()

  const template = await Template.findOne({
    _id: id.match(/^[0-9a-f]{24}$/i) ? id : undefined,
    status: 'published',
  }).populate('category', 'name').lean()

  if (!template) notFound()

  const session = await auth()
  const me      = session?.user as any
  const isSub   = me?.role === 'subscriber'
  const isAdmin = ['admin', 'super_admin'].includes(me?.role)

  // Check if already favourited
  const userDoc = me?.id
    ? await User.findById(me.id).select('favourites').lean()
    : null
  const isFavourited = (userDoc as any)?.favourites?.some(
    (f: any) => f.toString() === (template as any)._id.toString()
  ) ?? false

  // Build fileUrls
  const rawUrls = (template as any).fileUrls
  const fileUrls: Record<string, string> = rawUrls instanceof Map
    ? Object.fromEntries(rawUrls)
    : typeof rawUrls === 'object' && rawUrls ? rawUrls : {}

  return (
    <TemplateViewClient
      template={JSON.parse(JSON.stringify({ ...template, fileUrls }))}
      isModal
      isFavourited={isFavourited}
      canDownloadFree={!!me}
      canDownloadPremium={isAdmin || isSub}
      isLoggedIn={!!me}
    />
  )
}
