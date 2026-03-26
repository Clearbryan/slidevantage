'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Trash2, Loader2, Check, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { FilterSelect, TableToolbar } from '@/components/ui/SearchBar'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge, PlanBadge, FormField, ConfirmDialog } from '@/components/ui/index'
import { updatePlan, overrideSubscriptionStatus, createPlan, deletePlan, togglePlanActive } from '@/actions'
import { fmtCurrency, fmtDate } from '@/lib/utils'

interface Plan { _id:string; name:string; type:string; interval:string; priceUSD:number; priceZWL:number; features:string[]; maxUsers:number; maxDownloadsPerMonth:number|null; isActive:boolean; stripePriceId?:string }
interface Sub  { _id:string; user?:{name:string;surname:string;email:string}; plan?:{name:string;type:string;interval:string}; status:string; paymentProvider:string; priceAtPurchase:number; currency:string; currentPeriodEnd:string; createdAt:string }
interface Props { data:Sub[]; total:number; page:number; pageSize:number; plans:Plan[]; view:string; isSuperAdmin:boolean }

const BLANK = { name:'', type:'individual', interval:'monthly', priceUSD:0, priceZWL:0, featuresRaw:'', maxUsers:1, maxDownloadsPerMonth:'' as string|number, stripePriceId:'' }

export function SubscriptionsClient({ data, total, page, pageSize, plans, view:initView, isSuperAdmin }: Props) {
  const router = useRouter()
  const [activeView, setView] = useState<'subscribers'|'plans'>(initView==='plans'?'plans':'subscribers')
  const [planModal, setPlanModal] = useState<'create'|'edit'|null>(null)
  const [editPlan, setEditPlan]   = useState<Plan|null>(null)
  const [planForm, setPlanForm]   = useState(BLANK)
  const [planSaving, setPlanSaving] = useState(false)
  const [deleteId, setDeleteId]   = useState<string|null>(null)
  const [deleting, setDeleting]   = useState(false)
  const [editSub, setEditSub]     = useState<Sub|null>(null)
  const [subStatus, setSubStatus] = useState('')
  const [subSaving, setSubSaving] = useState(false)

  function openEditPlan(p: Plan) {
    setEditPlan(p)
    setPlanForm({ name:p.name, type:p.type, interval:p.interval, priceUSD:p.priceUSD, priceZWL:p.priceZWL, featuresRaw:p.features.join('\n'), maxUsers:p.maxUsers, maxDownloadsPerMonth:p.maxDownloadsPerMonth??'', stripePriceId:p.stripePriceId??'' })
    setPlanModal('edit')
  }

  async function savePlan() {
    if (!planForm.name.trim()) { toast.error('Plan name is required'); return }
    setPlanSaving(true)
    try {
      const payload = { name:planForm.name, type:planForm.type, interval:planForm.interval, priceUSD:Number(planForm.priceUSD), priceZWL:Number(planForm.priceZWL), features:planForm.featuresRaw.split('\n').map((f:string)=>f.trim()).filter(Boolean), maxUsers:Number(planForm.maxUsers), maxDownloadsPerMonth:planForm.maxDownloadsPerMonth===''?null:Number(planForm.maxDownloadsPerMonth), stripePriceId:planForm.stripePriceId||undefined }
      if (planModal==='edit'&&editPlan) { await updatePlan(editPlan._id,payload); toast.success('Plan updated') }
      else { await createPlan(payload as any); toast.success('Plan created') }
      setPlanModal(null); router.refresh()
    } catch(e:any) { toast.error(e.message||'Failed') }
    finally { setPlanSaving(false) }
  }

  async function handleDeletePlan() {
    if (!deleteId) return
    setDeleting(true)
    try { await deletePlan(deleteId); toast.success('Plan deleted'); router.refresh() }
    catch(e:any) { toast.error(e.message||'Failed') }
    finally { setDeleting(false); setDeleteId(null) }
  }

  async function handleToggle(p: Plan) {
    try { await togglePlanActive(p._id,!p.isActive); router.refresh() }
    catch(e:any) { toast.error(e.message||'Failed') }
  }

  async function saveSubStatus() {
    if (!editSub) return
    setSubSaving(true)
    try { await overrideSubscriptionStatus(editSub._id,subStatus); toast.success('Updated'); setEditSub(null); router.refresh() }
    catch { toast.error('Failed') }
    finally { setSubSaving(false) }
  }

  const subCols: Column<Sub>[] = [
    { key:'user', header:'User', render:s=>s.user?(<div className="user-cell"><div className="user-avatar">{s.user.name[0]}{s.user.surname[0]}</div><div><div className="user-name">{s.user.name} {s.user.surname}</div><div className="user-email">{s.user.email}</div></div></div>):<span style={{color:'var(--ink-4)'}}>—</span> },
    { key:'plan',     header:'Plan',     width:140, render:s=>s.plan?<PlanBadge name={s.plan.name}/>:<span style={{color:'var(--ink-4)'}}>—</span> },
    { key:'status',   header:'Status',   width:100, render:s=><StatusBadge status={s.status}/> },
    { key:'provider', header:'Provider', width:90,  render:s=><span style={{fontSize:11.5,color:'var(--ink-2)',background:'var(--surface)',border:'1px solid var(--line-2)',padding:'2px 7px',borderRadius:3,textTransform:'capitalize'}}>{s.paymentProvider}</span> },
    { key:'amount',   header:'Amount',   width:90,  align:'right', render:s=><span style={{fontWeight:500}}>{fmtCurrency(s.priceAtPurchase,s.currency)}</span> },
    { key:'renews',   header:'Renews',   width:110, render:s=><span style={{color:'var(--ink-4)'}}>{fmtDate(s.currentPeriodEnd)}</span> },
    { key:'actions',  header:'', width:60, render:s=>(
        <div className="row-actions" style={{justifyContent:'flex-end'}}>
          <button onClick={()=>{setEditSub(s);setSubStatus(s.status)}} className="btn btn-ghost btn-icon-sm"><Pencil size={13}/></button>
        </div>
      )
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Subscriptions</div><div className="page-subtitle">Manage plans and billing</div></div>
        <div style={{display:'flex',gap:8}}>
          {activeView==='plans'&&isSuperAdmin&&(
            <button onClick={()=>{setEditPlan(null);setPlanForm(BLANK);setPlanModal('create')}} className="btn btn-primary btn-sm"><Plus size={12}/> New plan</button>
          )}
          <div style={{display:'flex',border:'1px solid var(--line-2)',borderRadius:4,overflow:'hidden'}}>
            {(['subscribers','plans'] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)}
                style={{padding:'6px 16px',fontSize:12,fontWeight:500,border:'none',cursor:'pointer',background:activeView===v?'var(--brand)':'var(--card)',color:activeView===v?'#fff':'var(--ink-2)',textTransform:'capitalize'}}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeView==='subscribers' ? (
        <DataTable columns={subCols} data={data} total={total} page={page} pageSize={pageSize} emptyMessage="No subscriptions yet" rowKey={s=>s._id}
          toolbar={<TableToolbar><FilterSelect label="All statuses" paramName="status" options={[{value:'active',label:'Active'},{value:'cancelled',label:'Cancelled'},{value:'expired',label:'Expired'},{value:'trialing',label:'Trialing'}]}/><FilterSelect label="All providers" paramName="provider" options={[{value:'stripe',label:'Stripe'},{value:'ecocash',label:'EcoCash'}]}/></TableToolbar>}
        />
      ) : (
        <div>
          {plans.length===0&&(<div className="card" style={{padding:'48px',textAlign:'center'}}><div style={{fontSize:12.5,color:'var(--ink-4)',marginBottom:14}}>No plans yet.</div>{isSuperAdmin&&<button onClick={()=>{setEditPlan(null);setPlanForm(BLANK);setPlanModal('create')}} className="btn btn-primary btn-sm" style={{margin:'0 auto'}}><Plus size={12}/> Create first plan</button>}</div>)}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
            {plans.map(p=>(
              <div key={p._id} className="card" style={{padding:20,opacity:p.isActive?1:.55}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:'var(--ink)'}}>{p.name}</div>
                    <div style={{fontSize:11.5,color:'var(--ink-4)',marginTop:2,textTransform:'capitalize'}}>{p.type.replace(/_/g,' ')} · {p.interval}</div>
                  </div>
                  {isSuperAdmin&&(
                    <div style={{display:'flex',gap:3}}>
                      <button onClick={()=>handleToggle(p)} className="btn btn-ghost btn-icon-sm">{p.isActive?<ToggleRight size={16} color="var(--green)"/>:<ToggleLeft size={16} color="var(--ink-4)"/>}</button>
                      <button onClick={()=>openEditPlan(p)} className="btn btn-ghost btn-icon-sm"><Pencil size={13}/></button>
                      <button onClick={()=>setDeleteId(p._id)} className="btn btn-ghost btn-icon-sm" style={{color:'var(--red)'}}><Trash2 size={13}/></button>
                    </div>
                  )}
                </div>
                <div style={{fontSize:28,fontWeight:700,color:'var(--brand)',letterSpacing:'-.03em',marginBottom:4}}>
                  {p.priceUSD===0?'Free':`$${p.priceUSD}`}<span style={{fontSize:12,fontWeight:400,color:'var(--ink-4)'}}>/{p.interval==='monthly'?'mo':'yr'}</span>
                </div>
                {p.priceZWL>0&&<div style={{fontSize:12,color:'var(--ink-4)',marginBottom:10}}>ZWL {p.priceZWL.toLocaleString()}</div>}
                <div style={{borderTop:'1px solid var(--line)',paddingTop:10,marginBottom:10}}>
                  <div style={{fontSize:11,color:'var(--ink-4)',marginBottom:6}}>{p.maxDownloadsPerMonth===null?'Unlimited downloads':`${p.maxDownloadsPerMonth} downloads/month`} · {p.maxUsers} user{p.maxUsers!==1?'s':''}</div>
                  {p.features.slice(0,4).map(f=>(
                    <div key={f} style={{display:'flex',gap:6,fontSize:12,color:'var(--ink-2)',marginBottom:3}}>
                      <Check size={12} color="var(--gold)" style={{flexShrink:0,marginTop:1}}/>{f}
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <StatusBadge status={p.isActive?'active':'inactive'}/>
                  {p.stripePriceId
                    ?<span style={{fontSize:10.5,color:'var(--green)',background:'var(--green-light)',border:'1px solid var(--green-border)',padding:'2px 6px',borderRadius:3}}>Stripe linked</span>
                    :<span style={{fontSize:10.5,color:'var(--ink-4)',background:'var(--surface)',border:'1px solid var(--line-2)',padding:'2px 6px',borderRadius:3}}>No Stripe ID</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={!!planModal} onClose={()=>setPlanModal(null)} title={planModal==='edit'?`Edit: ${editPlan?.name}`:'Create plan'} subtitle="Configure plan pricing and features" size="md"
        footer={<><button onClick={()=>setPlanModal(null)} className="btn btn-secondary">Cancel</button><button onClick={savePlan} disabled={planSaving} className="btn btn-primary">{planSaving?<><Loader2 size={13} className="animate-spin"/>Saving…</>:planModal==='edit'?'Save changes':'Create plan'}</button></>}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <FormField label="Plan name" required><input className="input" placeholder="e.g. Pro Monthly" value={planForm.name} onChange={e=>setPlanForm(p=>({...p,name:e.target.value}))}/></FormField>
          <div className="form-grid-2">
            <FormField label="Type"><select className="select" style={{width:'100%'}} value={planForm.type} onChange={e=>setPlanForm(p=>({...p,type:e.target.value}))}>{['individual','team_10','team_20'].map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}</select></FormField>
            <FormField label="Interval"><select className="select" style={{width:'100%'}} value={planForm.interval} onChange={e=>setPlanForm(p=>({...p,interval:e.target.value}))}>{['monthly','annual'].map(i=><option key={i} value={i}>{i}</option>)}</select></FormField>
          </div>
          <div className="form-grid-2">
            <FormField label="Price (USD)"><input type="number" step="0.01" min="0" className="input" value={planForm.priceUSD} onChange={e=>setPlanForm(p=>({...p,priceUSD:Number(e.target.value)}))}/></FormField>
            <FormField label="Price (ZWL)"><input type="number" min="0" className="input" value={planForm.priceZWL} onChange={e=>setPlanForm(p=>({...p,priceZWL:Number(e.target.value)}))}/></FormField>
          </div>
          <div className="form-grid-2">
            <FormField label="Max users"><input type="number" min="1" className="input" value={planForm.maxUsers} onChange={e=>setPlanForm(p=>({...p,maxUsers:Number(e.target.value)}))}/></FormField>
            <FormField label="Downloads/month" hint="Blank = unlimited"><input type="number" min="1" className="input" placeholder="Unlimited" value={planForm.maxDownloadsPerMonth} onChange={e=>setPlanForm(p=>({...p,maxDownloadsPerMonth:e.target.value}))}/></FormField>
          </div>
          <FormField label="Stripe Price ID" hint="From Stripe dashboard — enables online checkout"><input className="input" placeholder="price_xxxxxxxxxxxxx" value={planForm.stripePriceId} onChange={e=>setPlanForm(p=>({...p,stripePriceId:e.target.value}))}/></FormField>
          <FormField label="Features" hint="One feature per line"><textarea className="textarea" rows={5} placeholder={"Unlimited downloads\nAll premium templates\nCommercial licence"} value={planForm.featuresRaw} onChange={e=>setPlanForm(p=>({...p,featuresRaw:e.target.value}))}/></FormField>
        </div>
      </Modal>

      <Modal open={!!editSub} onClose={()=>setEditSub(null)} title="Override subscription status" subtitle={editSub?.user?`${editSub.user.name} ${editSub.user.surname}`:''} size="sm"
        footer={<><button onClick={()=>setEditSub(null)} className="btn btn-secondary">Cancel</button><button onClick={saveSubStatus} disabled={subSaving} className="btn btn-primary">{subSaving?<><Loader2 size={13} className="animate-spin"/>Saving…</>:'Apply'}</button></>}>
        <FormField label="New status"><select className="select" value={subStatus} onChange={e=>setSubStatus(e.target.value)} style={{width:'100%'}}><option value="active">Active</option><option value="cancelled">Cancelled</option><option value="expired">Expired</option><option value="trialing">Trialing</option></select></FormField>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDeletePlan} loading={deleting} title="Delete plan?" confirmLabel="Delete" message="This plan will be permanently deleted. Fails if any active subscriptions use it."/>
    </div>
  )
}
