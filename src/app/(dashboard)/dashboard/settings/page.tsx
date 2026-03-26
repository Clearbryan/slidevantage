import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SettingsClient } from './SettingsClient'
export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await auth()
  const me = session?.user as any
  if (!['admin','super_admin'].includes(me?.role)) redirect('/dashboard')
  return (
    <Suspense>
      <SettingsClient role={me.role}/>
    </Suspense>
  )
}
