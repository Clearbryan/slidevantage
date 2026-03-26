'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, FileStack, CreditCard, ArrowDownToLine, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { fmt, fmtDate, timeAgo } from '@/lib/utils'

interface Props {
  stats: { totalUsers:number; totalTemplates:number; activeSubs:number; totalDl:number; userGrowth:number; dlGrowth:number }
  trend: { label:string; value:number }[]
  topTemplates: { _id:string; title:string; downloadCount:number; tier:string }[]
  recentUsers: { _id:string; name:string; surname:string; email:string; country?:string; createdAt:string }[]
}

function ChartTip({ active, payload, label }: any) {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e4e4e7', borderRadius:4, padding:'8px 12px', fontSize:12 }}>
      <div style={{ color:'#a1a1aa', marginBottom:2 }}>{label}</div>
      <div style={{ fontWeight:600, color:'var(--ink)' }}>{fmt(payload[0].value)}</div>
    </div>
  )
}

export function DashboardCharts({ stats, trend, topTemplates, recentUsers }: Props) {
  const max = Math.max(...topTemplates.map(t=>t.downloadCount), 1)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/dashboard/reports" className="btn btn-secondary btn-sm">View reports</Link>
          <Link href="/dashboard/templates" className="btn btn-primary btn-sm">
            <span style={{ fontSize:15, lineHeight:1 }}>+</span> New template
          </Link>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom:16 }}>
        {[
          { label:'Total users',        value:fmt(stats.totalUsers),     delta:stats.userGrowth, icon:<Users size={13} color="#a1a1aa"/> },
          { label:'Published templates',value:fmt(stats.totalTemplates), delta:null,             icon:<FileStack size={13} color="#a1a1aa"/> },
          { label:'Active subscribers', value:fmt(stats.activeSubs),     delta:null,             icon:<CreditCard size={13} color="#a1a1aa"/> },
          { label:'Total downloads',    value:fmt(stats.totalDl),        delta:stats.dlGrowth,   icon:<ArrowDownToLine size={13} color="#a1a1aa"/> },
        ].map(({ label, value, delta, icon }) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{icon}{label}</div>
            <div className="stat-value">{value}</div>
            {delta!==null && (
              <div className="stat-delta">
                <span className={delta>=0?'delta-up':'delta-dn'}>{delta>=0?'↑':'↓'} {Math.abs(delta)}%</span>
                <span className="delta-neutral">vs last month</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:12, marginBottom:12 }}>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Downloads</div><div className="card-subtitle">Monthly activity — last 6 months</div></div>
            {stats.dlGrowth>0 && (
              <span style={{ fontSize:11, color:'#16a34a', background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'2px 8px', borderRadius:3, fontWeight:500, display:'flex', alignItems:'center', gap:3 }}>
                <TrendingUp size={11}/> +{stats.dlGrowth}%
              </span>
            )}
          </div>
          <div style={{ padding:'14px 8px 12px' }}>
            {trend.length===0 ? (
              <div style={{ height:120, display:'flex', alignItems:'center', justifyContent:'center', color:'#a1a1aa', fontSize:12.5 }}>No download data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={trend} margin={{ top:4, right:8, left:-28, bottom:0 }}>
                  <defs>
                    <linearGradient id="dl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#09090b" stopOpacity={0.08}/>
                      <stop offset="100%" stopColor="#09090b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f4f4f5"/>
                  <XAxis dataKey="label" tick={{ fontSize:11, fill:'#a1a1aa' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:'#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Area type="monotone" dataKey="value" stroke="#09090b" strokeWidth={1.5} fill="url(#dl)" dot={false} activeDot={{ r:3, fill:'#09090b', strokeWidth:0 }}/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div><div className="card-title">Top templates</div><div className="card-subtitle">By downloads</div></div></div>
          {topTemplates.length===0 ? (
            <div style={{ padding:'32px 16px', textAlign:'center', color:'#a1a1aa', fontSize:12.5 }}>No templates yet</div>
          ) : (
            <div style={{ padding:'4px 0' }}>
              {topTemplates.map((t,i) => (
                <div key={t._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', borderBottom:i<topTemplates.length-1?'1px solid #fafafa':'none' }}>
                  <div style={{ fontSize:11, color:'#d4d4d8', width:14, textAlign:'right', flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12.5, fontWeight:500, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
                    <div style={{ height:2, background:'#f4f4f5', marginTop:5 }}>
                      <div style={{ height:2, background:'var(--brand)', width:`${(t.downloadCount/max)*100}%` }}/>
                    </div>
                  </div>
                  <div style={{ fontSize:12, fontWeight:500, color:'#52525b', flexShrink:0 }}>{fmt(t.downloadCount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Recent signups</div></div>
          <Link href="/dashboard/users" className="btn btn-secondary btn-sm">View all</Link>
        </div>
        {recentUsers.length===0 ? (
          <div style={{ padding:'32px 16px', textAlign:'center', color:'#a1a1aa', fontSize:12.5 }}>No users yet</div>
        ) : (
          <table>
            <thead><tr><th>User</th><th>Country</th><th>Joined</th></tr></thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{u.name[0]}{u.surname[0]}</div>
                      <div>
                        <div className="user-name">{u.name} {u.surname}</div>
                        <div className="user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color:'#52525b' }}>{u.country??'—'}</td>
                  <td style={{ color:'#a1a1aa' }}>{timeAgo(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
