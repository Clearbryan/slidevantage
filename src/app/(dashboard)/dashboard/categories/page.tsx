import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { Category } from '@/models'
import { CategoriesClient } from './CategoriesClient'
export const metadata: Metadata = { title: 'Categories' }

export default async function CategoriesPage() {
  const session = await auth()
  if (!['admin','super_admin'].includes((session?.user as any)?.role)) redirect('/dashboard')
  await connectDB()
  const cats = await Category.find().sort({ order:1 }).lean()
  return (
    <Suspense>
      <CategoriesClient data={JSON.parse(JSON.stringify(cats))}/>
    </Suspense>
  )
}
