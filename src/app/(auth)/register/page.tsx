import type { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Template, User } from '@/models';

export const metadata: Metadata = { title: 'Create account — SlideVantage' };

export default async function RegisterPage() {
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
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: 350,
            height: 350,
            background:
              'radial-gradient(circle, rgba(201,162,39,.1) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 480,
            height: 480,
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
            width: 340,
            height: 340,
            border: '1px solid rgba(201,162,39,.05)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

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
            Get started
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
            Join thousands of
            <br />
            <span style={{ color: 'var(--gold)' }}>presentation</span>
            <br />
            professionals.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,.45)',
              lineHeight: 1.75,
              maxWidth: 290,
            }}
          >
            Free account. Instant access. No credit card required. Start
            downloading templates in seconds.
          </p>
        </div>

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
            ['Free', 'to start'],
            [fmt(templateCount), 'Templates'],
            [fmt(userCount), 'Members'],
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
          <div style={{ marginBottom: 28 }}>
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
              Create account
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: 'var(--ink-4)',
                textAlign: 'center',
              }}
            >
              Free forever — no credit card needed
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
