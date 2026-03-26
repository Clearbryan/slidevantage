'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, ImageIcon, X, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog, FormField } from '@/components/ui/index'
import { createBanner, updateBanner, deleteBanner } from '@/actions'
import { fmtDate } from '@/lib/utils'

interface Banner { _id:string; title:string; subtitle?:string; imageUrl:string; linkUrl?:string; isActive:boolean; order:number; startsAt?:string; endsAt?:string }
interface Props { data: Banner[] }

const BLANK = { title:'', subtitle:'', imageUrl:'', linkUrl:'', order:1, startsAt:'', endsAt:'' }

// Full-width banner upload component (16:9, 1280×480 ideal)
function BannerImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [over, setOver]           = useState(false)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 20 * 1024 * 1024)   { toast.error('Image must be under 20 MB'); return }
    setUploading(true)
    try {
      const res  = await fetch('/api/upload', {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-file-name': encodeURIComponent(file.name),
          'x-file-size': String(file.size),
          'x-file-type': file.type,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      onChange(data.url)
      toast.success('Image uploaded')
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  return (
    <div>
      <div className="label" style={{ marginBottom: 8 }}>
        Banner image <span style={{ color: 'var(--red)' }}>*</span>
        <span style={{ fontWeight: 400, color: 'var(--ink-4)', marginLeft: 6 }}>Recommended 1280×480px · JPG, PNG, WebP · Max 20 MB</span>
      </div>

      {value ? (
        <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line-2)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Banner" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={24} className="animate-spin" color="var(--brand)" />
            </div>
          )}
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => ref.current?.click()}
              style={{ height: 30, padding: '0 10px', borderRadius: 4, background: 'rgba(255,255,255,.9)', border: '1px solid rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 11.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--ink)' }}>
              <Upload size={12} /> Replace
            </button>
            <button type="button" onClick={() => onChange('')}
              style={{ width: 30, height: 30, borderRadius: 4, background: 'rgba(0,0,0,.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <X size={14} />
            </button>
          </div>
          <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>
      ) : (
        <div
          className={`upload-zone${over ? ' over' : ''}`}
          style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        >
          <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          {uploading ? (
            <Loader2 size={28} className="animate-spin" color="var(--brand)" />
          ) : (
            <>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={22} color="var(--brand)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>
                  Drop banner image here or <span style={{ color: 'var(--brand)', fontWeight: 600 }}>browse</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>JPG, PNG, WebP · Max 20 MB · Recommended 1280×480</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function BannersClient({ data }: Props) {
  const router = useRouter()
  const [showModal, setShow]  = useState(false)
  const [editBanner, setEdit] = useState<Banner|null>(null)
  const [deleteId, setDel]    = useState<string|null>(null)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDel2]   = useState(false)
  const [form, setForm]       = useState(BLANK)

  function openCreate() { setEdit(null); setForm({ ...BLANK, order: data.length + 1 }); setShow(true) }
  function openEdit(b: Banner) {
    setEdit(b)
    setForm({ title: b.title, subtitle: b.subtitle??'', imageUrl: b.imageUrl, linkUrl: b.linkUrl??'', order: b.order, startsAt: b.startsAt ? b.startsAt.slice(0,10) : '', endsAt: b.endsAt ? b.endsAt.slice(0,10) : '' })
    setShow(true)
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.imageUrl)     { toast.error('Please upload a banner image'); return }
    setSaving(true)
    try {
      if (editBanner) { await updateBanner(editBanner._id, form); toast.success('Banner updated') }
      else            { await createBanner(form); toast.success('Banner created') }
      setShow(false); router.refresh()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  async function handleToggle(b: Banner) {
    try { await updateBanner(b._id, { isActive: !b.isActive }); router.refresh() }
    catch { toast.error('Failed') }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDel2(true)
    try { await deleteBanner(deleteId); toast.success('Banner deleted'); router.refresh() }
    catch { toast.error('Failed') }
    finally { setDel2(false); setDel(null) }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Banners</div><div className="page-subtitle">{data.length} homepage banner{data.length !== 1 ? 's' : ''}</div></div>
        <button onClick={openCreate} className="btn btn-primary btn-sm"><Plus size={12}/> New banner</button>
      </div>

      {data.length === 0 && (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <ImageIcon size={28} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block', opacity: .25 }}/>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginBottom: 14 }}>No banners yet. Create one to show on the landing page.</div>
          <button onClick={openCreate} className="btn btn-primary btn-sm" style={{ margin: '0 auto' }}><Plus size={12}/> Create banner</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...data].sort((a,b) => a.order - b.order).map(b => (
          <div key={b._id} className="card" style={{ display: 'flex', overflow: 'hidden', opacity: b.isActive ? 1 : .55 }}>
            {/* Wide image preview */}
            <div style={{ width: 220, height: 110, flexShrink: 0, background: 'var(--surface)', overflow: 'hidden', position: 'relative' }}>
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.imageUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).parentElement!.style.background = 'var(--surface)' }}/>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={20} color="var(--line-2)"/>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 10.5, color: 'var(--ink-4)', background: 'var(--surface)', padding: '1px 6px', borderRadius: 2, fontFamily: 'monospace' }}>#{b.order}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: b.isActive ? 'var(--green)' : 'var(--ink-4)', background: b.isActive ? 'var(--green-light)' : 'var(--surface)', border: `1px solid ${b.isActive ? 'var(--green-border)' : 'var(--line-2)'}`, padding: '2px 7px', borderRadius: 3 }}>
                    {b.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{b.title}</div>
                {b.subtitle && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>{b.subtitle}</div>}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {b.linkUrl && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>→ {b.linkUrl}</span>}
                  {(b.startsAt||b.endsAt) && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{b.startsAt ? fmtDate(b.startsAt) : '∞'} — {b.endsAt ? fmtDate(b.endsAt) : '∞'}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => handleToggle(b)} className="btn btn-ghost btn-icon-sm" title={b.isActive ? 'Deactivate' : 'Activate'}>
                  {b.isActive ? <ToggleRight size={16} color="var(--green)"/> : <ToggleLeft size={16} color="var(--ink-4)"/>}
                </button>
                <button onClick={() => openEdit(b)} className="btn btn-ghost btn-icon-sm"><Pencil size={13}/></button>
                <button onClick={() => setDel(b._id)} className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--red)' }}><Trash2 size={13}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShow(false)} title={editBanner ? 'Edit banner' : 'New banner'} subtitle="Hero banner shown on the landing page" size="lg"
        footer={<>
          <button onClick={() => setShow(false)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? <><Loader2 size={13} className="animate-spin"/>Saving…</> : editBanner ? 'Save changes' : 'Create banner'}
          </button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <BannerImageUpload value={form.imageUrl} onChange={url => setForm(p => ({...p, imageUrl: url}))} />

          <FormField label="Headline" required hint="Large text shown over the banner image">
            <input className="input" placeholder="e.g. New Year. New Slides." value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}/>
          </FormField>

          <FormField label="Subheading" hint="Smaller supporting text below the headline">
            <input className="input" placeholder="Brief description or call to action…" value={form.subtitle} onChange={e => setForm(p => ({...p, subtitle: e.target.value}))}/>
          </FormField>

          <FormField label="Button destination" hint="Where the banner button links to">
            <select className="select" style={{ width:'100%' }} value={form.linkUrl} onChange={e => setForm(p => ({...p, linkUrl: e.target.value}))}>
              <option value="">Browse Templates (default)</option>
              <option value="/templates">All Templates</option>
              <option value="/templates?tier=free">Free Templates</option>
              <option value="/templates?tier=premium">Premium Templates</option>
              <option value="/pricing">Pricing / Plans</option>
              <option value="/register">Sign Up</option>
            </select>
          </FormField>

          <div className="form-grid-2">
            <FormField label="Display order" hint="Lower numbers appear first">
              <input type="number" className="input" min={1} value={form.order} onChange={e => setForm(p => ({...p, order: Number(e.target.value)}))}/>
            </FormField>
            <div/>
            <FormField label="Show from">
              <input type="date" className="input" value={form.startsAt} onChange={e => setForm(p => ({...p, startsAt: e.target.value}))}/>
            </FormField>
            <FormField label="Show until">
              <input type="date" className="input" value={form.endsAt} onChange={e => setForm(p => ({...p, endsAt: e.target.value}))}/>
            </FormField>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDel(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete banner?" confirmLabel="Delete"
        message="This banner will be permanently removed from the landing page."/>
    </div>
  )
}
