import type { Metadata } from 'next'
import Link from 'next/link'
import { connectDB } from '@/lib/db'
import { Template, User } from '@/models'
import { ArrowRight, Download, Users, FileStack, Globe } from 'lucide-react'
import { PublicNav, PublicFooter } from '@/components/public/PublicNav'

export const metadata: Metadata = {
  title: 'About — SlideVantage',
  description: 'Professional presentation templates for business teams worldwide.',
}

export default async function AboutPage() {
  await connectDB()
  const [templateCount, userCount, dlAgg] = await Promise.all([
    Template.countDocuments({ status: 'published' }),
    User.countDocuments(),
    Template.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
  ])
  const downloadCount = dlAgg[0]?.total ?? 0
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+` : `${n}+`

  return (
    <div className="public-layout">
      <PublicNav />
      <main>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, #030329 0%, #060660 50%, #030329 100%)', padding: '96px 40px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(201,162,39,.07) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(201,162,39,.05) 0%, transparent 50%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(201,162,39,.12)', border: '1px solid rgba(201,162,39,.3)', borderRadius: 20, fontSize: 12, color: 'var(--gold)', marginBottom: 28, fontWeight: 600 }}>
            About SlideVantage
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20, textShadow: '0 2px 40px rgba(0,0,0,.5)' }}>
            Great presentations<br /><span style={{ color: 'var(--gold)' }}>start here.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,.65)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 40px' }}>
            We build professional presentation templates so your team can focus on the message, not the design.
          </p>
          <Link href="/templates" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 48, padding: '0 28px', background: 'var(--gold)', color: '#030329', borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            Browse templates <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div style={{ background: '#020220', borderTop: '1px solid #1a1a3e', borderBottom: '1px solid #1a1a3e' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 40px', display: 'flex', justifyContent: 'center', gap: 0 }}>
          {[
            { icon: <FileStack size={18} />, value: fmt(templateCount), label: 'Templates' },
            { icon: <Users size={18} />,     value: fmt(userCount),     label: 'Members'   },
            { icon: <Download size={18} />,  value: fmt(downloadCount), label: 'Downloads' },
            { icon: <Globe size={18} />,     value: '40+',              label: 'Countries' },
          ].map(({ icon, value, label }, i) => (
            <div key={label} style={{ textAlign: 'center', padding: '24px 56px', borderRight: i < 3 ? '1px solid #1a1a3e' : 'none' }}>
              <div style={{ color: 'var(--gold)', display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>{value}</div>
              <div style={{ fontSize: 12, color: '#5050a0', marginTop: 3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <section style={{ padding: '80px 40px', background: '#030329' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Our mission</div>
          <h2 style={{ fontSize: 34, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: 20 }}>
            We believe every idea deserves a great presentation.
          </h2>
          <p style={{ fontSize: 15.5, color: '#6060a0', lineHeight: 1.8, marginBottom: 20 }}>
            SlideVantage was built for professionals who need to communicate clearly and confidently. Whether you're pitching to investors, presenting to a board, or running a team meeting — the quality of your slides matters.
          </p>
          <p style={{ fontSize: 15.5, color: '#6060a0', lineHeight: 1.8 }}>
            We design every template to be immediately usable — professional layout, clear typography, and structure that works across industries. No design skills required.
          </p>
        </div>
      </section>

      {/* What you get */}
      <section style={{ padding: '80px 40px', background: '#020220', borderTop: '1px solid #1a1a3e' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>What you get</div>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>Built for real work</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { title: 'Ready to use instantly', desc: 'Download and open in PowerPoint, Google Slides, or Keynote. Every template works right out of the box with no extra setup.' },
              { title: 'Designed by professionals', desc: 'Templates are crafted by experienced designers with a focus on clarity, hierarchy, and visual impact across all slide sizes.' },
              { title: 'Regular new templates', desc: 'We add new templates every week across all categories. Subscribers always have access to the latest designs.' },
              { title: 'Commercial use included', desc: 'Every template includes a commercial licence. Use them for client presentations, business pitches, and commercial work freely.' },
            ].map(({ title, desc }) => (
              <div key={title} style={{ padding: '24px', background: 'rgba(255,255,255,.03)', border: '1px solid #1a1a3e', borderRadius: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)', marginBottom: 16 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 13.5, color: '#6060a0', lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '88px 40px', background: '#030329', borderTop: '1px solid #1a1a3e', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 14 }}>Ready to get started?</h2>
          <p style={{ fontSize: 15, color: '#6060a0', marginBottom: 32, lineHeight: 1.7 }}>
            Create a free account and start downloading templates today.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 48, padding: '0 32px', background: 'var(--gold)', color: '#030329', borderRadius: 6, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Create free account <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      </main>
      <PublicFooter />
    </div>
  )
}
