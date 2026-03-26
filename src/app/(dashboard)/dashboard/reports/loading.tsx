export default function Loading() {
  return (
    <div className="page">
      <div style={{marginBottom:20}}><div className="skeleton" style={{height:20,width:140,marginBottom:6}} /><div className="skeleton" style={{height:14,width:200}} /></div>
      <div className="card" style={{padding:20}}>
        <div className="skeleton" style={{height:14,width:120,marginBottom:16}} />
        {[1,2,3].map(i => <div key={i} style={{marginBottom:14}}><div className="skeleton" style={{height:12,width:80,marginBottom:6}} /><div className="skeleton" style={{height:33,borderRadius:4}} /></div>)}
        <div className="skeleton" style={{height:32,width:120,borderRadius:4,marginTop:8}} />
      </div>
    </div>
  )
}