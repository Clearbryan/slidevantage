import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Admin, User } from '@/models'
import { AccountClient } from './AccountClient'
export const metadata: Metadata = { title: 'Account' }

export default async function AccountPage() {
  const session = await auth()
  const me = session?.user as any
  await connectDB()
  const admin = await Admin.findById(me?.id).select('-passwordHash').lean()
  const user  = admin ?? await User.findById(me?.id).select('-passwordHash').lean()
  const data  = JSON.parse(JSON.stringify(user??{}))
  return (
    <Suspense>
      <AccountClient name={data.name??me?.name??''} email={data.email??me?.email??''} role={me?.role??''} phone={data.phone??''} country={data.country??''}/>
    </Suspense>
  )
}
