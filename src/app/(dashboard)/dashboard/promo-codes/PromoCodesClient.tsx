'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Copy, ToggleLeft, ToggleRight, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog, FormField, StatusBadge } from '@/components/ui/index'
import { createPromoCode, togglePromoCode, deletePromoCode } from '@/actions'
import { fmtDate, generateCode } from '@/lib/utils'

interface PromoCode { _id:string; code:string; discountType:'percentage'|'fixed'; discountValue:number; usageLimit:number|null; usedCount:number; expiresAt?:string; isActive:boolean; createdAt:string }
interface Props { data:PromoCode[]; total:number; page:number; pageSize:number }

export function PromoCodesClient({ data, total, page, pageSize }: Props) {
  const router = useRouter()
  const [showModal, setShow] = useState(false)
  const [deleteId, setDel]   = useState<string|null>(null)
  const [saving, setSaving]  = useState(false)
  const [deleting, setDel2]  = useState(false)
  const [form, setForm] = useState({ code:generateCode(), discountType:'percentage' as 'percentage'|'fixed', discountValue:20, usageLimit:'', expiresAt:'' })

  async function handleCreate() {
    if (!form.code.trim()) { toast.error('Code is required'); return }
    if (form.discountValue<=0) { toast.error('Discount value must be greater than 0'); return }
    setSaving(true)
    try {
      await createPromoCode({ code:form.code.toUpperCase(), discountType:form.discountType, discountValue:Number(form.discountValue), usageLimit:form.usageLimit?Number(form.usageLimit):undefined, expiresAt:form.expiresAt||undefined })
      toast.success('Promo code created'); setShow(false); router.refresh()
      setForm({ code:generateCode(), discountType:'percentage', discountValue:20, usageLimit:'', expiresAt:'' })
    } catch (e:any) { toast.error(e.message||'Failed') }
    finally { setSaving(false) }
  }

  async function handleToggle(c: PromoCode) {
    try {
      await togglePromoCode(c._id, !c.isActive)
      toast.success(c.isActive?'Code deactivated':'Code activated'); router.refresh()
    } catch { toast.error('Failed') }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDel2(true)
    try { await deletePromoCode(deleteId); toast.success('Deleted'); router.refresh() }
    catch { toast.error('Failed') }
    finally { setDel2(false); setDel(null) }
  }

  const columns: Column<PromoCode>[] = [
    {
      key:'code', header:'Code',
      render: c => (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <code style={{ fontFamily:'monospace', fontSize:12.5, fontWeight:700, color:'var(--ink)', background:'#f4f4f5', padding:'2px 8px', borderRadius:3, letterSpacing:'0.05em' }}>{c.code}</code>
          <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Copied!') }} className="btn btn-ghost btn-icon-xs"><Copy size={12}/></button>
        </div>
      ),
    },
    {
      key:'discount', header:'Discount', width:110,
      render: c => <span style={{ fontWeight:600, fontSize:13, color:'var(--ink)' }}>{c.discountType==='percentage'?`${c.discountValue}% off`:`$${c.discountValue} off`}</span>,
    },
    {
      key:'usage', header:'Usage', width:150,
      render: c => {
        const pct = c.usageLimit ? Math.min(100,(c.usedCount/c.usageLimit)*100) : 0
        return (
          <div>
            <div style={{ fontSize:12, marginBottom:4 }}>{c.usedCount}{c.usageLimit?` / ${c.usageLimit}`:' (unlimited)'}</div>
            {c.usageLimit && <div style={{ height:3, background:'#f4f4f5', borderRadius:2, width:90 }}><div style={{ height:3, background:pct>=90?'var(--red)':'var(--brand)', width:`${pct}%`, borderRadius:2 }}/></div>}
          </div>
        )
      },
    },
    { key:'expires', header:'Expires', width:110, render:c => <span style={{ color:'#a1a1aa' }}>{c.expiresAt?fmtDate(c.expiresAt):'Never'}</span> },
    { key:'status', header:'Status', width:90, render:c => <StatusBadge status={c.isActive?'active':'inactive'}/> },
    {
      key:'actions', header:'', width:80,
      render: c => (
        <div className="row-actions" style={{ justifyContent:'flex-end' }}>
          <button onClick={() => handleToggle(c)} className="btn btn-ghost btn-icon-sm">
            {c.isActive?<ToggleRight size={15} color="#16a34a"/>:<ToggleLeft size={15} color="#a1a1aa"/>}
          </button>
          <button onClick={() => setDel(c._id)} className="btn btn-ghost btn-icon-sm" style={{ color:'#dc2626' }}><Trash2 size={13}/></button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Promo Codes</div><div className="page-subtitle">{data.filter(c=>c.isActive).length} active codes</div></div>
        <button onClick={() => setShow(true)} className="btn btn-primary btn-sm"><Plus size={12}/> New code</button>
      </div>
      <DataTable columns={columns} data={data} total={total} page={page} pageSize={pageSize} emptyMessage="No promo codes yet" rowKey={c=>c._id}/>

      <Modal open={showModal} onClose={() => setShow(false)} title="New promo code" subtitle="Create a discount code" size="sm"
        footer={<><button onClick={() => setShow(false)} className="btn btn-secondary">Cancel</button><button onClick={handleCreate} disabled={saving} className="btn btn-primary">{saving?<><Loader2 size={13} className="animate-spin"/>Creating…</>:'Create code'}</button></>}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <FormField label="Code">
            <div style={{ display:'flex', gap:8 }}>
              <input className="input" style={{ fontFamily:'monospace', fontWeight:700, textTransform:'uppercase', flex:1 }} value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value.toUpperCase()}))} maxLength={20}/>
              <button onClick={() => setForm(p=>({...p,code:generateCode()}))} className="btn btn-secondary btn-icon" title="Regenerate"><RefreshCw size={13}/></button>
            </div>
          </FormField>
          <div className="form-grid-2">
            <FormField label="Type">
              <select className="select" value={form.discountType} onChange={e => setForm(p=>({...p,discountType:e.target.value as any}))} style={{ width:'100%' }}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </FormField>
            <FormField label="Value">
              <input type="number" className="input" min={1} value={form.discountValue} onChange={e => setForm(p=>({...p,discountValue:Number(e.target.value)}))}/>
            </FormField>
          </div>
          <div className="form-grid-2">
            <FormField label="Usage limit" hint="Leave empty for unlimited">
              <input type="number" className="input" placeholder="Unlimited" min={1} value={form.usageLimit} onChange={e => setForm(p=>({...p,usageLimit:e.target.value}))}/>
            </FormField>
            <FormField label="Expires at">
              <input type="date" className="input" value={form.expiresAt} onChange={e => setForm(p=>({...p,expiresAt:e.target.value}))}/>
            </FormField>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDel(null)} onConfirm={handleDelete} loading={deleting} title="Delete promo code?" confirmLabel="Delete" message="This code will be permanently removed and can no longer be used."/>
    </div>
  )
}
