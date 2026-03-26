'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  _id: string;
  name: string;
  type: string;
  interval: string;
  priceUSD: number;
  priceZWL: number;
  features: string[];
  maxDownloadsPerMonth: number | null;
  isActive: boolean;
  stripePriceId?: string;
}

interface Props {
  plans: Plan[];
  currentPlanId: string | null;
  isLoggedIn: boolean;
  userRole: string;
}

export function PricingClient({
  plans,
  currentPlanId,
  isLoggedIn,
  userRole,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const isSubscriber = userRole === 'subscriber';

  async function handleCheckout(plan: Plan) {
    if (!isLoggedIn) {
      router.push(`/register?plan=${plan._id}`);
      return;
    }
    if (!plan.stripePriceId) {
      toast.error(
        'This plan is not yet available for online purchase. Please contact support.',
      );
      return;
    }
    setLoading(plan._id);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message);
      setLoading(null);
    }
  }

  if (plans.length === 0) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: '80px auto',
          padding: '0 40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--ink)',
            marginBottom: 8,
          }}
        >
          No plans available
        </div>
        <div style={{ fontSize: 13.5, color: '#71717a' }}>
          Plans haven&apos;t been configured yet. An admin needs to add plans in
          the Subscriptions section.
        </div>
      </div>
    );
  }

  // Highlight the middle paid plan as "popular"
  const paidPlans = plans.filter((p) => p.priceUSD > 0);
  const popularIdx = Math.floor(paidPlans.length / 2);
  const popularId = paidPlans[popularIdx]?._id;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: 'var(--ink)',
            letterSpacing: '-.04em',
            marginBottom: 14,
          }}
        >
          Simple, transparent pricing
        </h1>
        <p
          style={{
            fontSize: 15,
            color: '#71717a',
            maxWidth: 420,
            margin: '0 auto',
          }}
        >
          Start free. Upgrade when you need more templates or more downloads.
        </p>
      </div>

      {/* Plans grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(plans.length, 4)}, 1fr)`,
          gap: 16,
          alignItems: 'start',
        }}
      >
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan._id;
          const isPopular = plan._id === popularId;
          const isFree = plan.priceUSD === 0;
          const isLoading = loading === plan._id;
          const hasStripe = !!plan.stripePriceId;

          return (
            <div
              key={plan._id}
              style={{
                border: `1.5px solid ${isPopular ? 'var(--gold)' : 'var(--line-2)'}`,
                borderRadius: 8,
                padding: 24,
                background: isPopular ? 'var(--brand)' : '#fff',
                position: 'relative',
              }}
            >
              {isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 11,
                    fontWeight: 600,
                    background: 'var(--brand)',
                    color: '#fff',
                    padding: '3px 12px',
                    borderRadius: 20,
                    border: '2px solid #fff',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Most popular
                </div>
              )}

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isPopular ? '#fff' : '#09090b',
                  marginBottom: 4,
                }}
              >
                {plan.name}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: isPopular ? 'rgba(255,255,255,.5)' : '#a1a1aa',
                  marginBottom: 20,
                  textTransform: 'capitalize',
                }}
              >
                {plan.type.replace(/_/g, ' ')}
              </div>

              <div style={{ marginBottom: 20 }}>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: isPopular ? '#fff' : '#09090b',
                    letterSpacing: '-.04em',
                  }}
                >
                  {isFree ? 'Free' : `$${plan.priceUSD}`}
                </span>
                {!isFree && (
                  <span
                    style={{
                      fontSize: 13,
                      color: isPopular ? 'rgba(255,255,255,.5)' : '#a1a1aa',
                      marginLeft: 4,
                    }}
                  >
                    / {plan.interval === 'monthly' ? 'month' : 'year'}
                  </span>
                )}
              </div>

              {/* Features */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                {(plan.features ?? []).map((f) => (
                  <div
                    key={f}
                    style={{
                      display: 'flex',
                      gap: 8,
                      fontSize: 13,
                      color: isPopular ? 'rgba(255,255,255,.8)' : '#52525b',
                    }}
                  >
                    <Check
                      size={14}
                      style={{
                        flexShrink: 0,
                        marginTop: 1,
                        color: isPopular ? 'rgba(255,255,255,.6)' : '#16a34a',
                      }}
                    />
                    {f}
                  </div>
                ))}
                {plan.maxDownloadsPerMonth !== null && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      fontSize: 13,
                      color: isPopular ? 'rgba(255,255,255,.8)' : '#52525b',
                    }}
                  >
                    <Check
                      size={14}
                      style={{
                        flexShrink: 0,
                        marginTop: 1,
                        color: isPopular ? 'rgba(255,255,255,.6)' : '#16a34a',
                      }}
                    />
                    {plan.maxDownloadsPerMonth} downloads/month
                  </div>
                )}
                {plan.maxDownloadsPerMonth === null && !isFree && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      fontSize: 13,
                      color: isPopular ? 'rgba(255,255,255,.8)' : '#52525b',
                    }}
                  >
                    <Check
                      size={14}
                      style={{
                        flexShrink: 0,
                        marginTop: 1,
                        color: isPopular ? 'rgba(255,255,255,.6)' : '#16a34a',
                      }}
                    />
                    Unlimited downloads
                  </div>
                )}
              </div>

              {/* CTA */}
              {isCurrent ? (
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 500,
                    color: isPopular ? 'rgba(255,255,255,.5)' : '#a1a1aa',
                    padding: '9px',
                  }}
                >
                  ✓ Current plan
                </div>
              ) : isFree ? (
                isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 40,
                      border: '1px solid #e4e4e7',
                      borderRadius: 5,
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: '#52525b',
                      textDecoration: 'none',
                    }}
                  >
                    Go to dashboard
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 40,
                      border: '1px solid #e4e4e7',
                      borderRadius: 5,
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: '#52525b',
                      textDecoration: 'none',
                    }}
                  >
                    Start for free
                  </Link>
                )
              ) : !hasStripe ? (
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 12.5,
                    color: isPopular ? 'rgba(255,255,255,.4)' : '#a1a1aa',
                    padding: '9px',
                  }}
                >
                  Coming soon
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={!!loading}
                  style={{
                    width: '100%',
                    height: 40,
                    border: 'none',
                    borderRadius: 5,
                    cursor: loading ? 'wait' : 'pointer',
                    background: 'var(--gold)',
                    color: '#030329',
                    fontSize: 13.5,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    opacity: loading && !isLoading ? 0.5 : 1,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Redirecting
                      to Stripe…
                    </>
                  ) : isSubscriber ? (
                    'Switch plan'
                  ) : (
                    'Get started'
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 64, maxWidth: 640, margin: '64px auto 0' }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--ink)',
            letterSpacing: '-.02em',
            marginBottom: 28,
            textAlign: 'center',
          }}
        >
          Common questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              q: 'Can I cancel at any time?',
              a: 'Yes. Cancel from your billing page and your subscription stays active until the end of the billing period — no fees.',
            },
            {
              q: 'What formats do templates come in?',
              a: 'Most templates are available in PowerPoint (.pptx), Google Slides, and Keynote (.key). The exact formats are shown on each template page.',
            },
            {
              q: 'Do I need a subscription to download free templates?',
              a: 'No — you only need a free account. Premium templates require an active paid subscription.',
            },
            {
              q: 'Is there a refund policy?',
              a: 'Contact support within 7 days of purchase if you have any issues and we will make it right.',
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              style={{ padding: '16px 0', borderBottom: '1px solid #f4f4f5' }}
            >
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  marginBottom: 7,
                }}
              >
                {q}
              </div>
              <div style={{ fontSize: 13, color: '#71717a', lineHeight: 1.65 }}>
                {a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
