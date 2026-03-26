'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, Shield, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog, FormField } from '@/components/ui/index'
import { createAdminUser, deleteAdminUser } from '@/actions'
import { fmtDate, timeAgo } from '@/lib/utils'

interface AdminUser { _id:string; name:string; email:string; role:string; lastLogin?:string; createdAt:string }
interface Props { data:AdminUser[]; currentId:string }

export function UserAdminClient({ data, currentId }: Props) {
  const router  = useRouter()
  const [showModal, setShow] = useState(false)
  const [deleteId, setDel]   = useState<string|null>(null)
  const [saving, setSaving]  = useState(false)
  const [deleting, setDel2]  = useState(false)
  const [showPw, setShowPw]  = useState(false)
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'admin' })
  const [errors, setErrors]  = useState<Record<string,string>>({})

  function update(k: string, v: string) { setForm(p=>({...p,[k]:v})); setErrors(e=>({...e,[k]:''})) }

  async function handleCreate() {
    const e: Record<string,string> = {}
    if (!form.name.trim())             e.name     = 'Required'
    if (!form.email.trim())            e.email    = 'Required'
    if (form.password.length < 8)      e.password = 'Min 8 characters'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await createAdminUser(form)
      toast.success('Admin user created')
      setShow(false); setForm({ name:'', email:'', password:'', role:'admin' }); router.refresh()
    } catch (err:any) { toast.error(err.message||'Failed to create') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    if (deleteId === currentId) { toast.error("You can't delete your own account"); setDel(null); return }
    setDel2(true)
    try { await deleteAdminUser(deleteId); toast.success('Admin removed'); router.refresh() }
    catch { toast.error('Failed to delete') }
    finally { setDel2(false); setDel(null) }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Admin users</div><div className="page-subtitle">{data.length} administrator{data.length!==1?'s':''}</div></div>
        <button onClick={() => setShow(true)} className="btn btn-primary btn-sm"><Plus size={12}/> Add admin</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Admin</th>
              <th>Role</th>
              <th>Last login</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.length===0 && (
              <tr><td colSpan={5} style={{ padding:'48px 16px', textAlign:'center', color:'#a1a1aa', fontSize:12.5 }}>No admin users yet.</td></tr>
            )}
            {data.map(a => (
              <tr key={a._id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar" style={{ background:a.role==='super_admin'?'var(--brand)':'var(--brand-light)', color:a.role==='super_admin'?'var(--gold)':'var(--brand)' }}>
                      {a.name[0]}{a.name.split(' ')[1]?.[0]??''}
                    </div>
                    <div>
                      <div className="user-name">{a.name} {a._id===currentId && <span style={{ fontSize:10, color:'#a1a1aa', fontWeight:400 }}>(you)</span>}</div>
                      <div className="user-email">{a.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5, fontWeight:500, color:a.role==='super_admin'?'#09090b':'#52525b', background:a.role==='super_admin'?'#f4f4f5':'#fafafa', border:'1px solid #e4e4e7', padding:'2px 8px', borderRadius:3 }}>
                    {a.role==='super_admin' && <Shield size={11}/>}
                    {a.role.replace('_',' ')}
                  </span>
                </td>
                <td style={{ color:'#a1a1aa' }}>{a.lastLogin ? timeAgo(a.lastLogin) : 'Never'}</td>
                <td style={{ color:'#a1a1aa' }}>{fmtDate(a.createdAt)}</td>
                <td>
                  <div className="row-actions" style={{ justifyContent:'flex-end' }}>
                    {a._id !== currentId && (
                      <button onClick={() => setDel(a._id)} className="btn btn-ghost btn-icon-sm" style={{ color:'#dc2626' }} title="Remove"><Trash2 size={13}/></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => { setShow(false); setErrors({}) }} title="Add admin user" subtitle="Create a new administrator account" size="sm"
        footer={<><button onClick={() => setShow(false)} className="btn btn-secondary">Cancel</button><button onClick={handleCreate} disabled={saving} className="btn btn-primary">{saving?<><Loader2 size={13} className="animate-spin"/>Creating…</>:'Create admin'}</button></>}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <FormField label="Full name" error={errors.name} required><input className={`input${errors.name?' input-error':''}`} placeholder="Jane Smith" value={form.name} onChange={e=>update('name',e.target.value)}/></FormField>
          <FormField label="Email address" error={errors.email} required><input type="email" className={`input${errors.email?' input-error':''}`} placeholder="jane@company.com" value={form.email} onChange={e=>update('email',e.target.value)}/></FormField>
          <FormField label="Password" error={errors.password} required hint="At least 8 characters">
            <div style={{ position:'relative' }}>
              <input type={showPw?'text':'password'} className={`input${errors.password?' input-error':''}`} placeholder="Temporary password" style={{ paddingRight:38 }} value={form.password} onChange={e=>update('password',e.target.value)}/>
              <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#a1a1aa', display:'flex', padding:2 }}>
                {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
              </button>
            </div>
          </FormField>
          <FormField label="Role">
            <select className="select" value={form.role} onChange={e=>update('role',e.target.value)} style={{ width:'100%' }}>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDel(null)} onConfirm={handleDelete} loading={deleting}
        title="Remove admin user?" confirmLabel="Remove"
        message="This administrator will immediately lose all access. This cannot be undone."/>
    </div>
  )
}
