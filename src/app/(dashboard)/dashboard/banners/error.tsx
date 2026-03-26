'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="page">
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'72px 20px',textAlign:'center'}}>
        <div style={{width:40,height:40,borderRadius:4,background:'#fef2f2',border:'1px solid #fecaca',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
          <AlertTriangle size={18} color="#dc2626" />
        </div>
        <div style={{fontSize:14,fontWeight:600,color:'var(--ink)',marginBottom:6}}>Something went wrong</div>
        <div style={{fontSize:12.5,color:'#a1a1aa',marginBottom:20,maxWidth:320}}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </div>
        <button onClick={reset} className="btn btn-primary btn-sm" style={{display:'flex',alignItems:'center',gap:6}}>
          <RefreshCw size={12} /> Try again
        </button>
      </div>
    </div>
  )
}
