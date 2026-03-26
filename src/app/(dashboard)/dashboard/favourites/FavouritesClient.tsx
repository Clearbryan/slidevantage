'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Download, X, Loader2, Check, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/index'
import { downloadTemplate } from '@/actions/download.actions'
import { toggleFavourite } from '@/actions'
import { fmt } from '@/lib/utils'

interface Template {
  _id: string; title: string; thumbnailUrl: string; tier: string
  downloadCount: number; format: string[]; category?: { name: string }
}

const FMT_LABEL: Record<string,string> = {
  powerpoint:'PowerPoint (.pptx)', google_slides:'Google Slides',
  keynote:'Keynote (.key)', canva:'Canva',
}

export function FavouritesClient({ data }: { data: Template[] }) {
  const router = useRouter()
  const [items, setItems]         = useState(data)
  const [picking, setPicking]     = useState<Template | null>(null)
  const [downloading, setDl]      = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState<Record<string, Set<string>>>({})
  const [removing, setRemoving]   = useState<string | null>(null)
  const [, startT]                 = useTransition()

  async function triggerDownload(t: Template, format: string) {
    setDl(format)
    try {
      const result = await downloadTemplate(t._id, format)
      const a = document.createElement('a')
      a.href = result.url; a.download = `${t.title} - ${FMT_LABEL[format] ?? format}`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setDownloaded(prev => ({ ...prev, [t._id]: new Set([...(prev[t._id] ?? []), format]) }))
      toast.success('Download started')
      router.refresh()
    } catch (err: any) { toast.error(err.message || 'Download failed') }
    finally { setDl(null) }
  }

  function handleDownloadClick(t: Template) {
    if (!t.format.length)   { toast.error('No formats available'); return }
    if (t.format.length === 1) { triggerDownload(t, t.format[0]); return }
    setPicking(t)
  }

  function handleRemove(id: string) {
    setRemoving(id)
    startT(async () => {
      try {
        await toggleFavourite(id)
        setItems(prev => prev.filter(t => t._id !== id))
        toast.success('Removed from favourites')
      } catch { toast.error('Failed to remove') }
      finally { setRemoving(null) }
    })
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="page-title" style={{ marginBottom: 20 }}>Favourites</div>
        <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Heart size={28} strokeWidth={1} style={{ margin: '0 auto 12px', opacity: .2, display: 'block' }} />
          <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, marginBottom: 4 }}>No favourites yet</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginBottom: 16 }}>Browse templates and click ♥ to save them here.</div>
          <Link href="/dashboard/templates" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', margin: '0 auto' }}>Browse templates</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Favourites</div>
          <div className="page-subtitle">{items.length} saved template{items.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {items.map(t => (
          <div key={t._id} className="card" style={{ overflow: 'hidden' }}>

            {/* ── Thumbnail: full click area → view template ── */}
            <Link href={`/dashboard/templates/${t._id}`} style={{ display: 'block', position: 'relative', width: '100%', paddingTop: '62.5%', background: 'var(--surface)', overflow: 'hidden', textDecoration: 'none' }}>
              {t.thumbnailUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={t.thumbnailUrl} alt={t.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}/>
                : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--line-2)', fontSize: 11 }}>No preview</div>
              }
              {/* Hover overlay */}
              <div className="thumb-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(3,3,41,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, transition: 'background .2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(3,3,41,.55)'; el.querySelectorAll('.view-lbl').forEach((x:any) => x.style.opacity='1') }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(3,3,41,0)'; el.querySelectorAll('.view-lbl').forEach((x:any) => x.style.opacity='0') }}>
                <Eye size={22} color="#fff" className="view-lbl" style={{ opacity: 0, transition: 'opacity .2s' }}/>
                <span className="view-lbl" style={{ opacity: 0, transition: 'opacity .2s', fontSize: 11, color: '#fff', fontWeight: 600 }}>View slides</span>
              </div>
              {t.tier === 'premium' && (
                <div style={{ position: 'absolute', top: 7, right: 7, fontSize: 10, fontWeight: 700, color: 'var(--gold)', background: 'rgba(3,3,41,.7)', padding: '2px 7px', borderRadius: 3 }}>Pro</div>
              )}
            </Link>

            {/* ── Actions ── */}
            <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>
              <button onClick={() => handleDownloadClick(t)}
                style={{ flex: 1, height: 28, borderRadius: 3, background: 'var(--brand)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11.5, fontWeight: 500, color: '#fff' }}>
                <Download size={11}/> Download
              </button>
              <button onClick={() => handleRemove(t._id)} disabled={removing === t._id}
                style={{ width: 28, height: 28, borderRadius: 3, background: '#fee2e2', border: '1px solid #fecaca', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                title="Remove from favourites">
                {removing === t._id ? <Loader2 size={12} className="animate-spin" color="#ef4444"/> : <Heart size={12} color="#ef4444" fill="#ef4444"/>}
              </button>
            </div>

            {/* ── Info ── */}
            <div style={{ padding: '10px 12px' }}>
              <Link href={`/dashboard/templates/${t._id}`} style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', marginBottom: 5, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}>
                {t.title}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{t.category?.name ?? ''}</span>
                <StatusBadge status={t.tier}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Format picker modal */}
      {picking && (
        <div className="modal-overlay" onClick={() => setPicking(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Choose format</div>
                <div className="modal-subtitle">{picking.title}</div>
              </div>
              <button onClick={() => setPicking(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-4)', display:'flex', padding:2 }}><X size={16}/></button>
            </div>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {picking.format.map(format => {
                const done = downloaded[picking._id]?.has(format)
                const isActive = downloading === format
                return (
                  <button key={format} onClick={() => triggerDownload(picking, format)} disabled={!!downloading}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:42, padding:'0 14px', background:done?'#f0fdf4':'#fff', border:`1px solid ${done?'#bbf7d0':'var(--line-2)'}`, borderRadius:5, cursor:downloading?'wait':'pointer', fontSize:13, color:done?'#15803d':'var(--ink)', fontWeight:500, opacity:downloading&&!isActive?0.5:1 }}>
                    <span>{FMT_LABEL[format] ?? format}</span>
                    {isActive ? <Loader2 size={15} className="animate-spin" color="var(--ink-4)"/>
                      : done  ? <Check size={15} color="#16a34a"/>
                      : <Download size={15} color="var(--ink-4)"/>}
                  </button>
                )
              })}
            </div>
            <div className="modal-footer" style={{ justifyContent:'space-between' }}>
              <Link href={`/dashboard/templates/${picking._id}`} className="btn btn-secondary btn-sm" onClick={() => setPicking(null)}>
                <Eye size={13}/> View slides
              </Link>
              <button onClick={() => setPicking(null)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
