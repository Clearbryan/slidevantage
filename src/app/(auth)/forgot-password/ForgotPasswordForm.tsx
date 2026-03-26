'use client';

import { useState } from 'react';
import { Loader2, Mail, Check } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        style={{
          padding: '24px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}
        >
          <Check size={20} color="#16a34a" />
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#15803d',
            marginBottom: 6,
          }}
        >
          Check your email
        </div>
        <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
          If an account exists for <strong>{email}</strong>, you&apos;ll receive
          a password reset link shortly.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div>
        <label className="label">Email address</label>
        <div style={{ position: 'relative' }}>
          <Mail
            size={14}
            color="var(--ink-4)"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="email"
            className={`input${error ? ' input-error' : ''}`}
            style={{ paddingLeft: 32 }}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            autoFocus
          />
        </div>
        {error && <div className="field-error">{error}</div>}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          height: 42,
          background: 'var(--brand)',
          color: '#fff',
          border: 'none',
          borderRadius: 5,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
        }}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Sending…
          </>
        ) : (
          'Send reset link'
        )}
      </button>
    </form>
  );
}
