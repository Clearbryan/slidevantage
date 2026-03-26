'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, UserX, Eye, Download, Plus, Pencil, Trash2, Loader2, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { SearchInput, FilterSelect, TableToolbar } from '@/components/ui/SearchBar'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge, PlanBadge, ConfirmDialog, FormField } from '@/components/ui/index'
import { updateUser, createUser, deleteUser, adminUpdateUser } from '@/actions'
import { fmt, fmtDate, timeAgo, exportToCsv } from '@/lib/utils'

interface Sub { plan?:{ name:string }; status:string; currentPeriodEnd?:string; paymentProvider?:string }
interface User { _id:string; name:string; surname:string; email:string; country?:string; phone?:string; isActive:boolean; emailVerified:boolean; totalDownloads:number; subscription?:Sub; createdAt:string; role:string }
interface Props { data:User[]; total:number; page:number; pageSize:number }

const BLANK_FORM = { name:'', surname:'', email:'', password:'', country:'', phone:'' }
const BLANK_EDIT = { name:'', surname:'', email:'', country:'', phone:'' }

export function UsersClient({ data, total, page, pageSize }: Props) {
  const router = useRouter()
  const [viewUser, setViewUser]   = useState<User|null>(null)
  const [editUser, setEditUser]   = useState<User|null>(null)
  const [createOpen, setCreate]   = useState(false)
  const [deleteId, setDeleteId]   = useState<string|null>(null)
  const [confirmToggle, setConfirmToggle] = useState<User|null>(null)
  const [saving, setSaving]       = useState(false)
  const [showPw, setShowPw]       = useState(false)
  const [form, setForm]           = useState(BLANK_FORM)
  const [editForm, setEditForm]   = useState(BLANK_EDIT)
  const [errors, setErrors]       = useState<Record<string,string>>({})

  function upd(k: string, v: string) { setForm(p=>({...p,[k]:v})); setErrors(e=>({...e,[k]:''})) }

  async function handleCreate() {
    const e: Record<string,string> = {}
    if (!form.name.trim())         e.name     = 'Required'
    if (!form.surname.trim())      e.surname  = 'Required'
    if (!form.email.trim())        e.email    = 'Required'
    if (form.password.length < 8)  e.password = 'Min 8 characters'
    if (Object.keys(e).length)     { setErrors(e); return }
    setSaving(true)
    try {
      await createUser(form)
      toast.success('User created'); setCreate(false); setForm(BLANK_FORM); router.refresh()
    } catch (err:any) { toast.error(err.message||'Failed') }
    finally { setSaving(false) }
  }

  async function handleEditSave() {
    if (!editUser) return
    if (!editForm.name.trim()||!editForm.surname.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      await adminUpdateUser(editUser._id, editForm)
      toast.success('User updated'); setEditUser(null); router.refresh()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  async function handleToggle(u: User) {
    setSaving(true)
    try {
      await updateUser(u._id, { isActive:!u.isActive })
      toast.success(u.isActive ? 'User suspended' : 'User activated')
      router.refresh()
      if (viewUser?._id===u._id) setViewUser(v=>v?{...v,isActive:!v.isActive}:v)
    } catch { toast.error('Failed') }
    finally { setSaving(false); setConfirmToggle(null) }
  }

  async function handleDelete() {
    if (!deleteId) return
    setSaving(true)
    try {
      await deleteUser(deleteId); toast.success('User deleted'); router.refresh()
    } catch { toast.error('Failed to delete') }
    finally { setSaving(false); setDeleteId(null) }
  }

  const columns: Column<User>[] = [
    {
      key:'user', header:'User',
      render: u => (
        <div className="user-cell">
          <div className="user-avatar">{u.name[0]}{u.surname[0]}</div>
          <div>
            <div className="user-name">{u.name} {u.surname}</div>
            <div className="user-email">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key:'plan', header:'Plan', width:140,
      render: u => u.subscription?.plan
        ? <PlanBadge name={u.subscription.plan.name}/>
        : <span className="badge badge-gray"><span className="badge-dot"/>Free</span>,
    },
    { key:'country', header:'Country', width:100, render:u => <span style={{color:'#52525b'}}>{u.country??'—'}</span> },
    { key:'downloads', header:'DL', width:60, align:'right', render:u => <span style={{fontWeight:500}}>{fmt(u.totalDownloads)}</span> },
    { key:'joined', header:'Joined', width:110, render:u => <span style={{color:'#a1a1aa'}}>{fmtDate(u.createdAt)}</span> },
    { key:'status', header:'Status', width:90, render:u => <StatusBadge status={u.isActive?'active':'suspended'}/> },
    {
      key:'actions', header:'', width:110,
      render: u => (
        <div className="row-actions" style={{justifyContent:'flex-end'}}>
          <button onClick={() => setViewUser(u)} className="btn btn-ghost btn-icon-sm" title="View"><Eye size={13}/></button>
          <button onClick={() => { setEditUser(u); setEditForm({ name:u.name, surname:u.surname, email:u.email, country:u.country??'', phone:u.phone??'' }) }} className="btn btn-ghost btn-icon-sm" title="Edit"><Pencil size={13}/></button>
          <button onClick={() => setConfirmToggle(u)} className="btn btn-ghost btn-icon-sm" title={u.isActive?'Suspend':'Activate'} style={{color:u.isActive?'#dc2626':'#16a34a'}}>
            {u.isActive ? <UserX size={13}/> : <UserCheck size={13}/>}
          </button>
          <button onClick={() => setDeleteId(u._id)} className="btn btn-ghost btn-icon-sm" title="Delete" style={{color:'#dc2626'}}><Trash2 size={13}/></button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Users</div><div className="page-subtitle">{fmt(total)} registered members</div></div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={() => { exportToCsv('users.csv', data.map(u=>({ Name:`${u.name} ${u.surname}`, Email:u.email, Country:u.country??'', Status:u.isActive?'Active':'Suspended', Plan:u.subscription?.plan?.name??'Free', Downloads:u.totalDownloads, Joined:fmtDate(u.createdAt) }))); toast.success('Exported') }} className="btn btn-secondary btn-sm">
            <Download size={12}/> Export
          </button>
          <button onClick={() => { setCreate(true); setErrors({}) }} className="btn btn-primary btn-sm">
            <Plus size={12}/> New user
          </button>
        </div>
      </div>

      <DataTable
        columns={columns} data={data} total={total} page={page} pageSize={pageSize}
        emptyMessage="No users found"
        rowKey={u=>u._id}
        toolbar={
          <TableToolbar>
            <SearchInput placeholder="Name or email…"/>
            <FilterSelect label="All statuses" paramName="status" options={[
              {value:'active',label:'Active'},{value:'suspended',label:'Suspended'},
            ]}/>
            <FilterSelect label="All roles" paramName="plan" options={[
              {value:'free',label:'Free'},{value:'subscriber',label:'Subscriber'},
            ]}/>
          </TableToolbar>
        }
      />

      {/* View modal */}
      {viewUser && (
        <Modal open={!!viewUser} onClose={() => setViewUser(null)}
          title={`${viewUser.name} ${viewUser.surname}`} subtitle={viewUser.email} size="md"
          footerSplit={{
            left: (
              <button onClick={() => { setConfirmToggle(viewUser); setViewUser(null) }}
                className={`btn btn-sm ${viewUser.isActive?'btn-danger':'btn-secondary'}`}>
                {viewUser.isActive?<><UserX size={12}/> Suspend</>:<><UserCheck size={12}/> Activate</>}
              </button>
            ),
            right: <><button onClick={() => { setEditUser(viewUser); setEditForm({name:viewUser.name,surname:viewUser.surname,email:viewUser.email,country:viewUser.country??'',phone:viewUser.phone??''}); setViewUser(null) }} className="btn btn-secondary btn-sm"><Pencil size={12}/> Edit</button><button onClick={() => setViewUser(null)} className="btn btn-primary btn-sm">Close</button></>,
          }}
        >
          <div style={{display:'flex',alignItems:'center',gap:12,paddingBottom:16,borderBottom:'1px solid #f4f4f5',marginBottom:16}}>
            <div style={{width:40,height:40,borderRadius:4,background:'var(--brand)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:600,color:'#fff',flexShrink:0}}>
              {viewUser.name[0]}{viewUser.surname[0]}
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:'var(--ink)'}}>{viewUser.name} {viewUser.surname}</div>
              <div style={{display:'flex',gap:5,marginTop:5}}>
                <StatusBadge status={viewUser.isActive?'active':'suspended'}/>
                {viewUser.subscription?.plan && <PlanBadge name={viewUser.subscription.plan.name}/>}
                {viewUser.emailVerified && <span className="badge badge-green"><span className="badge-dot"/>Verified</span>}
              </div>
            </div>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
            <tbody>
              {[
                ['Email',       viewUser.email],
                ['Country',     viewUser.country??'—'],
                ['Phone',       viewUser.phone??'—'],
                ['Role',        viewUser.role],
                ['Downloads',   fmt(viewUser.totalDownloads)],
                ['Plan',        viewUser.subscription?.plan?.name??'Free'],
                ['Plan status', viewUser.subscription?.status??'—'],
                ['Renews',      viewUser.subscription?.currentPeriodEnd ? fmtDate(viewUser.subscription.currentPeriodEnd) : '—'],
                ['Joined',      fmtDate(viewUser.createdAt)],
              ].map(([k,v]) => (
                <tr key={k}>
                  <td style={{padding:'8px 0',color:'var(--ink-4)',width:'38%',borderBottom:'1px solid var(--line)'}}>{k}</td>
                  <td style={{padding:'8px 0',color:'var(--ink)',fontWeight:500,borderBottom:'1px solid var(--line)'}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

      {/* Edit modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit user" subtitle={editUser?.email} size="sm"
        footer={<><button onClick={() => setEditUser(null)} className="btn btn-secondary">Cancel</button><button onClick={handleEditSave} disabled={saving} className="btn btn-primary">{saving?<><Loader2 size={13} className="animate-spin"/>Saving…</>:'Save changes'}</button></>}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="form-grid-2">
            <FormField label="First name" required><input className="input" value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))}/></FormField>
            <FormField label="Last name" required><input className="input" value={editForm.surname} onChange={e=>setEditForm(p=>({...p,surname:e.target.value}))}/></FormField>
          </div>
          <FormField label="Email"><input type="email" className="input" value={editForm.email} onChange={e=>setEditForm(p=>({...p,email:e.target.value}))}/></FormField>
          <div className="form-grid-2">
            <FormField label="Country"><input className="input" placeholder="e.g. Zimbabwe" value={editForm.country} onChange={e=>setEditForm(p=>({...p,country:e.target.value}))}/></FormField>
            <FormField label="Phone"><input className="input" placeholder="+263 77 123 4567" value={editForm.phone} onChange={e=>setEditForm(p=>({...p,phone:e.target.value}))}/></FormField>
          </div>
        </div>
      </Modal>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => { setCreate(false); setErrors({}) }} title="Create user" subtitle="Add a new user account" size="sm"
        footer={<><button onClick={() => setCreate(false)} className="btn btn-secondary">Cancel</button><button onClick={handleCreate} disabled={saving} className="btn btn-primary">{saving?<><Loader2 size={13} className="animate-spin"/>Creating…</>:'Create user'}</button></>}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="form-grid-2">
            <FormField label="First name" error={errors.name} required><input className={`input${errors.name?' input-error':''}`} placeholder="Jane" value={form.name} onChange={e=>upd('name',e.target.value)}/></FormField>
            <FormField label="Last name" error={errors.surname} required><input className={`input${errors.surname?' input-error':''}`} placeholder="Smith" value={form.surname} onChange={e=>upd('surname',e.target.value)}/></FormField>
          </div>
          <FormField label="Email" error={errors.email} required><input type="email" className={`input${errors.email?' input-error':''}`} placeholder="jane@example.com" value={form.email} onChange={e=>upd('email',e.target.value)}/></FormField>
          <FormField label="Password" error={errors.password} required hint="Min 8 characters">
            <div style={{position:'relative'}}>
              <input type={showPw?'text':'password'} className={`input${errors.password?' input-error':''}`} placeholder="••••••••" style={{paddingRight:36}} value={form.password} onChange={e=>upd('password',e.target.value)}/>
              <button type="button" onClick={() => setShowPw(v=>!v)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#a1a1aa',display:'flex',padding:2}}>
                {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
              </button>
            </div>
          </FormField>
          <div className="form-grid-2">
            <FormField label="Country"><input className="input" placeholder="Zimbabwe" value={form.country} onChange={e=>upd('country',e.target.value)}/></FormField>
            <FormField label="Phone"><input className="input" placeholder="+263 …" value={form.phone} onChange={e=>upd('phone',e.target.value)}/></FormField>
          </div>
        </div>
      </Modal>

      {/* Confirm toggle */}
      <ConfirmDialog
        open={!!confirmToggle} onClose={() => setConfirmToggle(null)}
        onConfirm={() => confirmToggle && handleToggle(confirmToggle)} loading={saving}
        variant={confirmToggle?.isActive?'danger':'primary'}
        title={confirmToggle?.isActive?'Suspend user?':'Activate user?'}
        message={confirmToggle?.isActive
          ? `${confirmToggle.name} will immediately lose access to their account.`
          : `${confirmToggle?.name} will regain full access to their account.`}
        confirmLabel={confirmToggle?.isActive?'Suspend':'Activate'}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={saving}
        title="Delete user account?" confirmLabel="Delete permanently"
        message="All user data including downloads and subscriptions will be permanently removed. This cannot be undone."
      />
    </div>
  )
}
