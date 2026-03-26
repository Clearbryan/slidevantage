'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Plus, X, Images, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { TabbedModal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/index'
import { ThumbnailUpload, FileUpload } from '@/components/ui/FileUpload'
import { createTemplate, updateTemplate } from '@/actions/template.actions'

// ── Slide preview multi-uploader ─────────────────────────────────────────────
function SlidePreviewUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList) {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!valid.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(valid.map(async file => {
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
        return data.url as string
      }))
      onChange([...images, ...urls])
      toast.success(`${urls.length} slide${urls.length > 1 ? 's' : ''} uploaded`)
    } catch (e: any) { toast.error(e.message) }
    finally { setUploading(false) }
  }

  function remove(idx: number) {
    onChange(images.filter((_, i) => i !== idx))
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    const n = [...images]
    ;[n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]
    onChange(n)
  }

  function moveDown(idx: number) {
    if (idx === images.length - 1) return
    const n = [...images]
    ;[n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]
    onChange(n)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div className="label" style={{ marginBottom: 2 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Images size={13} /> Slide preview images
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>
            Upload one image per slide in order. Users will browse through these in the template viewer.
          </div>
        </div>
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="btn btn-secondary btn-sm" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
          {uploading ? <><Loader2 size={12} className="animate-spin"/> Uploading…</> : <><Plus size={12}/> Add slides</>}
        </button>
      </div>

      <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = '' }} />

      {images.length === 0 ? (
        <div
          onClick={() => ref.current?.click()}
          style={{ border: '1.5px dashed var(--line-2)', borderRadius: 6, padding: '24px', textAlign: 'center', cursor: 'pointer', background: 'var(--surface)' }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
        >
          <Upload size={20} color="var(--ink-4)" style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>Drop slide images here or <span style={{ color: 'var(--brand)' }}>browse</span></div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 4 }}>JPG, PNG, WebP · One image per slide · In order</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
          {images.map((img, i) => (
            <div key={img + i} style={{ position: 'relative', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--line-2)', background: 'var(--surface)', aspectRatio: '16/10' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Slide ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {/* Slide number */}
              <div style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.55)', padding: '1px 5px', borderRadius: 3 }}>
                {i + 1}
              </div>
              {/* Controls */}
              <div style={{ position: 'absolute', top: 3, right: 3, display: 'flex', gap: 3 }}>
                {i > 0 && (
                  <button type="button" onClick={() => moveUp(i)} style={{ width: 18, height: 18, fontSize: 9, background: 'rgba(0,0,0,.5)', border: 'none', borderRadius: 3, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Move left">←</button>
                )}
                {i < images.length - 1 && (
                  <button type="button" onClick={() => moveDown(i)} style={{ width: 18, height: 18, fontSize: 9, background: 'rgba(0,0,0,.5)', border: 'none', borderRadius: 3, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Move right">→</button>
                )}
                <button type="button" onClick={() => remove(i)} style={{ width: 18, height: 18, background: 'rgba(220,38,38,.7)', border: 'none', borderRadius: 3, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={10} />
                </button>
              </div>
            </div>
          ))}
          {/* Add more button */}
          <div onClick={() => ref.current?.click()}
            style={{ border: '1.5px dashed var(--line-2)', borderRadius: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', aspectRatio: '16/10', background: 'var(--surface)' }}>
            <Plus size={16} color="var(--ink-4)" />
            <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>Add more</span>
          </div>
        </div>
      )}
    </div>
  )
}

const FORMATS = [
  { value:'powerpoint',    label:'PowerPoint (.pptx)' },
  { value:'google_slides', label:'Google Slides' },
  { value:'keynote',       label:'Keynote (.key)' },
  { value:'canva',         label:'Canva' },
]

const TABS = [
  { id:'details',  label:'Details'  },
  { id:'files',    label:'Files'    },
  { id:'settings', label:'Settings' },
]

/** Accepts a comma-separated string OR an array — always returns a clean string[] */
function parseTags(input: string | string[] | undefined | null): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.map(t => t.trim()).filter(Boolean)
  return input.split(',').map(t => t.trim()).filter(Boolean)
}

interface Category { _id:string; name:string }
interface Template {
  _id:string; title:string; description:string
  category?: { _id?:string; name:string } | string | null
  format:string[]; tier:string; status:string
  thumbnailUrl:string; tags:string[]; slideCount?:number
  isFeatured:boolean; fileUrls?: Record<string,string>
}

interface Props {
  open:boolean; onClose:()=>void
  template:Template|null; categories:Category[]
  onSuccess:()=>void
}

function makeForm(t: Template|null) {
  return {
    title:         t?.title ?? '',
    description:   t?.description ?? '',
    category:      (typeof t?.category === 'object' && t?.category !== null)
                     ? ((t.category as any)._id ?? '')
                     : (t?.category as string) ?? '',
    tier:          t?.tier ?? 'free',
    status:        t?.status ?? 'draft',
    format:        t?.format ?? [] as string[],
    tags:          t?.tags?.join(', ') ?? '',
    slideCount:    t?.slideCount?.toString() ?? '',
    isFeatured:    t?.isFeatured ?? false,
    thumbnailUrl:  t?.thumbnailUrl ?? '',
    fileUrls:      (t?.fileUrls as Record<string,string>) ?? {},
    previewImages: (t as any)?.previewImages ?? [] as string[],
  }
}

export function TemplateModal({ open, onClose, template, categories, onSuccess }: Props) {
  const isEdit = !!template
  const [tab,     setTab]     = useState('details')
  const [saving,  setSaving]  = useState(false)
  const [errors,  setErrors]  = useState<Record<string,string>>({})
  const [form,    setForm]    = useState(() => makeForm(template))

  // Reset form whenever the modal opens or the template changes
  useEffect(() => {
    if (open) {
      setForm(makeForm(template))
      setTab('details')
      setErrors({})
    }
  }, [open, template])

  function update(k: string, v: unknown) {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  function toggleFormat(f: string) {
    setForm(p => ({
      ...p,
      format: p.format.includes(f)
        ? p.format.filter(x => x !== f)
        : [...p.format, f],
    }))
  }

  function validate() {
    const e: Record<string,string> = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.category)           e.category    = 'Category is required'
    if (!form.format.length)      e.format      = 'Select at least one format'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSave() {
    if (!validate()) { setTab('details'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags:          parseTags(form.tags),
        slideCount:    form.slideCount ? Number(form.slideCount) : undefined,
        previewImages: form.previewImages,
      }
      if (isEdit) {
        await updateTemplate(template._id, payload as any)
      } else {
        await createTemplate(payload as any)
      }
      onSuccess()
      setTab('details')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const saveBtn = (
    <button onClick={handleSave} disabled={saving} className="btn btn-primary">
      {saving
        ? <><Loader2 size={13} className="animate-spin"/>{isEdit ? 'Saving…' : 'Creating…'}</>
        : isEdit ? 'Save changes' : 'Create template'
      }
    </button>
  )

  return (
    <TabbedModal
      open={open} onClose={onClose}
      title={isEdit ? 'Edit template' : 'New template'}
      subtitle={isEdit ? 'Update details, files and settings' : 'Add a new presentation template'}
      size="lg"
      tabs={TABS} activeTab={tab} onTabChange={setTab}
      footerSplit={{
        left:  <button onClick={onClose} className="btn btn-secondary">Cancel</button>,
        right: (
          <div style={{ display:'flex', gap:8 }}>
            {tab !== 'settings' && (
              <button onClick={() => setTab(tab === 'details' ? 'files' : 'settings')} className="btn btn-secondary">
                Next →
              </button>
            )}
            {saveBtn}
          </div>
        ),
      }}
    >
      {/* ── Details ── */}
      {tab === 'details' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <FormField label="Title" error={errors.title} required>
            <input
              className={`input${errors.title ? ' input-error' : ''}`}
              placeholder="e.g. Corporate Pitch Deck Pro"
              value={form.title}
              onChange={e => update('title', e.target.value)}
            />
          </FormField>

          <FormField label="Description" error={errors.description} required>
            <textarea
              className={`textarea${errors.description ? ' input-error' : ''}`}
              rows={3}
              placeholder="What makes this template great…"
              value={form.description}
              onChange={e => update('description', e.target.value)}
            />
          </FormField>

          <div className="form-grid-2">
            <FormField label="Category" error={errors.category} required>
              <select
                className={`select${errors.category ? ' input-error' : ''}`}
                value={form.category}
                onChange={e => update('category', e.target.value)}
                style={{ width:'100%' }}
              >
                <option value="">Select category…</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Pricing tier">
              <select className="select" value={form.tier} onChange={e => update('tier', e.target.value)} style={{ width:'100%' }}>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </FormField>
          </div>

          <FormField label="Available formats" error={errors.format} required>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {FORMATS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => toggleFormat(f.value)}
                  style={{
                    padding:'5px 12px', fontSize:12, fontWeight:500, borderRadius:4,
                    border:`1px solid ${form.format.includes(f.value) ? 'var(--brand)' : 'var(--line-2)'}`,
                    cursor:'pointer',
                    background: form.format.includes(f.value) ? 'var(--brand)' : '#fff',
                    color:      form.format.includes(f.value) ? '#fff'    : '#52525b',
                    transition:'all .1s',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {errors.format && <div className="field-error">{errors.format}</div>}
          </FormField>

          <FormField label="Tags" hint="Comma-separated: business, pitch, startup">
            <input
              className="input"
              placeholder="business, pitch, corporate"
              value={form.tags}
              onChange={e => update('tags', e.target.value)}
            />
          </FormField>
        </div>
      )}

      {/* ── Files ── */}
      {tab === 'files' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <ThumbnailUpload
            value={form.thumbnailUrl}
            onChange={url => update('thumbnailUrl', url)}
          />

          {/* ── Slide preview images ── */}
          <SlidePreviewUploader
            images={form.previewImages}
            onChange={imgs => update('previewImages', imgs)}
          />

          {form.format.length === 0 ? (
            <div style={{ padding:'24px', textAlign:'center', border:'1.5px dashed var(--line-2)', borderRadius:4, fontSize:12.5, color:'var(--ink-4)' }}>
              Select formats on the Details tab first, then upload files here.
            </div>
          ) : (
            <div>
              <div style={{ fontSize:12.5, fontWeight:500, color:'var(--ink)', marginBottom:12 }}>Downloadable files</div>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {form.format.map(f => (
                  <FileUpload
                    key={f}
                    label={FORMATS.find(x => x.value === f)?.label ?? f}
                    format={f}
                    value={form.fileUrls[f]}
                    onChange={url => update('fileUrls', { ...form.fileUrls, [f]: url })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Settings ── */}
      {tab === 'settings' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-grid-2">
            <FormField label="Status">
              <select className="select" value={form.status} onChange={e => update('status', e.target.value)} style={{ width:'100%' }}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
            <FormField label="Slide count">
              <input
                type="number" className="input"
                placeholder="e.g. 24" min={1}
                value={form.slideCount}
                onChange={e => update('slideCount', e.target.value)}
              />
            </FormField>
          </div>

          {/* Featured toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', border:'1px solid #e4e4e7', borderRadius:4, background:'#fafafa' }}>
            <div>
              <div style={{ fontSize:12.5, fontWeight:500, color:'var(--ink)', marginBottom:2 }}>Feature on homepage</div>
              <div style={{ fontSize:11.5, color:'#a1a1aa' }}>Shows this template in the featured section</div>
            </div>
            <button
              type="button"
              onClick={() => update('isFeatured', !form.isFeatured)}
              style={{ position:'relative', width:36, height:20, borderRadius:10, border:'none', cursor:'pointer', background:form.isFeatured ? 'var(--brand)' : 'var(--line-2)', transition:'background .15s', flexShrink:0, padding:0 }}
            >
              <div style={{ position:'absolute', top:2, left:form.isFeatured ? 18 : 2, width:16, height:16, borderRadius:8, background:'#fff', transition:'left .15s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
            </button>
          </div>

          {/* Summary */}
          <div style={{ background:'#fafafa', border:'1px solid #f4f4f5', borderRadius:4, padding:'12px 14px' }}>
            <div style={{ fontSize:10.5, fontWeight:500, color:'#a1a1aa', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Summary</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 16px', fontSize:12.5 }}>
              <div><span style={{ color:'#a1a1aa' }}>Formats: </span><span style={{ fontWeight:500 }}>{form.format.length ? form.format.join(', ') : '—'}</span></div>
              <div><span style={{ color:'#a1a1aa' }}>Thumbnail: </span><span style={{ fontWeight:500, color:form.thumbnailUrl ? '#16a34a' : '#a1a1aa' }}>{form.thumbnailUrl ? 'Uploaded ✓' : 'Not uploaded'}</span></div>
              <div><span style={{ color:'#a1a1aa' }}>Files: </span><span style={{ fontWeight:500 }}>{Object.values(form.fileUrls).filter(Boolean).length} / {form.format.length} uploaded</span></div>
              <div><span style={{ color:'#a1a1aa' }}>Status: </span><span style={{ fontWeight:500, textTransform:'capitalize' }}>{form.status}</span></div>
            </div>
          </div>
        </div>
      )}
    </TabbedModal>
  )
}
