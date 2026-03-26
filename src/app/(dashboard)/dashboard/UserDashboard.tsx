'use client'

import Link from 'next/link'
import { Download, Heart, CreditCard, ArrowRight, Lock, Check, Star, Loader2, Eye } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { fmt, fmtDate, fmtCurrency, timeAgo } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/index'
import { toggleFavourite } from '@/actions'
import { downloadTemplate } from '@/actions/download.actions'

interface Props {
  name:            string
  user:            any
  recentDownloads: any[]
  recentTemplates: any[]   // newest published templates
  userFavIds:      string[]
}

const FMT: Record<string,string> = { powerpoint:'PPT', google_slides:'Slides', keynote:'Key', canva:'Canva' }

export function UserDashboard({ name, user, recentDownloads, recentTemplates, userFavIds }: Props) {
  const router     = useRouter()
  const [favs, setFavs]       = useState<Set<string>>(new Set(userFavIds))
  const [dlId, setDlId]       = useState<string|null>(null)
  const [, startT]             = useTransition()

  const sub          = user?.subscription
  const plan         = sub?.plan
  const firstName    = (name || '').split(' ')[0] || 'there'
  const isSubscriber = user?.role === 'subscriber'

  function handleFav(id: string) {
    const adding = !favs.has(id)
    setFavs(prev => { const n = new Set(prev); adding ? n.add(id) : n.delete(id); return n })
    startT(async () => {
      try { await toggleFavourite(id) }
      catch { setFavs(prev => { const n = new Set(prev); adding ? n.delete(id) : n.add(id); return n }); toast.error('Failed') }
    })
  }

  async function handleDownload(t: any) {
    if (t.tier === 'premium' && !isSubscriber) {
      toast.error('Upgrade to Pro to download premium templates')
      return
    }
    const format = t.format?.[0]
    if (!format) { toast.error('No format available'); return }
    setDlId(t._id)
    try {
      const result = await downloadTemplate(t._id, format)
      const a = document.createElement('a')
      a.href = result.url; a.download = t.title
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      toast.success('Download started')
      router.refresh()
    } catch (err: any) { toast.error(err.message || 'Download failed') }
    finally { setDlId(null) }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {firstName} 👋</div>
          <div className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
        </div>
        <Link href="/templates" className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:5 }}>
          Browse templates <ArrowRight size={13}/>
        </Link>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom:16 }}>
        <div className="stat-card">
          <div className="stat-label"><Download size={13}/> Downloads</div>
          <div className="stat-value">{fmt(user?.totalDownloads??0)}</div>
          {plan?.maxDownloadsPerMonth && <div className="stat-delta"><span className="delta-neutral">of {plan.maxDownloadsPerMonth}/month</span></div>}
        </div>
        <div className="stat-card">
          <div className="stat-label"><Heart size={13}/> Favourites</div>
          <div className="stat-value">{fmt(user?.favourites?.length??0)}</div>
          <div className="stat-delta"><Link href="/dashboard/favourites" style={{ color:'var(--brand)', textDecoration:'none', fontSize:11 }}>View saved →</Link></div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><CreditCard size={13}/> Plan</div>
          <div className="stat-value" style={{ fontSize:18, marginTop:3 }}>{plan?.name ?? 'Free'}</div>
          {sub?.currentPeriodEnd && <div className="stat-delta"><span className="delta-neutral">renews {fmtDate(sub.currentPeriodEnd)}</span></div>}
        </div>
        <div className="stat-card">
          <div className="stat-label"><Star size={13}/> Member since</div>
          <div className="stat-value" style={{ fontSize:16, marginTop:3 }}>{user?.createdAt ? fmtDate(user.createdAt) : '—'}</div>
        </div>
      </div>

      {/* Upgrade banner for free users */}
      {!isSubscriber && (
        <div style={{ marginBottom:16, padding:'16px 20px', background:'linear-gradient(135deg, var(--brand) 0%, #1e3a8a 100%)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div>
            <div style={{ fontSize:13.5, fontWeight:600, color:'#fff', marginBottom:3 }}>Unlock all premium templates</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.7)' }}>Unlimited downloads · Access to every premium template · Cancel anytime</div>
          </div>
          <Link href="/dashboard/billing" style={{ flexShrink:0, padding:'8px 18px', background:'var(--gold)', color:'#030329', fontWeight:700, borderRadius:4, fontSize:13, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}>
            Upgrade to Pro →
          </Link>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:14 }}>
        {/* New templates to browse */}
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">New templates</div><div className="card-subtitle">Latest additions to the library</div></div>
            <Link href="/templates" className="btn btn-secondary btn-sm">View all</Link>
          </div>
          {recentTemplates.length === 0 ? (
            <div style={{ padding:'32px 16px', textAlign:'center', color:'var(--ink-4)', fontSize:12.5 }}>No templates yet.</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:0 }}>
              {recentTemplates.slice(0,6).map((t:any, i:number) => (
                <div key={t._id} style={{ position:'relative', borderRight: i%2===0 ? '1px solid var(--line)' : 'none', borderBottom: i<4 ? '1px solid var(--line)' : 'none' }}>
                  {/* Thumbnail → links to template view */}
                  <Link href={`/dashboard/templates/${t._id}`} style={{ display:'block', position:'relative', width:'100%', paddingTop:'62.5%', background:'var(--surface)', overflow:'hidden', textDecoration:'none' }}>
                    {t.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.thumbnailUrl} alt={t.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
                    )}
                    {t.tier==='premium' && !isSubscriber && (
                      <div style={{ position:'absolute', top:6, right:6, width:20, height:20, borderRadius:3, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Lock size={10} color="#fff"/>
                      </div>
                    )}
                    <div style={{ position:'absolute', inset:0, background:'rgba(3,3,41,0)', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(3,3,41,.5)'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(3,3,41,0)'}}>
                      <Eye size={16} color="#fff" style={{ opacity:0, transition:'opacity .2s' }}/>
                    </div>
                  </Link>
                  {/* Info + actions */}
                  <div style={{ padding:'10px 12px' }}>
                    <Link href={`/dashboard/templates/${t._id}`} style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--ink)', marginBottom:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration:'none' }}>{t.title}</Link>
                    <div style={{ display:'flex', gap:5 }}>
                      <button
                        onClick={() => handleDownload(t)}
                        disabled={!!dlId}
                        style={{ flex:1, height:26, border:`1px solid ${t.tier==='premium'&&!isSubscriber ? 'var(--gold-border)' : 'var(--gold)'}`, borderRadius:3, background: t.tier==='premium'&&!isSubscriber ? 'var(--gold-light)' : 'var(--gold)', color: t.tier==='premium'&&!isSubscriber ? 'var(--gold-dark)' : '#030329', fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}
                      >
                        {dlId===t._id ? <Loader2 size={10} className="animate-spin"/> : <Download size={10}/>}
                        {t.tier==='premium'&&!isSubscriber ? 'Pro' : 'Download'}
                      </button>
                      <button
                        onClick={() => handleFav(t._id)}
                        style={{ width:26, height:26, border:'1px solid var(--line-2)', borderRadius:3, background:'var(--card)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                      >
                        <Heart size={11} color={favs.has(t._id)?'#ef4444':'var(--ink-4)'} fill={favs.has(t._id)?'#ef4444':'none'}/>
                      </button>
                      <Link href={`/dashboard/templates/${t._id}`} style={{ width:26, height:26, border:'1px solid var(--line-2)', borderRadius:3, background:'var(--card)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, textDecoration:'none' }}>
                        <ArrowRight size={10} color="var(--ink-4)"/>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Subscription card */}
          <div className="card" style={{ padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div className="card-title">Subscription</div>
              <Link href="/dashboard/billing" className="btn btn-secondary btn-sm">Manage</Link>
            </div>
            {isSubscriber && sub ? (
              <>
                <div style={{ padding:'12px', background:'var(--brand)', borderRadius:5, marginBottom:12 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{plan.name}</div>
                  <div style={{ fontSize:11.5, color:'rgba(255,255,255,.6)', marginTop:2 }}>
                    {fmtCurrency(sub.priceAtPurchase)} / {plan.interval}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {(plan.features??[]).slice(0,3).map((f:string) => (
                    <div key={f} style={{ display:'flex', gap:6, fontSize:12, color:'var(--ink-2)' }}>
                      <Check size={12} color="var(--green)" style={{ flexShrink:0, marginTop:1 }}/> {f}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ padding:'10px 12px', background:'var(--surface)', border:'1px solid var(--line)', borderRadius:4, marginBottom:12 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:'var(--ink)', marginBottom:2 }}>Free plan</div>
                  <div style={{ fontSize:12, color:'var(--ink-4)' }}>5 downloads/month · Free templates only</div>
                </div>
                <Link href="/dashboard/billing" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:34, background:'var(--gold)', color:'#030329', borderRadius:4, fontWeight:700, fontSize:12.5, fontWeight:600, textDecoration:'none' }}>
                  Upgrade to Pro →
                </Link>
              </>
            )}
          </div>

          {/* Recent downloads */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent downloads</div>
              <Link href="/dashboard/my-downloads" className="btn btn-secondary btn-sm">All</Link>
            </div>
            {recentDownloads.length === 0 ? (
              <div style={{ padding:'20px 14px', textAlign:'center', color:'var(--ink-4)', fontSize:12 }}>
                No downloads yet.<br />
                <Link href="/templates" style={{ color:'var(--brand)', textDecoration:'none', fontWeight:500 }}>Browse templates →</Link>
              </div>
            ) : recentDownloads.slice(0,4).map((d:any) => (
              <div key={d._id} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 14px', borderBottom:'1px solid var(--line)' }}>
                <div style={{ width:38, height:24, background:'var(--surface)', borderRadius:2, flexShrink:0, overflow:'hidden' }}>
                  {d.template?.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.template.thumbnailUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.template?.title??'—'}</div>
                  <div style={{ fontSize:11, color:'var(--ink-4)', marginTop:1 }}>{timeAgo(d.downloadedAt)}</div>
                </div>
                <StatusBadge status={d.template?.tier??'free'}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
