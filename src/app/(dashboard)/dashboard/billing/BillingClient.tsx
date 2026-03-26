'use client';

import Link from 'next/link';
import { CreditCard, Check, Loader2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fmtCurrency, fmtDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/index';

interface Props {
  user: any;
  plans: any[];
  payments: any[];
}

export function BillingClient({ user, plans, payments }: Props) {
  const router = useRouter();
  const sub = user?.subscription;
  const plan = sub?.plan;
  const isActive = sub?.status === 'active';
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message);
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setLoading('portal');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || 'Failed to open billing portal');
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message);
      setLoading(null);
    }
  }

  // Check success/cancel from URL
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      toast.success('Subscription activated!');
      router.replace('/dashboard/billing');
    }
    if (params.get('cancelled')) {
      toast('Checkout cancelled.');
      router.replace('/dashboard/billing');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Subscription & Billing</div>
          <div className="page-subtitle">
            Manage your plan and payment details
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Current plan */}
        <div className="card" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--ink)',
              marginBottom: 14,
            }}
          >
            Current plan
          </div>
          {isActive && plan ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    letterSpacing: '-.02em',
                  }}
                >
                  {plan.name}
                </div>
                <div style={{ fontSize: 12.5, color: '#71717a', marginTop: 4 }}>
                  {fmtCurrency(sub.priceAtPurchase)} / {plan.interval} · via{' '}
                  {sub.paymentProvider}
                </div>
                <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 3 }}>
                  Renews {fmtDate(sub.currentPeriodEnd)}
                </div>
                <div style={{ marginTop: 10 }}>
                  <StatusBadge status="active" />
                </div>
              </div>
              {sub.paymentProvider === 'stripe' && (
                <button
                  onClick={handleManageBilling}
                  disabled={loading === 'portal'}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    flexShrink: 0,
                  }}
                >
                  {loading === 'portal' ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Opening…
                    </>
                  ) : (
                    <>
                      <ExternalLink size={12} /> Manage billing
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                background: '#fafafa',
                border: '1px solid #f4f4f5',
                borderRadius: 4,
              }}
            >
              <div style={{ fontSize: 12.5, color: '#52525b' }}>
                You are on the <strong>Free plan</strong>. Upgrade to access all
                premium templates.
              </div>
            </div>
          )}
        </div>

        {/* Plan options */}
        {plans.length > 0 && (
          <div className="card" style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: 14,
              }}
            >
              {isActive ? 'Change plan' : 'Choose a plan'}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: 10,
              }}
            >
              {plans.map((p) => {
                const isCurrent = plan?._id?.toString() === p._id?.toString();
                const isFree = p.priceUSD === 0;
                const isLoading = loading === p._id?.toString();
                const hasStripe = !!p.stripePriceId;

                return (
                  <div
                    key={p._id}
                    style={{
                      border: `1px solid ${isCurrent ? 'var(--brand)' : 'var(--line-2)'}`,
                      borderRadius: 6,
                      padding: 16,
                      background: isCurrent ? 'var(--brand)' : '#fff',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isCurrent ? '#fff' : '#09090b',
                        marginBottom: 6,
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: isCurrent ? '#fff' : '#09090b',
                        letterSpacing: '-.03em',
                        marginBottom: 2,
                      }}
                    >
                      {p.priceUSD === 0 ? 'Free' : `$${p.priceUSD}`}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: isCurrent ? 'rgba(255,255,255,.4)' : '#a1a1aa',
                        marginBottom: 12,
                      }}
                    >
                      {p.priceUSD === 0
                        ? 'forever'
                        : `/${p.interval === 'monthly' ? 'mo' : 'yr'}`}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        marginBottom: 14,
                      }}
                    >
                      {(p.features ?? []).slice(0, 3).map((f: string) => (
                        <div
                          key={f}
                          style={{
                            display: 'flex',
                            gap: 5,
                            fontSize: 11.5,
                            color: isCurrent
                              ? 'rgba(255,255,255,.7)'
                              : '#52525b',
                          }}
                        >
                          <Check
                            size={11}
                            style={{
                              flexShrink: 0,
                              marginTop: 2,
                              color: isCurrent
                                ? 'rgba(255,255,255,.5)'
                                : '#16a34a',
                            }}
                          />
                          {f}
                        </div>
                      ))}
                    </div>
                    {isCurrent ? (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: 'rgba(255,255,255,.45)',
                          textAlign: 'center',
                        }}
                      >
                        Current plan
                      </div>
                    ) : isFree ? (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: '#a1a1aa',
                          textAlign: 'center',
                        }}
                      >
                        Default plan
                      </div>
                    ) : !hasStripe ? (
                      <div
                        style={{
                          fontSize: 11,
                          color: '#f59e0b',
                          textAlign: 'center',
                        }}
                      >
                        Not yet available
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckout(p._id.toString())}
                        disabled={!!loading}
                        style={{
                          width: '100%',
                          padding: '7px',
                          fontSize: 12.5,
                          fontWeight: 600,
                          border: '1px solid #e4e4e7',
                          borderRadius: 4,
                          background: '#fff',
                          color: 'var(--ink)',
                          cursor: loading ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          opacity: loading && !isLoading ? 0.5 : 1,
                        }}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />{' '}
                            Redirecting…
                          </>
                        ) : isActive ? (
                          'Switch plan'
                        ) : (
                          'Upgrade'
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {plans.some((p) => !p.stripePriceId && p.priceUSD > 0) && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#92400e',
                }}
              >
                Some plans show &quot;Not yet available&quot; — add their{' '}
                <code>stripePriceId</code> in the Subscriptions admin page to
                enable them.
              </div>
            )}
          </div>
        )}

        {/* Payment method */}
        {isActive && sub?.paymentProvider === 'stripe' && (
          <div className="card" style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: 14,
              }}
            >
              Payment method
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 26,
                  border: '1px solid #e4e4e7',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fafafa',
                }}
              >
                <CreditCard size={14} color="#a1a1aa" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: 'var(--ink)',
                  }}
                >
                  Stripe
                </div>
                <div style={{ fontSize: 11.5, color: '#a1a1aa' }}>
                  Managed via Stripe
                </div>
              </div>
              <button
                onClick={handleManageBilling}
                disabled={loading === 'portal'}
                className="btn btn-secondary btn-sm"
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {loading === 'portal' ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Opening…
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Invoice history */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Invoice history</div>
          </div>
          {payments.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#a1a1aa',
                fontSize: 12.5,
              }}
            >
              No payments yet
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p._id}>
                    <td style={{ color: '#a1a1aa' }}>{fmtDate(p.createdAt)}</td>
                    <td>{p.description ?? 'Subscription payment'}</td>
                    <td style={{ fontWeight: 500 }}>
                      {fmtCurrency(p.amount, p.currency)}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
