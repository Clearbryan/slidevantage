import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user as any
  return (
    <DashboardShell name={user.name ?? 'User'} email={user.email ?? ''} role={user.role ?? 'free'}>
      {children}
      {modal}
    </DashboardShell>
  )
}
