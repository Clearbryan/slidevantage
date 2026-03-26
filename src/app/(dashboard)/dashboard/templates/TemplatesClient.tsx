'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Pencil, Trash2, Plus, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { SearchInput, FilterSelect, TableToolbar } from '@/components/ui/SearchBar'
import { ConfirmDialog, StatusBadge } from '@/components/ui/index'
import { TemplateModal } from './TemplateModal'
import { deleteTemplate, toggleFeatured } from '@/actions/template.actions'
import { fmt, fmtDate, exportToCsv } from '@/lib/utils'

interface Template {
  _id:string; title:string; category?:{name:string; _id:string}
  format:string[]; tier:string; status:string
  downloadCount:number; isFeatured:boolean; thumbnailUrl:string; createdAt:string; tags:string[]
  description:string; slideCount?:number; fileUrls?:Record<string,string>
}
interface Props { data:Template[]; total:number; page:number; pageSize:number; categories:{_id:string;name:string}[] }

export function TemplatesClient({ data, total, page, pageSize, categories }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editTemplate, setEdit] = useState<Template|null>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)
  const [,startT] = useTransition()

  function openCreate() { setEdit(null); setShowModal(true) }
  function openEdit(t: Template) { setEdit(t); setShowModal(true) }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteTemplate(deleteId)
      toast.success('Template deleted')
      router.refresh()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false); setDeleteId(null) }
  }

  async function handleToggleFeatured(t: Template) {
    startT(async () => {
      try {
        await toggleFeatured(t._id, !t.isFeatured)
        toast.success(t.isFeatured ? 'Removed from featured' : 'Marked as featured')
        router.refresh()
      } catch { toast.error('Failed') }
    })
  }

  const columns: Column<Template>[] = [
    {
      key:'title', header:'Template',
      render: t => (
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {t.thumbnailUrl
            ? <img src={t.thumbnailUrl} alt="" style={{ width:44, height:28, objectFit:'cover', borderRadius:2, border:'1px solid #f0f0f0', flexShrink:0 }}/>
            : <div style={{ width:44, height:28, background:'#f4f4f5', borderRadius:2, flexShrink:0 }}/>
          }
          <div>
            <div style={{ fontWeight:500, color:'var(--ink)', fontSize:12, display:'flex', alignItems:'center', gap:5 }}>
              {t.title}
              {t.isFeatured && <Star size={11} color="#eab308" fill="#eab308"/>}
            </div>
            <div style={{ fontSize:11, color:'#a1a1aa' }}>{t.category?.name??'—'}</div>
          </div>
        </div>
      ),
    },
    { key:'tier', header:'Tier', width:80, render:t => <StatusBadge status={t.tier}/> },
    { key:'status', header:'Status', width:90, render:t => <StatusBadge status={t.status}/> },
    {
      key:'format', header:'Formats', width:130,
      render: t => (
        <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
          {t.format.slice(0,2).map(f => (
            <span key={f} style={{ fontSize:10, color:'#71717a', background:'#fafafa', border:'1px solid #e4e4e7', padding:'1px 5px', borderRadius:2 }}>
              {f==='powerpoint'?'PPT':f==='google_slides'?'Slides':f==='keynote'?'Key':f==='canva'?'Canva':f}
            </span>
          ))}
          {t.format.length>2 && <span style={{ fontSize:10, color:'#a1a1aa' }}>+{t.format.length-2}</span>}
        </div>
      ),
    },
    { key:'downloads', header:'DL', width:70, align:'right', render:t => <span style={{ fontWeight:500 }}>{fmt(t.downloadCount)}</span> },
    { key:'created', header:'Created', width:100, render:t => <span style={{ color:'#a1a1aa' }}>{fmtDate(t.createdAt)}</span> },
    {
      key:'actions', header:'', width:90,
      render: t => (
        <div className="row-actions" style={{ justifyContent:'flex-end' }}>
          <button onClick={() => handleToggleFeatured(t)} className="btn btn-ghost btn-icon-sm" title={t.isFeatured?'Unfeature':'Feature'}>
            <Star size={13} color={t.isFeatured?'#eab308':'#a1a1aa'} fill={t.isFeatured?'#eab308':'none'}/>
          </button>
          <button onClick={() => openEdit(t)} className="btn btn-ghost btn-icon-sm"><Pencil size={13}/></button>
          <button onClick={() => setDeleteId(t._id)} className="btn btn-ghost btn-icon-sm" style={{ color:'#dc2626' }}><Trash2 size={13}/></button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Templates</div>
          <div className="page-subtitle">{fmt(total)} templates in library</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => { exportToCsv('templates.csv', data.map(t => ({ Title:t.title, Category:t.category?.name??'', Tier:t.tier, Status:t.status, Downloads:t.downloadCount, Created:fmtDate(t.createdAt) }))); toast.success('Exported') }} className="btn btn-secondary btn-sm">
            <Download size={12}/> Export
          </button>
          <button onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={12}/> New template
          </button>
        </div>
      </div>

      <DataTable
        columns={columns} data={data} total={total} page={page} pageSize={pageSize}
        emptyMessage="No templates found" rowKey={t => t._id}
        toolbar={
          <TableToolbar>
            <SearchInput placeholder="Search templates…"/>
            <FilterSelect label="All statuses" paramName="status" options={[
              {value:'published',label:'Published'},{value:'draft',label:'Draft'},{value:'archived',label:'Archived'},
            ]}/>
            <FilterSelect label="All tiers" paramName="tier" options={[
              {value:'free',label:'Free'},{value:'premium',label:'Premium'},
            ]}/>
            <FilterSelect label="All categories" paramName="category" options={categories.map(c => ({value:c._id,label:c.name}))}/>
          </TableToolbar>
        }
      />

      <TemplateModal
        open={showModal} onClose={() => { setShowModal(false); setEdit(null) }}
        template={editTemplate} categories={categories}
        onSuccess={() => { setShowModal(false); setEdit(null); router.refresh() }}
      />

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Delete template?" confirmLabel="Delete"
        message="This template and all associated files will be permanently deleted."
      />
    </div>
  )
}
