'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface ShellProps {
  children: React.ReactNode
  name: string
  email: string
  role: string
}

export function DashboardShell({ children, name, email, role }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Sidebar
        role={role}
        name={name}
        email={email}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Topbar
        name={name}
        role={role}
        onMenuClick={() => setSidebarOpen(v => !v)}
      />
      <main className="main">
        {children}
      </main>
    </>
  )
}
