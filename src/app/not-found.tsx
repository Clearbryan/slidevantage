import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', padding: '20px',
      fontFamily: 'var(--font-inter), system-ui, sans-serif',
      background: '#fafafa',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ fontSize: 48, fontWeight: 600, color: '#e4e4e7', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 16 }}>
          404
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Page not found
        </div>
        <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 24, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved.
        </div>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 34, padding: '0 16px',
            background: 'var(--brand)', color: '#fff',
            borderRadius: 4, fontSize: 13, fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}
