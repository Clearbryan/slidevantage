import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { Banner } from '@/models'
import { BannersClient } from './BannersClient'
export const metadata: Metadata = { title: 'Banners' }

export default async function BannersPage() {
  const session = await auth()
  if (!['admin','super_admin'].includes((session?.user as any)?.role)) redirect('/dashboard')
  await connectDB()
  const banners = await Banner.find().sort({ order:1 }).lean()
  return (
    <Suspense>
      <BannersClient data={JSON.parse(JSON.stringify(banners))}/>
    </Suspense>
  )
}
