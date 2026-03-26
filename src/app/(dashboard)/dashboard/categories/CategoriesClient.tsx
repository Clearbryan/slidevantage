'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog, FormField } from '@/components/ui/index'
import { createCategory, updateCategory, deleteCategory } from '@/actions'
import { fmt } from '@/lib/utils'

interface Cat { _id:string; name:string; slug:string; description?:string; icon?:string; order:number; templateCount:number; isActive:boolean }

const ICONS = ['💼','📈','🎯','🎓','🎨','📊','🚀','💡','🌍','🏆','📱','⚡','🎪','🎭','🎬']

export function CategoriesClient({ data }: { data: Cat[] }) {
  const router = useRouter()
  const [showModal, setShow] = useState(false)
  const [editCat, setEdit]   = useState<Cat|null>(null)
  const [deleteId, setDel]   = useState<string|null>(null)
  const [saving, setSaving]  = useState(false)
  const [deleting, setDel2]  = useState(false)
  const [icon, setIcon]      = useState('💼')
  const [form, setForm]      = useState({ name:'', description:'', order:0 })

  function openCreate() {
    setEdit(null); setIcon('💼')
    setForm({ name:'', description:'', order: data.length+1 })
    setShow(true)
  }
  function openEdit(c: Cat) {
    setEdit(c); setIcon(c.icon??'💼')
    setForm({ name:c.name, description:c.description??'', order:c.order })
    setShow(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      if (editCat) {
        await updateCategory(editCat._id, { ...form, icon })
        toast.success('Category updated')
      } else {
        await createCategory({ ...form, icon })
        toast.success('Category created')
      }
      setShow(false); router.refresh()
    } catch (e:any) { toast.error(e.message||'Failed to save') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDel2(true)
    try {
      await deleteCategory(deleteId)
      toast.success('Category deleted'); router.refresh()
    } catch { toast.error('Failed to delete') }
    finally { setDel2(false); setDel(null) }
  }

  async function handleToggle(c: Cat) {
    try {
      await updateCategory(c._id, { isActive: !c.isActive })
      toast.success(c.isActive ? 'Category disabled' : 'Category enabled')
      router.refresh()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Categories</div>
          <div className="page-subtitle">{data.length} categories</div>
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-sm"><Plus size={12}/> New category</button>
      </div>

      {data.length===0 && (
        <div className="card" style={{ padding:'48px', textAlign:'center' }}>
          <div style={{ fontSize:12.5, color:'#a1a1aa', marginBottom:14 }}>No categories yet. Create your first one.</div>
          <button onClick={openCreate} className="btn btn-primary btn-sm" style={{ margin:'0 auto' }}><Plus size={12}/> Create category</button>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:10 }}>
        {data.map(c => (
          <div key={c._id} className="card" style={{ padding:16, opacity:c.isActive?1:.55, transition:'opacity .2s' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:4, background:'#f4f4f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {c.icon??'📁'}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)' }}>{c.name}</div>
                  <div style={{ fontSize:11, color:'#a1a1aa', fontFamily:'monospace' }}>/{c.slug}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:2 }}>
                <button onClick={() => handleToggle(c)} className="btn btn-ghost btn-icon-sm">
                  {c.isActive ? <ToggleRight size={16} color="#16a34a"/> : <ToggleLeft size={16} color="#a1a1aa"/>}
                </button>
                <button onClick={() => openEdit(c)} className="btn btn-ghost btn-icon-sm"><Pencil size={13}/></button>
                <button onClick={() => setDel(c._id)} className="btn btn-ghost btn-icon-sm" style={{ color:'#dc2626' }}><Trash2 size={13}/></button>
              </div>
            </div>
            {c.description && <div style={{ fontSize:12, color:'#71717a', marginBottom:10, lineHeight:1.5 }}>{c.description}</div>}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid #f4f4f5' }}>
              <span style={{ fontSize:12, color:'#52525b' }}><strong>{fmt(c.templateCount)}</strong> templates</span>
              <span style={{ fontSize:11, color:c.isActive?'#16a34a':'#a1a1aa', background:c.isActive?'#f0fdf4':'#fafafa', border:`1px solid ${c.isActive?'#bbf7d0':'#e4e4e7'}`, padding:'2px 7px', borderRadius:3, fontWeight:500 }}>
                {c.isActive?'Active':'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShow(false)} title={editCat?'Edit category':'New category'} size="sm"
        footer={<>
          <button onClick={() => setShow(false)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? <><Loader2 size={13} className="animate-spin"/>Saving…</> : editCat?'Save changes':'Create'}
          </button>
        </>}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <div className="label">Icon</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  style={{ width:36, height:36, fontSize:18, borderRadius:4, border:`1px solid ${icon===ic?'var(--gold)':'var(--line-2)'}`, background:icon===ic?'var(--gold-light)':'#fff', cursor:'pointer' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <FormField label="Name" required>
            <input className="input" placeholder="e.g. Business" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}/>
          </FormField>
          <FormField label="Description">
            <textarea className="textarea" rows={2} placeholder="Brief description…" value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))}/>
          </FormField>
          <FormField label="Display order">
            <input type="number" className="input" min={0} value={form.order} onChange={e => setForm(p=>({...p,order:Number(e.target.value)}))}/>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDel(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete category?" confirmLabel="Delete"
        message="Templates in this category will become uncategorised. This cannot be undone."/>
    </div>
  )
}
