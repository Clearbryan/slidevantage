export default function Loading() {
  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div><div className="skeleton" style={{height:20,width:120,marginBottom:6}} /><div className="skeleton" style={{height:14,width:160}} /></div>
        <div className="skeleton" style={{height:32,width:120}} />
      </div>
      <div className="card">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'1px solid #f4f4f5'}}>
          <div className="skeleton" style={{height:14,width:100}} />
          <div style={{display:'flex',gap:8}}><div className="skeleton" style={{height:32,width:180}} /><div className="skeleton" style={{height:32,width:100}} /></div>
        </div>
        <div style={{background:'#fafafa',padding:'8px 16px',borderBottom:'1px solid #f4f4f5',display:'flex',gap:16}}>
          {['30%','15%','10%','10%','12%','10%'].map((w,i)=><div key={i} className="skeleton" style={{height:12,width:w}} />)}
        </div>
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} style={{display:'flex',gap:16,padding:'12px 16px',borderBottom:'1px solid #fafafa',alignItems:'center'}}>
            <div style={{display:'flex',gap:9,flex:'0 0 30%'}}><div className="skeleton" style={{width:26,height:26,borderRadius:3,flexShrink:0}} /><div><div className="skeleton" style={{height:12,width:120,marginBottom:5}} /><div className="skeleton" style={{height:11,width:160}} /></div></div>
            <div className="skeleton" style={{height:20,width:'13%',borderRadius:3}} />
            <div className="skeleton" style={{height:12,width:'9%'}} />
            <div className="skeleton" style={{height:12,width:'9%'}} />
            <div className="skeleton" style={{height:12,width:'10%'}} />
            <div className="skeleton" style={{height:20,width:'9%',borderRadius:3}} />
          </div>
        ))}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',background:'#fafafa',borderTop:'1px solid #f4f4f5'}}>
          <div className="skeleton" style={{height:12,width:140}} />
          <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(i=><div key={i} className="skeleton" style={{width:28,height:28,borderRadius:3}} />)}</div>
        </div>
      </div>
    </div>
  )
}