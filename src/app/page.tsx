import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Template, Category, User, Banner, Plan } from '@/models';
import { ArrowRight, Download, Shield, Zap, Star, Check } from 'lucide-react';
import { PublicNav, PublicFooter } from '@/components/public/PublicNav';
import { BannerCarousel } from '@/components/public/BannerCarousel';

export const metadata: Metadata = {
  title: 'SlideVantage — Professional Presentation Templates',
  description:
    'Download professional presentation templates for PowerPoint, Google Slides, and Keynote.',
};

export default async function HomePage() {
  await connectDB();
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const now = new Date();
  const [
    banners,
    featuredTemplates,
    freeTemplates,
    popularTemplates,
    categories,
    plans,
    userCount,
    dlCount,
  ] = await Promise.all([
    Banner.find({
      isActive: true,
      $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }],
      $and: [
        { $or: [{ endsAt: { $exists: false } }, { endsAt: { $gte: now } }] },
      ],
    })
      .sort({ order: 1 })
      .lean(),
    Template.find({ status: 'published', isFeatured: true })
      .populate('category', 'name')
      .sort({ downloadCount: -1 })
      .limit(8)
      .lean(),
    Template.find({ status: 'published', tier: 'free' })
      .populate('category', 'name')
      .sort({ downloadCount: -1 })
      .limit(8)
      .lean(),
    Template.find({ status: 'published' })
      .populate('category', 'name')
      .sort({ downloadCount: -1 })
      .limit(8)
      .lean(),
    Category.find({ isActive: true }).sort({ order: 1 }).limit(8).lean(),
    Plan.find({ isActive: true, priceUSD: { $gt: 0 } })
      .sort({ priceUSD: 1 })
      .lean(),
    User.countDocuments(),
    Template.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadCount' } } },
    ]),
  ]);

  const templateCount = await Template.countDocuments({ status: 'published' });
  const downloadCount = dlCount[0]?.total ?? 0;
  const showcase =
    featuredTemplates.length >= 3 ? featuredTemplates : popularTemplates;
  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+` : `${n}+`;

  // Inline template card — server component, no event handlers
  function TplCard({ t }: { t: any }) {
    return (
      <Link href={`/templates/${t._id}`} className="land-tpl-card">
        <div
          style={{
            width: '100%',
            paddingTop: '62.5%',
            position: 'relative',
            background: '#0d0d40',
            overflow: 'hidden',
          }}
        >
          {t.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.thumbnailUrl}
              alt={t.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2a2a5a',
                fontSize: 11,
              }}
            >
              No preview
            </div>
          )}
          {t.isFeatured && (
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10,
                fontWeight: 700,
                color: '#030329',
                background: 'var(--gold)',
                padding: '3px 8px',
                borderRadius: 3,
              }}
            >
              <Star size={9} fill="#030329" /> Featured
            </div>
          )}
          {t.tier === 'premium' && (
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--gold)',
                background: 'rgba(201,162,39,.15)',
                border: '1px solid rgba(201,162,39,.4)',
                padding: '2px 7px',
                borderRadius: 3,
              }}
            >
              Pro
            </div>
          )}
        </div>
        <div style={{ padding: '13px 14px' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 6,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {t.title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: '#8080b0',
                background: 'rgba(255,255,255,.06)',
                padding: '2px 7px',
                borderRadius: 3,
              }}
            >
              {t.category?.name ?? 'Uncategorised'}
            </span>
            <span
              style={{
                fontSize: 11,
                color: '#8080b0',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Download size={10} /> {(t.downloadCount || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="public-layout">
      <PublicNav />
      <main>
        {/* ── Banner carousel or hero ── */}
        {banners.length > 0 ? (
          <BannerCarousel banners={JSON.parse(JSON.stringify(banners))} />
        ) : (
          /* Fallback hero when no banners configured */
          <section
            style={{
              background:
                'linear-gradient(160deg, #030329 0%, #060660 50%, #030329 100%)',
              padding: '100px 40px 80px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Grid overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* Gold glow */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 600,
                height: 300,
                background:
                  'radial-gradient(ellipse, rgba(201,162,39,.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                maxWidth: 760,
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '5px 16px',
                  background: 'rgba(201,162,39,.1)',
                  border: '1px solid rgba(201,162,39,.3)',
                  borderRadius: 20,
                  fontSize: 12.5,
                  color: 'var(--gold)',
                  marginBottom: 28,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    background: 'var(--gold)',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                />
                {fmt(templateCount)} professional templates
              </div>
              <h1
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  marginBottom: 24,
                }}
              >
                Professional templates
                <br />
                <span style={{ color: 'var(--gold)' }}>
                  that actually get used.
                </span>
              </h1>
              <p
                style={{
                  fontSize: 18,
                  color: 'rgba(255,255,255,.65)',
                  lineHeight: 1.7,
                  maxWidth: 520,
                  margin: '0 auto 40px',
                }}
              >
                Download instantly. PowerPoint, Google Slides, and Keynote.
                Built for business, designed to impress.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href="/templates"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 50,
                    padding: '0 32px',
                    background: 'var(--gold)',
                    color: '#030329',
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Browse templates <ArrowRight size={16} />
                </Link>
                <Link
                  href={isLoggedIn ? '/dashboard' : '/register'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 50,
                    padding: '0 28px',
                    background: 'rgba(255,255,255,.08)',
                    border: '1px solid rgba(255,255,255,.2)',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {isLoggedIn ? 'Go to dashboard' : 'Sign up free'}
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Stats strip ── */}
        <div
          style={{
            background: 'var(--brand)',
            borderBottom: '1px solid rgba(255,255,255,.06)',
            borderTop: '1px solid rgba(255,255,255,.06)',
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              padding: '0 40px',
              display: 'flex',
              justifyContent: 'center',
              gap: 80,
            }}
          >
            {[
              { value: fmt(templateCount), label: 'Templates' },
              { value: fmt(userCount), label: 'Members' },
              { value: fmt(downloadCount), label: 'Downloads' },
              { value: '4', label: 'Formats' },
            ].map(({ value, label }) => (
              <div
                key={label}
                style={{ textAlign: 'center', padding: '20px 0' }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--gold)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,.4)',
                    marginTop: 3,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Categories ── */}
        {categories.length > 0 && (
          <section style={{ padding: '72px 40px', background: '#030329' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginBottom: 36,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      marginBottom: 10,
                    }}
                  >
                    Browse
                  </div>
                  <h2
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: '#fff',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.1,
                    }}
                  >
                    Find the perfect template
                  </h2>
                </div>
                <Link
                  href="/templates"
                  style={{
                    fontSize: 13,
                    color: 'var(--gold)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(201,162,39,.4)',
                    paddingBottom: 2,
                  }}
                >
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              <div
                className="cat-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
                  gap: 10,
                }}
              >
                {(categories as any[]).map((c) => (
                  <Link
                    key={c._id}
                    href={`/templates?category=${c._id}`}
                    className="land-cat-card"
                  >
                    <span style={{ fontSize: 28, flexShrink: 0 }}>
                      {c.icon ?? '📁'}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: '#fff',
                        }}
                      >
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'rgba(255,255,255,.4)',
                          marginTop: 2,
                        }}
                      >
                        {c.templateCount || 0} templates
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Featured / Popular templates ── */}
        {showcase.length > 0 && (
          <section
            style={{
              padding: '72px 40px',
              background: '#020220',
              borderTop: '1px solid #1a1a3e',
            }}
          >
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginBottom: 36,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      marginBottom: 10,
                    }}
                  >
                    {featuredTemplates.length >= 3
                      ? 'Handpicked'
                      : 'Most popular'}
                  </div>
                  <h2
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: '#fff',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {featuredTemplates.length >= 3
                      ? 'Featured templates'
                      : 'Popular templates'}
                  </h2>
                </div>
                <Link
                  href="/templates"
                  style={{
                    fontSize: 13,
                    color: 'var(--gold)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(201,162,39,.4)',
                    paddingBottom: 2,
                  }}
                >
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              <div
                className="tpl-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
                  gap: 14,
                }}
              >
                {(showcase as any[]).slice(0, 8).map((t) => (
                  <TplCard key={t._id} t={t} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Free templates ── */}
        {freeTemplates.length > 0 && (
          <section
            style={{
              padding: '72px 40px',
              background: '#030329',
              borderTop: '1px solid #1a1a3e',
            }}
          >
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginBottom: 36,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      marginBottom: 10,
                    }}
                  >
                    No subscription needed
                  </div>
                  <h2
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: '#fff',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    Free templates
                  </h2>
                </div>
                <Link
                  href="/templates?tier=free"
                  style={{
                    fontSize: 13,
                    color: 'var(--gold)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(201,162,39,.4)',
                    paddingBottom: 2,
                  }}
                >
                  View all free <ArrowRight size={13} />
                </Link>
              </div>
              <div
                className="tpl-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
                  gap: 14,
                }}
              >
                {(freeTemplates as any[]).slice(0, 8).map((t) => (
                  <TplCard key={t._id} t={t} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── How it works ── */}
        <section
          style={{
            padding: '80px 40px',
            background: '#020220',
            borderTop: '1px solid #1a1a3e',
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 12,
                }}
              >
                Simple process
              </div>
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.03em',
                }}
              >
                Everything you need, nothing you don&apos;t
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
                gap: 24,
              }}
            >
              {[
                {
                  icon: <Zap size={22} />,
                  step: '01',
                  title: 'Instant download',
                  desc: 'Download any template immediately. No waiting, no approval, no hidden steps.',
                },
                {
                  icon: <Download size={22} />,
                  step: '02',
                  title: 'Multiple formats',
                  desc: 'Every template in PowerPoint, Google Slides, and Keynote. Pick what you use.',
                },
                {
                  icon: <Shield size={22} />,
                  step: '03',
                  title: 'Commercial licence',
                  desc: 'Full commercial licence on every template. Use for client work, no extra cost.',
                },
              ].map(({ icon, step, title, desc }) => (
                <div
                  key={step}
                  style={{
                    padding: '28px',
                    background: 'rgba(255,255,255,.03)',
                    border: '1px solid rgba(255,255,255,.06)',
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: 'rgba(201,162,39,.12)',
                        border: '1px solid rgba(201,162,39,.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold)',
                      }}
                    >
                      {icon}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'rgba(255,255,255,.2)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {step}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: 10,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: 'rgba(255,255,255,.5)',
                      lineHeight: 1.7,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        {plans.length > 0 && (
          <section
            style={{
              padding: '80px 40px',
              background: '#030329',
              borderTop: '1px solid #1a1a3e',
            }}
          >
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--gold)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: 12,
                  }}
                >
                  Pricing
                </div>
                <h2
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '-0.03em',
                    marginBottom: 12,
                  }}
                >
                  Simple, transparent pricing
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: 'rgba(255,255,255,.5)',
                    maxWidth: 420,
                    margin: '0 auto',
                  }}
                >
                  Start free. Upgrade when you need the full library.
                </p>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min((plans as any[]).length + 1, 4)},1fr)`,
                  gap: 14,
                  alignItems: 'start',
                }}
              >
                {/* Free plan card */}
                <div
                  style={{
                    border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: 10,
                    padding: '24px',
                    background: 'rgba(255,255,255,.03)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: 4,
                    }}
                  >
                    Free
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,.4)',
                      marginBottom: 20,
                    }}
                  >
                    forever
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      color: '#fff',
                      letterSpacing: '-0.04em',
                      marginBottom: 20,
                    }}
                  >
                    $0
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      marginBottom: 24,
                    }}
                  >
                    {[
                      'Access to free templates',
                      '5 downloads/month',
                      'PowerPoint & Google Slides',
                    ].map((f) => (
                      <div
                        key={f}
                        style={{
                          display: 'flex',
                          gap: 8,
                          fontSize: 13,
                          color: 'rgba(255,255,255,.6)',
                        }}
                      >
                        <Check
                          size={14}
                          style={{
                            flexShrink: 0,
                            marginTop: 1,
                            color: 'rgba(201,162,39,.6)',
                          }}
                        />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/register"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 40,
                      border: '1px solid rgba(255,255,255,.15)',
                      borderRadius: 6,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: '#fff',
                      textDecoration: 'none',
                    }}
                  >
                    Get started free
                  </Link>
                </div>
                {(plans as any[]).map((plan: any, i: number) => {
                  const popular = i === 0;
                  return (
                    <div
                      key={plan._id}
                      style={{
                        border: `1px solid ${popular ? 'var(--gold)' : 'rgba(255,255,255,.1)'}`,
                        borderRadius: 10,
                        padding: '24px',
                        background: popular
                          ? 'rgba(201,162,39,.06)'
                          : 'rgba(255,255,255,.03)',
                        position: 'relative',
                      }}
                    >
                      {popular && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#030329',
                            background: 'var(--gold)',
                            padding: '3px 14px',
                            borderRadius: 20,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Most popular
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#fff',
                          marginBottom: 4,
                        }}
                      >
                        {plan.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,.4)',
                          marginBottom: 20,
                          textTransform: 'capitalize',
                        }}
                      >
                        {plan.interval}
                      </div>
                      <div
                        style={{
                          fontSize: 36,
                          fontWeight: 800,
                          color: popular ? 'var(--gold)' : '#fff',
                          letterSpacing: '-0.04em',
                          marginBottom: 4,
                        }}
                      >
                        ${plan.priceUSD}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'rgba(255,255,255,.35)',
                          marginBottom: 20,
                        }}
                      >
                        per {plan.interval === 'monthly' ? 'month' : 'year'}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          marginBottom: 24,
                        }}
                      >
                        {(plan.features || []).slice(0, 4).map((f: string) => (
                          <div
                            key={f}
                            style={{
                              display: 'flex',
                              gap: 8,
                              fontSize: 13,
                              color: 'rgba(255,255,255,.7)',
                            }}
                          >
                            <Check
                              size={14}
                              style={{
                                flexShrink: 0,
                                marginTop: 1,
                                color: popular
                                  ? 'var(--gold)'
                                  : 'rgba(201,162,39,.6)',
                              }}
                            />
                            {f}
                          </div>
                        ))}
                      </div>
                      <Link
                        href={isLoggedIn ? '/dashboard/billing' : '/register'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 42,
                          background: popular
                            ? 'var(--gold)'
                            : 'rgba(255,255,255,.08)',
                          border: popular
                            ? 'none'
                            : '1px solid rgba(255,255,255,.15)',
                          borderRadius: 6,
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: popular ? '#030329' : '#fff',
                          textDecoration: 'none',
                        }}
                      >
                        {isLoggedIn ? 'Upgrade now' : 'Get started'}
                      </Link>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Link
                  href="/pricing"
                  style={{
                    fontSize: 13,
                    color: 'var(--gold)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(201,162,39,.4)',
                    paddingBottom: 2,
                  }}
                >
                  See full pricing →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── CTA strip ── */}
        {!isLoggedIn && (
          <section
            style={{
              padding: '80px 40px',
              background: '#020220',
              borderTop: '1px solid var(--gold)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at center, rgba(201,162,39,.08) 0%, transparent 70%)',
              }}
            />
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                maxWidth: 560,
                margin: '0 auto',
              }}
            >
              <h2
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.04em',
                  marginBottom: 14,
                }}
              >
                Start for free today
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,.6)',
                  marginBottom: 36,
                  lineHeight: 1.7,
                }}
              >
                Create a free account and download templates immediately. No
                credit card required.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href="/register"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 50,
                    padding: '0 36px',
                    background: 'var(--gold)',
                    color: '#030329',
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
                  Create free account <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 50,
                    padding: '0 28px',
                    background: 'rgba(255,255,255,.06)',
                    border: '1px solid rgba(255,255,255,.15)',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  View pricing
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
