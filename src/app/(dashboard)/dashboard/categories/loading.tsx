export default function Loading() {
  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div><div className="skeleton" style={{height:20,width:140,marginBottom:6}} /><div className="skeleton" style={{height:14,width:100}} /></div>
        <div className="skeleton" style={{height:32,width:120}} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:10}}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="card" style={{padding:16}}>
            <div style={{display:'flex',gap:10,marginBottom:12}}><div className="skeleton" style={{width:34,height:34,borderRadius:4,flexShrink:0}} /><div><div className="skeleton" style={{height:13,width:100,marginBottom:5}} /><div className="skeleton" style={{height:11,width:60}} /></div></div>
            <div className="skeleton" style={{height:12,width:'90%',marginBottom:5}} />
            <div className="skeleton" style={{height:12,width:'70%',marginBottom:14}} />
            <div style={{borderTop:'1px solid #f4f4f5',paddingTop:10,display:'flex',justifyContent:'space-between'}}><div className="skeleton" style={{height:12,width:80}} /><div className="skeleton" style={{height:20,width:50,borderRadius:3}} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}