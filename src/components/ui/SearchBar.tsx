'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition, useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

function useUrlParam(key: string) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const value    = params.get(key) ?? ''
  const [,startT] = useTransition()

  const set = useCallback((v: string|null) => {
    const p = new URLSearchParams(params.toString())
    if (v) { p.set(key,v); p.delete('page') } else { p.delete(key) }
    startT(() => router.push(`${pathname}?${p.toString()}`, { scroll:false }))
  }, [key, params, pathname, router])

  return [value, set] as const
}

export function SearchInput({ placeholder='Search…', paramName='q' }: { placeholder?: string; paramName?: string }) {
  const [serverVal, set] = useUrlParam(paramName)
  const [local, setLocal] = useState(serverVal)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  // Sync when server value changes (e.g. clearing filters)
  useEffect(() => { setLocal(serverVal) }, [serverVal])

  function handleChange(v: string) {
    setLocal(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => set(v || null), 350)
  }

  function handleClear() {
    clearTimeout(timer.current)
    setLocal('')
    set(null)
  }

  return (
    <div className="search-wrap" style={{ width:220 }}>
      <Search size={13} color="#a1a1aa" style={{ flexShrink:0 }} />
      <input value={local} onChange={e => handleChange(e.target.value)} placeholder={placeholder} />
      {local && (
        <button onClick={handleClear} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:0, color:'#a1a1aa' }}>
          <X size={12}/>
        </button>
      )}
    </div>
  )
}

export function FilterSelect({ label, paramName, options }: {
  label: string; paramName: string; options: {value:string; label:string}[]
}) {
  const [value, set] = useUrlParam(paramName)
  return (
    <select value={value} onChange={e => set(e.target.value||null)} className="select" style={{ height:32, fontSize:12 }}>
      <option value="">{label}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function TableToolbar({ children }: { children: React.ReactNode }) {
  return <div style={{ display:'flex', alignItems:'center', gap:8 }}>{children}</div>
}
