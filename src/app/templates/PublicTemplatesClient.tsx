'use client'

import { useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, X, Download, Lock, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

interface Template {
  _id: string; title: string; thumbnailUrl: string; tier: string
  downloadCount: number; format: string[]; tags: string[]
  category?: { _id: string; name: string }; isFeatured: boolean
}

interface Props {
  data: Template[]; total: number; page: number; pageSize: number
  categories: { _id: string; name: string; icon?: string }[]
}

const FMT: Record<string, string> = {
  powerpoint: 'PPT', google_slides: 'Slides', keynote: 'Keynote', canva: 'Canva',
}

export function PublicTemplatesClient({ data, total, page, pageSize, categories }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const [, startT] = useTransition()
  const [showFilters, setShowFilters] = useState(false)

  const q        = params.get('q') ?? ''
  const tier     = params.get('tier') ?? ''
  const category = params.get('category') ?? ''
  const totalPages = Math.ceil(total / pageSize)

  function push(key: string, val: string | null) {
    const p = new URLSearchParams(params.toString())
    if (val) { p.set(key, val); p.delete('page') } else { p.delete(key) }
    startT(() => router.push(`${pathname}?${p.toString()}`, { scroll: false }))
  }

  const active = [tier, category, q].filter(Boolean).length

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 4 }}>All templates</h1>
          <div style={{ fontSize: 13, color: '#a1a1aa' }}>{total.toLocaleString()} templates available</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 12px', background: '#fafafa', border: '1px solid #e4e4e7', borderRadius: 6, width: 220 }}>
            <Search size={13} color="#a1a1aa" style={{ flexShrink: 0 }}/>
            <input
              defaultValue={q}
              onChange={e => { clearTimeout((window as any).__st); (window as any).__st = setTimeout(() => push('q', e.target.value || null), 300) }}
              placeholder="Search templates…"
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink)', width: '100%' }}
            />
            {q && <button onClick={() => push('q', null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: '#a1a1aa' }}><X size={12}/></button>}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{ height: 36, padding: '0 14px', border: `1px solid ${active ? 'var(--brand)' : 'var(--line-2)'}`, borderRadius: 6, background: active ? 'var(--brand)' : '#fff', color: active ? '#fff' : 'var(--ink-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <SlidersHorizontal size={13}/> Filters {active > 0 && `(${active})`}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{ padding: '16px 20px', background: '#fafafa', border: '1px solid #f4f4f5', borderRadius: 6, marginBottom: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Tier</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ v: '', l: 'All' }, { v: 'free', l: 'Free' }, { v: 'premium', l: 'Premium' }].map(({ v, l }) => (
                <button key={v} onClick={() => push('tier', v || null)}
                  style={{ padding: '5px 14px', fontSize: 12.5, fontWeight: 500, border: `1px solid ${tier === v ? 'var(--brand)' : 'var(--line-2)'}`, borderRadius: 4, cursor: 'pointer', background: tier === v ? 'var(--brand)' : '#fff', color: tier === v ? '#fff' : 'var(--ink-2)' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Category</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => push('category', null)}
                style={{ padding: '5px 14px', fontSize: 12.5, fontWeight: 500, border: `1px solid ${!category ? 'var(--brand)' : 'var(--line-2)'}`, borderRadius: 4, cursor: 'pointer', background: !category ? 'var(--brand)' : '#fff', color: !category ? '#fff' : 'var(--ink-2)' }}>
                All
              </button>
              {categories.map(c => (
                <button key={c._id} onClick={() => push('category', category === c._id ? null : c._id)}
                  style={{ padding: '5px 14px', fontSize: 12.5, fontWeight: 500, border: `1px solid ${category === c._id ? 'var(--brand)' : 'var(--line-2)'}`, borderRadius: 4, cursor: 'pointer', background: category === c._id ? 'var(--brand)' : '#fff', color: category === c._id ? '#fff' : 'var(--ink-2)' }}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {data.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', color: '#a1a1aa' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#52525b', marginBottom: 6 }}>No templates found</div>
          <div style={{ fontSize: 13 }}>Try adjusting your search or filters.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 32 }}>
          {data.map(t => (
            <Link key={t._id} href={`/templates/${t._id}`} style={{ textDecoration: 'none' }}>
              <div style={{ border: '1px solid #f4f4f5', borderRadius: 6, overflow: 'hidden', background: '#fff', transition: 'border-color .1s, box-shadow .1s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e4e4e7'; el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#f4f4f5'; el.style.boxShadow = 'none' }}
              >
                {/* Thumbnail */}
                <div style={{ width: '100%', paddingTop: '62.5%', position: 'relative', background: '#f4f4f5', overflow: 'hidden' }}>
                  {t.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.thumbnailUrl} alt={t.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4d4d8', fontSize: 12 }}>No preview</div>
                  )}
                  {t.tier === 'premium' && (
                    <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 600, color: 'var(--gold-dark)', background: 'var(--gold-light)', border: '1px solid var(--gold-border)', padding: '2px 7px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Lock size={9}/> Premium
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#a1a1aa' }}>{t.category?.name ?? ''}</span>
                    <span style={{ fontSize: 12, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Download size={10}/>{t.downloadCount.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {t.format.slice(0, 3).map(f => (
                      <span key={f} style={{ fontSize: 10.5, color: '#71717a', background: '#fafafa', border: '1px solid #e4e4e7', padding: '2px 6px', borderRadius: 3 }}>
                        {FMT[f] ?? f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          {page > 1 && (
            <button onClick={() => push('page', String(page - 1))}
              style={{ width: 36, height: 36, border: '1px solid #e4e4e7', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#52525b' }}>←</button>
          )}
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let p: number
            if (totalPages <= 7)             p = i + 1
            else if (page <= 4)              p = i + 1
            else if (page >= totalPages - 3) p = totalPages - 6 + i
            else                             p = page - 3 + i
            return (
              <button key={p} onClick={() => push('page', String(p))}
                style={{ width: 36, height: 36, border: `1px solid ${p === page ? 'var(--brand)' : 'var(--line-2)'}`, borderRadius: 4, background: p === page ? 'var(--brand)' : '#fff', color: p === page ? '#fff' : 'var(--ink-2)', cursor: 'pointer', fontSize: 13, fontWeight: p === page ? 600 : 400 }}>
                {p}
              </button>
            )
          })}
          {page < totalPages && (
            <button onClick={() => push('page', String(page + 1))}
              style={{ width: 36, height: 36, border: '1px solid #e4e4e7', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#52525b' }}>→</button>
          )}
        </div>
      )}
    </div>
  )
}
