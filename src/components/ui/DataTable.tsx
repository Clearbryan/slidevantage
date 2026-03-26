'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Skeleton } from './index'

export interface Column<T> {
  key: string; header: string; width?: string|number
  align?: 'left'|'right'|'center'
  render: (row: T, i: number) => React.ReactNode
}

interface Props<T> {
  columns: Column<T>[]; data: T[]; total: number; page?: number; pageSize?: number
  loading?: boolean; emptyMessage?: string; toolbar?: React.ReactNode
  title?: string; actions?: React.ReactNode; rowKey?: (row: T) => string
}

export function DataTable<T extends Record<string,unknown>>({
  columns, data, total, page=1, pageSize=20, loading,
  emptyMessage='No records found', toolbar, title, actions, rowKey,
}: Props<T>) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const [,startT] = useTransition()
  const totalPages = Math.max(1, Math.ceil(total/pageSize))
  const from = total===0 ? 0 : (page-1)*pageSize+1
  const to   = Math.min(page*pageSize, total)

  function goTo(p: number) {
    const np = new URLSearchParams(params.toString())
    np.set('page', String(Math.max(1, Math.min(p, totalPages))))
    startT(() => router.push(`${pathname}?${np.toString()}`, { scroll:false }))
  }

  const pages: number[] = []
  if (totalPages <= 5) {
    for (let i=1; i<=totalPages; i++) pages.push(i)
  } else if (page <= 3) {
    pages.push(1,2,3,4,5)
  } else if (page >= totalPages-2) {
    for (let i=totalPages-4; i<=totalPages; i++) pages.push(i)
  } else {
    for (let i=page-2; i<=page+2; i++) pages.push(i)
  }

  return (
    <div className="card">
      {(title||toolbar||actions) && (
        <div className="table-toolbar">
          {title && <div className="card-title">{title}</div>}
          <div className="table-filters">{toolbar}</div>
          {actions && <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>{actions}</div>}
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ width:col.width, textAlign:col.align??'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({length:8}).map((_,i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col.key}>
                      <Skeleton style={{ height:14, width:'75%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length===0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding:'48px 16px', textAlign:'center', color:'#a1a1aa', fontSize:12.5 }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row,i) => (
                <tr key={rowKey ? rowKey(row) : String(row._id??i)}>
                  {columns.map(col => (
                    <td key={col.key} style={{ textAlign:col.align??'left' }}>
                      {col.render(row,i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {total>0 && (
        <div className="table-footer">
          <span style={{ fontSize:11.5, color:'#a1a1aa' }}>
            {from}–{to} of {total.toLocaleString()}
          </span>
          <div className="pagination">
            <button className="page-btn" onClick={() => goTo(1)} disabled={page===1}><ChevronsLeft size={11}/></button>
            <button className="page-btn" onClick={() => goTo(page-1)} disabled={page===1}><ChevronLeft size={11}/></button>
            {pages.map(p => (
              <button key={p} onClick={() => goTo(p)} className={`page-btn${p===page?' active':''}`}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => goTo(page+1)} disabled={page>=totalPages}><ChevronRight size={11}/></button>
            <button className="page-btn" onClick={() => goTo(totalPages)} disabled={page>=totalPages}><ChevronsRight size={11}/></button>
          </div>
        </div>
      )}
    </div>
  )
}
