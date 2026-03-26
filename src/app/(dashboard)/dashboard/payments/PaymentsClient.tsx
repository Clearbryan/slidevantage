'use client'

import { useRouter } from 'next/navigation'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { FilterSelect, TableToolbar } from '@/components/ui/SearchBar'
import { StatusBadge } from '@/components/ui/index'
import { fmtCurrency, fmtDatetime, exportToCsv } from '@/lib/utils'

interface Payment { _id:string; user?:{name:string;surname:string;email:string}; amount:number; currency:string; provider:string; status:string; description?:string; createdAt:string }
interface Props { data:Payment[]; total:number; page:number; pageSize:number }

export function PaymentsClient({ data, total, page, pageSize }: Props) {
  const router = useRouter()

  const columns: Column<Payment>[] = [
    {
      key:'user', header:'User',
      render: p => p.user ? (
        <div className="user-cell">
          <div className="user-avatar">{p.user.name[0]}{p.user.surname[0]}</div>
          <div>
            <div className="user-name">{p.user.name} {p.user.surname}</div>
            <div className="user-email">{p.user.email}</div>
          </div>
        </div>
      ) : <span style={{ color:'#a1a1aa' }}>—</span>,
    },
    {
      key:'amount', header:'Amount', width:110, align:'right',
      render: p => <span style={{ fontWeight:600, color:'var(--ink)', fontSize:13 }}>{fmtCurrency(p.amount, p.currency)}</span>,
    },
    {
      key:'provider', header:'Provider', width:100,
      render: p => <span style={{ fontSize:11.5, fontWeight:500, color:'#52525b', background:'#fafafa', border:'1px solid #e4e4e7', padding:'2px 8px', borderRadius:3, textTransform:'capitalize' }}>{p.provider}</span>,
    },
    { key:'status', header:'Status', width:100, render:p => <StatusBadge status={p.status}/> },
    { key:'desc', header:'Description', render:p => <span style={{ color:'#71717a', fontSize:12 }}>{p.description??'—'}</span> },
    { key:'date', header:'Date', width:160, render:p => <span style={{ color:'#a1a1aa' }}>{fmtDatetime(p.createdAt)}</span> },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-subtitle">Transaction history · {total} records</div>
        </div>
        <button onClick={() => { exportToCsv('payments.csv', data.map(p => ({ User:p.user?`${p.user.name} ${p.user.surname}`:'', Email:p.user?.email??'', Amount:fmtCurrency(p.amount,p.currency), Provider:p.provider, Status:p.status, Date:fmtDatetime(p.createdAt) }))); toast.success('Exported') }} className="btn btn-secondary btn-sm">
          <Download size={12}/> Export CSV
        </button>
      </div>
      <DataTable
        columns={columns} data={data} total={total} page={page} pageSize={pageSize}
        emptyMessage="No payments recorded yet"
        rowKey={p => p._id}
        toolbar={
          <TableToolbar>
            <FilterSelect label="All statuses" paramName="status" options={[
              {value:'succeeded',label:'Succeeded'},{value:'pending',label:'Pending'},
              {value:'failed',label:'Failed'},{value:'refunded',label:'Refunded'},
            ]}/>
            <FilterSelect label="All providers" paramName="provider" options={[
              {value:'stripe',label:'Stripe'},{value:'ecocash',label:'EcoCash'},
            ]}/>
          </TableToolbar>
        }
      />
    </div>
  )
}
