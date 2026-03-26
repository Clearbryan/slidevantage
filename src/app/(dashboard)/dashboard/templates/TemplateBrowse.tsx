'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Download, Heart, Lock, Search, SlidersHorizontal, X, Loader2, Check, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { fmt } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/index'
import { toggleFavourite } from '@/actions'
import { downloadTemplate } from '@/actions/download.actions'

interface Template {
  _id: string; title: string; description: string; thumbnailUrl: string
  tier: string; downloadCount: number; format: string[]
  category?: { name: string }; isFeatured: boolean
}
interface Props {
  data: Template[]; total: number; page: number; pageSize: number
  categories: { _id: string; name: string }[]
  userRole: string; favouriteIds: string[]
}

const FMT_LABEL: Record<string, string> = {
  powerpoint: 'PowerPoint (.pptx)', google_slides: 'Google Slides',
  keynote: 'Keynote (.key)', canva: 'Canva',
}

export function TemplateBrowse({ data, total, page, pageSize, categories, userRole, favouriteIds }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const [, startT] = useTransition()

  const [favs,        setFavs]        = useState<Set<string>>(new Set(favouriteIds))
  const [showFilters, setShowFilters] = useState(false)
  // Format picker state
  const [picking,     setPicking]     = useState<Template | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)  // format being downloaded
  const [downloaded,  setDownloaded]  = useState<Record<string, Set<string>>>({}) // templateId → Set<format>

  const isSubscriber = userRole === 'subscriber'
  const q        = params.get('q') ?? ''
  const tier     = params.get('tier') ?? ''
  const category = params.get('category') ?? ''

  function pushParam(key: string, val: string | null) {
    const p = new URLSearchParams(params.toString())
    if (val) { p.set(key, val); p.delete('page') } else { p.delete(key) }
    startT(() => router.push(`${pathname}?${p.toString()}`, { scroll: false }))
  }

  function handleFav(id: string) {
    const adding = !favs.has(id)
    setFavs(prev => { const n = new Set(prev); adding ? n.add(id) : n.delete(id); return n })
    startT(async () => {
      try {
        await toggleFavourite(id)
        toast.success(adding ? 'Added to favourites' : 'Removed from favourites')
      } catch {
        setFavs(prev => { const n = new Set(prev); adding ? n.delete(id) : n.add(id); return n })
        toast.error('Failed to update favourites')
      }
    })
  }

  function handleDownloadClick(t: Template) {
    if (t.tier === 'premium' && !isSubscriber) {
      toast.error('Upgrade to Pro to download premium templates')
      return
    }
    if (t.format.length === 0) { toast.error('No formats available for this template'); return }
    if (t.format.length === 1) { triggerDownload(t, t.format[0]); return }
    // Multiple formats — show picker
    setPicking(t)
  }

  async function triggerDownload(t: Template, format: string) {
    setDownloading(format)
    try {
      const result = await downloadTemplate(t._id, format)
      const a = document.createElement('a')
      a.href = result.url
      a.download = `${t.title} - ${FMT_LABEL[format] ?? format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setDownloaded(prev => ({
        ...prev,
        [t._id]: new Set([...(prev[t._id] ?? []), format]),
      }))
      toast.success(`Downloading ${FMT_LABEL[format] ?? format}`)
    } catch (err: any) {
      toast.error(err.message || 'Download failed')
    } finally {
      setDownloading(null)
    }
  }

  const activeFilterCount = [tier, category, q].filter(Boolean).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Templates</div>
          <div className="page-subtitle">{fmt(total)} professional presentation templates</div>
        </div>
        <button onClick={() => setShowFilters(v => !v)} className="btn btn-secondary btn-sm">
          <SlidersHorizontal size={12}/>
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ maxWidth: 360, marginBottom: 12 }}>
        <Search size={13} color="#a1a1aa" style={{ flexShrink: 0 }}/>
        <input
          defaultValue={q}
          onChange={e => { clearTimeout((window as any).__st); (window as any).__st = setTimeout(() => pushParam('q', e.target.value || null), 300) }}
          placeholder="Search templates…"
        />
        {q && <button onClick={() => pushParam('q', null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: '#a1a1aa' }}><X size={12}/></button>}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 16px', background: '#fafafa', border: '1px solid #f4f4f5', borderRadius: 4, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[{ v: '', l: 'All tiers' }, { v: 'free', l: 'Free' }, { v: 'premium', l: 'Premium' }].map(({ v, l }) => (
              <button key={v} onClick={() => pushParam('tier', v || null)}
                style={{ padding: '4px 12px', fontSize: 11.5, fontWeight: 500, border: `1px solid ${tier === v ? 'var(--brand)' : 'var(--line-2)'}`, borderRadius: 3, cursor: 'pointer', background: tier === v ? 'var(--brand)' : '#fff', color: tier === v ? '#fff' : 'var(--ink-2)' }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ width: 1, background: '#e4e4e7', margin: '0 4px' }}/>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c._id} onClick={() => pushParam('category', category === c._id ? null : c._id)}
                style={{ padding: '4px 12px', fontSize: 11.5, fontWeight: 500, border: `1px solid ${category === c._id ? 'var(--brand)' : 'var(--line-2)'}`, borderRadius: 3, cursor: 'pointer', background: category === c._id ? 'var(--brand)' : '#fff', color: category === c._id ? '#fff' : 'var(--ink-2)' }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', color: '#a1a1aa' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#52525b', marginBottom: 6 }}>No templates found</div>
          <div style={{ fontSize: 12.5 }}>Try adjusting your search or filters.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 20 }}>
          {data.map(t => (
            <div key={t._id} className="card" style={{ overflow: 'hidden', position: 'relative' }}>
              {t.isFeatured && (
                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, fontSize: 10, fontWeight: 600, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 7px', borderRadius: 3 }}>Featured</div>
              )}
              {/* Thumbnail - entire image area links to template view */}
              <Link href={`/dashboard/templates/${t._id}`} style={{ display: 'block', position: 'relative', width: '100%', paddingTop: '62.5%', background: '#f4f4f5', overflow: 'hidden' }}>
                {t.thumbnailUrl
                  ? <img src={t.thumbnailUrl} alt={t.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}/>
                  : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4d4d8', fontSize: 11 }}>No preview</div>
                }
                {/* View indicator */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(3,3,41,.45)'; const eye = (e.currentTarget as HTMLElement).querySelector('.view-eye') as HTMLElement; if (eye) eye.style.opacity = '1' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0)'; const eye = (e.currentTarget as HTMLElement).querySelector('.view-eye') as HTMLElement; if (eye) eye.style.opacity = '0' }}
                >
                  <div className="view-eye" style={{ opacity: 0, transition: 'opacity .2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Eye size={24} color="#fff" />
                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>View slides</span>
                  </div>
                </div>
              </Link>
              {/* Action buttons row below thumbnail */}
              <div style={{ display: 'flex', gap: 5, padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>
                <button onClick={() => handleDownloadClick(t)}
                  style={{ flex: 1, height: 28, borderRadius: 3, background: t.tier === 'premium' && !isSubscriber ? 'var(--gold-light)' : 'var(--brand)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11.5, fontWeight: 500, color: t.tier === 'premium' && !isSubscriber ? 'var(--gold-dark)' : '#fff' }}>
                  {t.tier === 'premium' && !isSubscriber ? <><Lock size={10}/> Pro only</> : <><Download size={10}/> Download</>}
                </button>
                <button onClick={() => handleFav(t._id)}
                  style={{ width: 28, height: 28, borderRadius: 3, background: favs.has(t._id) ? '#fee2e2' : 'var(--surface)', border: '1px solid var(--line-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Heart size={12} color={favs.has(t._id) ? '#ef4444' : 'var(--ink-4)'} fill={favs.has(t._id) ? '#ef4444' : 'none'}/>
                </button>
                {t.tier === 'premium' && !isSubscriber && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 3, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={10} color="#fff"/>
                  </div>
                )}
              </div>
              {/* Info */}
              <div style={{ padding: '12px 14px' }}>
                <Link href={`/dashboard/templates/${t._id}`} style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', marginBottom: 5, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textDecoration: 'none' }}>
                  {t.title}
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, color: '#a1a1aa' }}>{t.category?.name ?? ''}</span>
                  <StatusBadge status={t.tier}/>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f4f4f5' }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {t.format.slice(0, 2).map(f => (
                      <span key={f} style={{ fontSize: 10, color: '#71717a', background: '#fafafa', border: '1px solid #e4e4e7', padding: '1px 5px', borderRadius: 2 }}>
                        {f === 'powerpoint' ? 'PPT' : f === 'google_slides' ? 'Slides' : f === 'keynote' ? 'Key' : f}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Download size={10} color="#a1a1aa"/>
                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>{fmt(t.downloadCount)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
          {page > 1 && <button onClick={() => pushParam('page', String(page - 1))} className="page-btn">←</button>}
          {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
            const totalPages = Math.ceil(total / pageSize)
            let p: number
            if (totalPages <= 5)             p = i + 1
            else if (page <= 3)              p = i + 1
            else if (page >= totalPages - 2) p = totalPages - 4 + i
            else                             p = page - 2 + i
            return <button key={p} onClick={() => pushParam('page', String(p))} className={`page-btn${p === page ? ' active' : ''}`}>{p}</button>
          })}
          {page < Math.ceil(total / pageSize) && <button onClick={() => pushParam('page', String(page + 1))} className="page-btn">→</button>}
        </div>
      )}

      {/* Upgrade banner */}
      {!isSubscriber && (
        <div style={{ padding: '16px 20px', background: 'var(--brand)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>Unlock all premium templates</div>
            <div style={{ fontSize: 12, color: '#71717a' }}>Unlimited downloads · All templates · From $12/month</div>
          </div>
          <a href="/dashboard/billing" style={{ flexShrink: 0, padding: '7px 16px', background: '#fff', color: 'var(--ink)', borderRadius: 4, fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}>
            Upgrade to Pro →
          </a>
        </div>
      )}

      {/* Format picker modal */}
      {picking && (
        <div className="modal-overlay" onClick={() => setPicking(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Choose format</div>
                <div className="modal-subtitle">{picking.title}</div>
              </div>
              <button onClick={() => setPicking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', display: 'flex', padding: 2 }}>
                <X size={16}/>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {picking.format.map(format => {
                const done     = downloaded[picking._id]?.has(format)
                const isActive = downloading === format
                return (
                  <button key={format}
                    onClick={() => triggerDownload(picking, format)}
                    disabled={!!downloading}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 42, padding: '0 14px', background: done ? '#f0fdf4' : '#fff', border: `1px solid ${done ? '#bbf7d0' : '#e4e4e7'}`, borderRadius: 5, cursor: downloading ? 'wait' : 'pointer', fontSize: 13, color: done ? '#15803d' : 'var(--ink)', fontWeight: 500, opacity: downloading && !isActive ? 0.5 : 1 }}>
                    <span>{FMT_LABEL[format] ?? format}</span>
                    {isActive ? <Loader2 size={15} className="animate-spin" color="#a1a1aa"/>
                      : done    ? <Check size={15} color="#16a34a"/>
                      : <Download size={15} color="#a1a1aa"/>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
