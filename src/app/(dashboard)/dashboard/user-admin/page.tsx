import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { Admin } from '@/models'
import { UserAdminClient } from './UserAdminClient'
export const metadata: Metadata = { title: 'Admin Users' }

export default async function UserAdminPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== 'super_admin') redirect('/dashboard')
  await connectDB()
  const admins = await Admin.find().select('-passwordHash').lean()
  return (
    <Suspense>
      <UserAdminClient data={JSON.parse(JSON.stringify(admins))} currentId={(session!.user as any).id}/>
    </Suspense>
  )
}
