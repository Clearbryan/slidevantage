'use client'

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download } from 'lucide-react'
import { exportToCsv, fmt, fmtCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  revenue: {label:string;value:number}[]
  downloadTrend: {label:string;value:number}[]
  userGrowth: {label:string;value:number}[]
  topTemplates: {_id:string;title:string;downloadCount:number;tier:string}[]
  totals: { revenue:number; downloads:number; users:number }
}

function ChartTooltip({ active, payload, label, prefix='' }: any) {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e4e4e7', borderRadius:4, padding:'8px 12px', fontSize:12 }}>
      <div style={{ color:'#a1a1aa', marginBottom:2 }}>{label}</div>
      <div style={{ fontWeight:600, color:'var(--ink)' }}>{prefix}{fmt(payload[0].value)}</div>
    </div>
  )
}

export function ReportsClient({ revenue, downloadTrend, userGrowth, topTemplates, totals }: Props) {
  const maxDl = Math.max(...topTemplates.map(t=>t.downloadCount), 1)

  const stats = [
    { label:'Total revenue', value:fmtCurrency(totals.revenue) },
    { label:'Total downloads', value:fmt(totals.downloads) },
    { label:'Total users', value:fmt(totals.users) },
    { label:'Avg rev/mo', value:fmtCurrency(revenue.length ? totals.revenue/revenue.length : 0) },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Reports</div><div className="page-subtitle">Platform analytics</div></div>
      </div>

      <div className="stat-grid" style={{ marginBottom:16 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize:20 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Revenue</div><div className="card-subtitle">Monthly subscription revenue (USD)</div></div>
            <button onClick={() => { exportToCsv('revenue.csv', revenue.map(r=>({Month:r.label,Revenue:r.value}))); toast.success('Exported') }} className="btn btn-secondary btn-sm"><Download size={11}/> Export</button>
          </div>
          <div style={{ padding:'14px 8px 12px' }}>
            {revenue.length===0 ? (
              <div style={{ height:140, display:'flex', alignItems:'center', justifyContent:'center', color:'#a1a1aa', fontSize:12.5 }}>No payment data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={revenue} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                  <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#09090b" stopOpacity={0.08}/><stop offset="100%" stopColor="#09090b" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid vertical={false} stroke="#f4f4f5"/>
                  <XAxis dataKey="label" tick={{ fontSize:11, fill:'#a1a1aa' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:'#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
                  <Tooltip content={<ChartTooltip prefix="$"/>}/>
                  <Area type="monotone" dataKey="value" stroke="#09090b" strokeWidth={1.5} fill="url(#revGrad)" dot={false} activeDot={{ r:3, fill:'#09090b', strokeWidth:0 }}/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div><div className="card-title">User growth</div><div className="card-subtitle">New registrations per month</div></div>
            <button onClick={() => { exportToCsv('user-growth.csv', userGrowth.map(u=>({Month:u.label,NewUsers:u.value}))); toast.success('Exported') }} className="btn btn-secondary btn-sm"><Download size={11}/> Export</button>
          </div>
          <div style={{ padding:'14px 8px 12px' }}>
            {userGrowth.length===0 ? (
              <div style={{ height:140, display:'flex', alignItems:'center', justifyContent:'center', color:'#a1a1aa', fontSize:12.5 }}>No user data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={userGrowth} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                  <defs><linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#09090b" stopOpacity={0.06}/><stop offset="100%" stopColor="#09090b" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid vertical={false} stroke="#f4f4f5"/>
                  <XAxis dataKey="label" tick={{ fontSize:11, fill:'#a1a1aa' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:'#a1a1aa' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<ChartTooltip/>}/>
                  <Area type="monotone" dataKey="value" stroke="#09090b" strokeWidth={1.5} fill="url(#ugGrad)" dot={false} activeDot={{ r:3, fill:'#09090b', strokeWidth:0 }}/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Downloads by template</div><div className="card-subtitle">All-time top performers</div></div>
          <button onClick={() => { exportToCsv('downloads.csv', topTemplates.map(t=>({Template:t.title,Downloads:t.downloadCount,Tier:t.tier}))); toast.success('Exported') }} className="btn btn-secondary btn-sm"><Download size={11}/> Export</button>
        </div>
        {topTemplates.length===0 ? (
          <div style={{ padding:'48px 16px', textAlign:'center', color:'#a1a1aa', fontSize:12.5 }}>No template download data yet</div>
        ) : (
          <div style={{ padding:'14px 8px 12px' }}>
            <ResponsiveContainer width="100%" height={Math.max(160, topTemplates.length*28)}>
              <BarChart data={topTemplates} layout="vertical" margin={{ top:0, right:16, left:8, bottom:0 }}>
                <CartesianGrid horizontal={false} stroke="#f4f4f5"/>
                <XAxis type="number" tick={{ fontSize:11, fill:'#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)}/>
                <YAxis type="category" dataKey="title" tick={{ fontSize:11.5, fill:'#52525b' }} axisLine={false} tickLine={false} width={140}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Bar dataKey="downloadCount" radius={[0,2,2,0]} maxBarSize={16}>
                  {topTemplates.map((_,i) => <Cell key={i} fill={i===0?'#09090b':'#e4e4e7'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
