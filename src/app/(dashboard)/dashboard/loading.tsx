export default function Loading() {
  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div><div className="skeleton" style={{height:20,width:120,marginBottom:6}} /><div className="skeleton" style={{height:14,width:180}} /></div>
        <div style={{display:'flex',gap:8}}><div className="skeleton" style={{height:32,width:100}} /><div className="skeleton" style={{height:32,width:120}} /></div>
      </div>
      <div className="stat-grid" style={{marginBottom:16}}>
        {[1,2,3,4].map(i => <div key={i} className="stat-card"><div className="skeleton" style={{height:12,width:80,marginBottom:10}} /><div className="skeleton" style={{height:28,width:100,marginBottom:8}} /><div className="skeleton" style={{height:12,width:120}} /></div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:12,marginBottom:12}}>
        <div className="card" style={{padding:16}}><div className="skeleton" style={{height:150,borderRadius:2}} /></div>
        <div className="card" style={{padding:16}}><div className="skeleton" style={{height:150,borderRadius:2}} /></div>
      </div>
      <div className="card">
        <div style={{padding:'12px 16px',borderBottom:'1px solid #f4f4f5'}}><div className="skeleton" style={{height:14,width:80}} /></div>
        {[1,2,3,4].map(i => <div key={i} style={{display:'flex',gap:12,padding:'12px 16px',borderBottom:'1px solid #fafafa'}}><div className="skeleton" style={{height:14,width:200}} /><div className="skeleton" style={{height:14,width:80}} /><div className="skeleton" style={{height:14,width:60}} /></div>)}
      </div>
    </div>
  )
}