import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'SlideVantage', template: '%s · SlideVantage' },
  description: 'Professional presentation templates platform',
  robots: 'noindex,nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: 'var(--font-sans)',
                fontSize: '12.5px',
                borderRadius: '4px',
                border: '1px solid #e4e4e7',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                padding: '10px 14px',
                color: 'var(--ink)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
