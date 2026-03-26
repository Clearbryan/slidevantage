'use server'

import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Template, Download, User, Subscription } from '@/models'
import { revalidatePath } from 'next/cache'

export async function downloadTemplate(templateId: string, format: string) {
  const session = await auth()
  if (!session?.user) throw new Error('You must be logged in to download templates')

  await connectDB()
  const userId = (session.user as any).id

  const template = await Template.findById(templateId).lean()
  if (!template)                          throw new Error('Template not found')
  if ((template as any).status !== 'published') throw new Error('Template is not available')

  const user = await User.findById(userId)
    .populate({ path: 'subscription', populate: { path: 'plan', select: 'maxDownloadsPerMonth' } })
    .lean()
  if (!user) throw new Error('User not found')

  const isAdmin      = ['admin', 'super_admin'].includes((session.user as any).role)
  const sub          = (user as any).subscription
  const isSubscriber = sub?.status === 'active' && (user as any).role === 'subscriber'

  if ((template as any).tier === 'premium' && !isSubscriber && !isAdmin) {
    throw new Error('Premium templates require an active Pro subscription.')
  }

  // Monthly download limit for free users
  if (!isAdmin && !isSubscriber) {
    const limit = sub?.plan?.maxDownloadsPerMonth
    if (limit !== null && limit !== undefined) {
      const now   = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const count = await Download.countDocuments({ user: userId, downloadedAt: { $gte: start } })
      if (count >= limit) {
        throw new Error(`You've reached your ${limit} downloads/month limit. Upgrade to Pro for unlimited downloads.`)
      }
    }
  }

  // Validate format has a file
  const fileUrls = (template as any).fileUrls
  let fileUrl: string | undefined
  if (fileUrls instanceof Map)                    fileUrl = fileUrls.get(format)
  else if (typeof fileUrls === 'object' && fileUrls) fileUrl = fileUrls[format]

  if (!fileUrl) throw new Error(`Format "${format}" is not available for this template`)

  // Check if this user has already downloaded this template+format combo
  // If yes: just return the URL (don't create another record)
  const existing = await Download.findOne({ user: userId, template: templateId, format })
  if (!existing) {
    await Download.create({ user: userId, template: templateId, format, downloadedAt: new Date() })
    await Template.findByIdAndUpdate(templateId, { $inc: { downloadCount: 1 } })
    await User.findByIdAndUpdate(userId, { $inc: { totalDownloads: 1 } })
    revalidatePath('/dashboard/my-downloads')
    revalidatePath('/dashboard')
  }

  return { url: fileUrl }
}

export async function deleteDownload(downloadId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  await connectDB()
  const userId = (session.user as any).id
  // Only delete records belonging to this user
  await Download.findOneAndDelete({ _id: downloadId, user: userId })
  revalidatePath('/dashboard/my-downloads')
  return { success: true }
}

export async function clearAllDownloads() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  await connectDB()
  const userId = (session.user as any).id
  await Download.deleteMany({ user: userId })
  revalidatePath('/dashboard/my-downloads')
  return { success: true }
}
