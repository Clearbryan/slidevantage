'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateAccount, changePassword } from '@/actions'

interface Props { name:string; email:string; role:string; phone:string; country:string }

export function AccountClient({ name, email, role, phone, country }: Props) {
  const router   = useRouter()
  const { update: updateSession } = useSession()
  const [tab, setTab] = useState<'profile'|'security'>('profile')
  const [profile, setProfile] = useState({
    name:    name.split(' ')[0]??'',
    surname: name.split(' ').slice(1).join(' ')??'',
    phone, country,
  })
  const [saving, setSaving] = useState(false)
  const [pwForm, setPw] = useState({ current:'', next:'', confirm:'' })
  const [pwSaving, setPwSaving] = useState(false)
  const [strength, setStrength] = useState(0)

  function calcStrength(p: string) {
    let s=0
    if (p.length>=8)          s++
    if (/[A-Z]/.test(p))      s++
    if (/[0-9]/.test(p))      s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const result = await updateAccount({ name:profile.name, surname:profile.surname, phone:profile.phone, country:profile.country })
      // Update the JWT token so sidebar/topbar reflect the new name immediately
      await updateSession({ name: result.name, email: result.email })
      toast.success('Profile updated'); router.refresh()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.next.length < 8)         { toast.error('Min 8 characters'); return }
    setPwSaving(true)
    try {
      await changePassword(pwForm.current, pwForm.next)
      toast.success('Password changed'); setPw({ current:'', next:'', confirm:'' }); setStrength(0)
    } catch (err:any) { toast.error(err.message||'Failed') }
    finally { setPwSaving(false) }
  }

  const sLabel = ['','Weak','Fair','Good','Strong']
  const sColor = ['','#dc2626','#f59e0b','#3b82f6','#16a34a']

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Account</div><div className="page-subtitle">Profile and security settings</div></div>
      </div>
      <div style={{ display:'flex', gap:24 }}>
        <div style={{ width:150, flexShrink:0 }}>
          {(['profile','security'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 12px', border:'none', cursor:'pointer', fontSize:12.5, fontWeight:tab===t?500:400, background:tab===t?'var(--brand-light)':'transparent', color:tab===t?'var(--brand)':'var(--ink-3)', borderRadius:4, marginBottom:2, textTransform:'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          {tab==='profile' && (
            <div className="card" style={{ padding:20 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)', marginBottom:16 }}>Profile information</div>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, paddingBottom:18, borderBottom:'1px solid #f4f4f5' }}>
                <div style={{ width:44, height:44, borderRadius:4, background:'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:600, color:'#fff', flexShrink:0 }}>
                  {profile.name[0]}{profile.surname[0]}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)' }}>{profile.name} {profile.surname}</div>
                  <div style={{ fontSize:12, color:'#a1a1aa', marginTop:1, textTransform:'capitalize' }}>{role.replace('_',' ')}</div>
                </div>
              </div>
              <form onSubmit={saveProfile} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div className="form-grid-2">
                  <div><label className="label">First name</label><input className="input" value={profile.name} onChange={e => setProfile(p=>({...p,name:e.target.value}))}/></div>
                  <div><label className="label">Last name</label><input className="input" value={profile.surname} onChange={e => setProfile(p=>({...p,surname:e.target.value}))}/></div>
                </div>
                <div><label className="label">Email address</label><input className="input" value={email} disabled style={{ opacity:.5, cursor:'not-allowed' }}/><div style={{ fontSize:11.5, color:'#a1a1aa', marginTop:4 }}>Contact support to change your email.</div></div>
                <div className="form-grid-2">
                  <div><label className="label">Phone</label><input className="input" placeholder="+1 555 0100" value={profile.phone} onChange={e => setProfile(p=>({...p,phone:e.target.value}))}/></div>
                  <div><label className="label">Country</label><input className="input" placeholder="e.g. Zimbabwe" value={profile.country} onChange={e => setProfile(p=>({...p,country:e.target.value}))}/></div>
                </div>
                <div><button type="submit" disabled={saving} className="btn btn-primary">{saving?<><Loader2 size={13} className="animate-spin"/>Saving…</>:<><Check size={13}/> Save changes</>}</button></div>
              </form>
            </div>
          )}

          {tab==='security' && (
            <div className="card" style={{ padding:20 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)', marginBottom:16 }}>Change password</div>
              <form onSubmit={savePassword} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div><label className="label">Current password</label><input type="password" className="input" value={pwForm.current} onChange={e => setPw(p=>({...p,current:e.target.value}))} placeholder="••••••••"/></div>
                <div>
                  <label className="label">New password</label>
                  <input type="password" className="input" value={pwForm.next} onChange={e => { setPw(p=>({...p,next:e.target.value})); setStrength(calcStrength(e.target.value)) }} placeholder="Min. 8 characters"/>
                  {pwForm.next && (
                    <div style={{ display:'flex', gap:3, marginTop:7, alignItems:'center' }}>
                      {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background:i<=strength?sColor[strength]:'#f4f4f5', transition:'background .2s' }}/>)}
                      <span style={{ fontSize:11, color:sColor[strength], marginLeft:6, flexShrink:0, minWidth:32 }}>{sLabel[strength]}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Confirm password</label>
                  <input type="password" className="input" value={pwForm.confirm} onChange={e => setPw(p=>({...p,confirm:e.target.value}))} placeholder="Repeat new password"
                    style={{ borderColor: pwForm.confirm && pwForm.confirm!==pwForm.next ? '#fca5a5' : '' }}/>
                  {pwForm.confirm && pwForm.confirm!==pwForm.next && <div className="field-error" style={{ marginTop:4 }}>Passwords do not match</div>}
                </div>
                <div><button type="submit" disabled={pwSaving||!pwForm.current||!pwForm.next||pwForm.next!==pwForm.confirm} className="btn btn-primary">{pwSaving?<><Loader2 size={13} className="animate-spin"/>Updating…</>:'Update password'}</button></div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
