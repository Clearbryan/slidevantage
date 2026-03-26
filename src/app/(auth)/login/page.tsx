import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Template, User } from '@/models';

export const metadata: Metadata = { title: 'Sign in — SlideVantage' };

export default async function LoginPage() {
  await connectDB();
  const [templateCount, userCount, dlAgg] = await Promise.all([
    Template.countDocuments({ status: 'published' }),
    User.countDocuments(),
    Template.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadCount' } } },
    ]),
  ]);
  const downloadCount = dlAgg[0]?.total ?? 0;
  function fmt(n: number) {
    return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+` : `${n}+`;
  }
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left panel - decorative */}
      <div
        className="auth-left"
        style={{
          width: '50%',
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(145deg, #030329 0%, #07073d 40%, #0c0c5a 70%, #030329 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '36px 44px',
        }}
      >
        {/* Grid lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(201,162,39,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(201,162,39,.06) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />
        {/* Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: 400,
            height: 400,
            background:
              'radial-gradient(circle, rgba(201,162,39,.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-5%',
            left: '-5%',
            width: 320,
            height: 320,
            background:
              'radial-gradient(circle, rgba(3,3,41,.0) 0%, rgba(201,162,39,.06) 50%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 500,
            height: 500,
            border: '1px solid rgba(201,162,39,.07)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 360,
            height: 360,
            border: '1px solid rgba(201,162,39,.05)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              background: 'var(--gold)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#030329">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--gold)',
              letterSpacing: '-0.02em',
            }}
          >
            SlideVantage
          </span>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(201,162,39,.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: 16,
            }}
          >
            Welcome back
          </div>
          <h1
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.04em',
              lineHeight: 1.15,
              marginBottom: 18,
            }}
          >
            Every great pitch
            <br />
            starts with a<br />
            <span style={{ color: 'var(--gold)' }}>great slide.</span>
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,.45)',
              lineHeight: 1.75,
              maxWidth: 290,
            }}
          >
            Professional presentation templates trusted by thousands of business
            teams worldwide.
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            gap: 36,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,.08)',
          }}
        >
          {[
            [fmt(templateCount), 'Templates'],
            [fmt(userCount), 'Members'],
            [fmt(downloadCount), 'Downloads'],
          ].map(([v, l]) => (
            <div key={l}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--gold)',
                  letterSpacing: '-0.03em',
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'rgba(255,255,255,.3)',
                  marginTop: 3,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div
        className="auth-right"
        style={{
          width: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 340 }}>
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--ink)',
                letterSpacing: '-0.03em',
                marginBottom: 6,
                textAlign: 'center',
              }}
            >
              Sign in
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: 'var(--ink-4)',
                textAlign: 'center',
              }}
            >
              Enter your credentials to continue
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
