import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Download } from '@/models'
import { MyDownloadsClient } from './MyDownloadsClient'

export const metadata: Metadata = { title: 'My Downloads' }

export default async function MyDownloadsPage() {
  const session = await auth()
  const userId  = (session?.user as any)?.id

  let downloads: any[] = []
  try {
    await connectDB()
    downloads = await Download.find({ user: userId })
      .populate({ path: 'template', select: 'title thumbnailUrl tier format category', populate: { path: 'category', select: 'name' } })
      .sort({ downloadedAt: -1 })
      .limit(100)
      .lean()
  } catch {}

  return (
    <Suspense>
      <MyDownloadsClient data={JSON.parse(JSON.stringify(downloads))} />
    </Suspense>
  )
}
