'use client'

/**
 * FileUpload — two upload strategies:
 *
 * Images (thumbnails, banners, previews):
 *   - Compressed client-side via canvas → WebP (max 1920×1080, 85% quality)
 *   - Then POSTed as raw binary to /api/upload
 *   - Server re-compresses with sharp and streams to S3
 *
 * Large binary files (PPTX, PDF, ZIP):
 *   - Requests a presigned S3 PUT URL from /api/upload-presign
 *   - Uploads directly to S3 from the browser — server never buffers the bytes
 *   - Progress bar shows real upload progress
 */

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle, Loader2, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const FORMAT_ACCEPT: Record<string, string> = {
  powerpoint:    '.pptx,.ppt',
  google_slides: '.pptx,.pdf,.zip',
  keynote:       '.key,.zip',
  canva:         '.pdf,.zip,.pptx',
  image:         '.jpg,.jpeg,.png,.webp',
}

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'])

function formatSize(bytes: number) {
  if (bytes < 1024)    return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

// ── Client-side image compression ─────────────────────────────────────────────
async function compressImage(file: File, maxW = 1920, maxH = 1080, quality = 0.85): Promise<File> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      const ratio = Math.min(maxW / width, maxH / height, 1)
      width  = Math.round(width  * ratio)
      height = Math.round(height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => {
        if (!blob) { resolve(file); return }
        const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })
        resolve(compressed.size < file.size ? compressed : file)
      }, 'image/webp', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

// ── XHR with progress ──────────────────────────────────────────────────────────
function xhrPut(url: string, body: Blob | File, headers: Record<string,string>, onProgress: (p:number)=>void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round(e.loaded/e.total*100)) }
    xhr.onload   = () => xhr.status < 300 ? resolve() : reject(new Error(`S3 upload failed (${xhr.status})`))
    xhr.onerror  = () => reject(new Error('Network error'))
    xhr.ontimeout = () => reject(new Error('Upload timed out'))
    xhr.timeout  = 60 * 60 * 1000   // 1 hour
    xhr.open('PUT', url)
    Object.entries(headers).forEach(([k,v]) => xhr.setRequestHeader(k, v))
    xhr.send(body)
  })
}

// ── Upload image via /api/upload (server compresses + streams to S3) ──────────
async function uploadImage(file: File, onProgress: (p:number)=>void): Promise<string> {
  const compressed = await compressImage(file, 1920, 1080, 0.85)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round(e.loaded/e.total*100)) }
    xhr.onload = () => {
      try {
        const d = JSON.parse(xhr.responseText)
        if (xhr.status < 300 && d.url) resolve(d.url)
        else reject(new Error(d.error || `Upload failed (${xhr.status})`))
      } catch { reject(new Error('Invalid response')) }
    }
    xhr.onerror  = () => reject(new Error('Network error'))
    xhr.ontimeout = () => reject(new Error('Timed out'))
    xhr.timeout  = 10 * 60 * 1000
    xhr.open('POST', '/api/upload')
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.setRequestHeader('x-file-name',  encodeURIComponent(compressed.name))
    xhr.setRequestHeader('x-file-size',  String(file.size))
    xhr.send(compressed)
  })
}

// ── Upload large file via presigned S3 URL (client → S3 directly) ─────────────
async function uploadLargeFile(file: File, onProgress: (p:number)=>void, onStatus: (s:string)=>void): Promise<string> {
  // Step 1: get presigned URL from our API
  onStatus('Preparing upload…')
  const res  = await fetch('/api/upload-presign', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ fileName: file.name, contentType: file.type || 'application/octet-stream' }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to get upload URL')

  // Step 2: PUT directly to S3 — browser streams bytes, never hits our server
  onStatus('Uploading to storage…')
  await xhrPut(data.presignedUrl, file, { 'Content-Type': file.type || 'application/octet-stream' }, onProgress)

  return data.publicUrl
}

// ── FileUpload — PPTX / PDF / ZIP (presigned → S3) ────────────────────────────
export function FileUpload({ label, format, value, onChange, hint }: {
  label?: string; format: string; value?: string; onChange: (url: string) => void; hint?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [status,    setStatus]    = useState('')
  const [over,      setOver]      = useState(false)
  const [uploadedName, setName]   = useState('')
  const [uploadedSize, setSize]   = useState(0)
  const ref = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setUploading(true); setProgress(0); setStatus('Starting…')
    try {
      const ext     = file.name.split('.').pop()?.toLowerCase() ?? ''
      const isImage = IMAGE_EXTS.has(`.${ext}`)
      let url: string

      if (isImage) {
        url = await uploadImage(file, p => { setProgress(p); setStatus(`Uploading… ${p}%`) })
      } else {
        url = await uploadLargeFile(file, p => { setProgress(p); setStatus(`Uploading… ${p}%`) }, setStatus)
      }

      setName(file.name); setSize(file.size)
      onChange(url)
      toast.success('File uploaded')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally { setUploading(false); setProgress(0); setStatus('') }
  }

  if (value) {
    return (
      <div>
        {label && <div className="label">{label}</div>}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:4 }}>
          <CheckCircle size={15} color="#16a34a" style={{ flexShrink:0 }}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12.5, fontWeight:500, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {uploadedName || value.split('/').pop()}
            </div>
            {uploadedSize > 0 && <div style={{ fontSize:11, color:'#71717a', marginTop:1 }}>{formatSize(uploadedSize)}</div>}
          </div>
          <button type="button" onClick={() => { onChange(''); setName(''); setSize(0) }}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#71717a', display:'flex' }}>
            <X size={14}/>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {label && <div className="label">{label}</div>}
      {hint && <div style={{ fontSize:11.5, color:'var(--ink-4)', marginBottom:6 }}>{hint}</div>}
      <div
        className={cn('upload-zone', over && 'over')}
        onClick={() => !uploading && ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) upload(f) }}
      >
        <input ref={ref} type="file" accept={FORMAT_ACCEPT[format] ?? '*'} style={{ display:'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }}/>
        {uploading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, width:'100%' }}>
            <Loader2 size={20} color="var(--brand)" className="animate-spin"/>
            <div style={{ fontSize:12, color:'var(--ink-3)' }}>{status}</div>
            {progress > 0 && (
              <div style={{ width:'100%', maxWidth:240, height:4, background:'var(--line)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'var(--brand)', transition:'width .3s', borderRadius:2 }}/>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <Upload size={18} color="#a1a1aa"/>
            <div style={{ textAlign:'center' }}>
              <span style={{ fontSize:12.5, color:'#52525b' }}>Drop file or <span style={{ color:'var(--ink)', fontWeight:500 }}>browse</span></span>
              <div style={{ fontSize:11, color:'#a1a1aa', marginTop:3 }}>{FORMAT_ACCEPT[format] ?? 'Any file'} · No size limit</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ThumbnailUpload — compress → /api/upload → S3 ─────────────────────────────
export function ThumbnailUpload({ value, onChange }: { value?: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [over,      setOver]      = useState(false)
  const [localSrc,  setLocalSrc]  = useState<string | null>(null)
  const ref = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    const objectUrl = URL.createObjectURL(file)
    setLocalSrc(objectUrl)
    setUploading(true); setProgress(0)
    try {
      const url   = await uploadImage(file, setProgress)
      onChange(url)
      toast.success('Thumbnail uploaded')
    } catch (err: any) {
      onChange(objectUrl)  // fallback to local preview
      toast.error(err.message || 'Upload failed — using local preview')
    } finally { setUploading(false); setProgress(0) }
  }

  const displaySrc = localSrc || value

  return (
    <div>
      <div className="label">Thumbnail</div>
      <div style={{ fontSize:11.5, color:'var(--ink-4)', marginBottom:8 }}>
        Auto-compressed to WebP · Max 1920×1080
      </div>
      {displaySrc ? (
        <div style={{ position:'relative', display:'inline-block' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displaySrc} alt="Thumbnail"
            style={{ width:240, height:135, objectFit:'cover', borderRadius:4, border:'1px solid var(--line-2)', display:'block' }}
            onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="135" fill="%23f4f4f5"><rect width="240" height="135"/></svg>' }}
          />
          {uploading && (
            <div style={{ position:'absolute', inset:0, borderRadius:4, background:'rgba(255,255,255,.88)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
              <Loader2 size={20} color="var(--brand)" className="animate-spin"/>
              <div style={{ width:160, height:3, background:'var(--line)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'var(--brand)', transition:'width .2s' }}/>
              </div>
              <div style={{ fontSize:11, color:'var(--ink-3)' }}>{progress > 0 ? `${progress}%` : 'Compressing…'}</div>
            </div>
          )}
          <button type="button" onClick={() => { onChange(''); setLocalSrc(null) }}
            style={{ position:'absolute', top:6, right:6, width:22, height:22, borderRadius:3, background:'rgba(3,3,41,.7)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
            <X size={12}/>
          </button>
        </div>
      ) : (
        <div
          className={cn('upload-zone', over && 'over')}
          style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 20px', textAlign:'left', cursor:'pointer' }}
          onClick={() => ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        >
          <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.webp,.gif" style={{ display:'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}/>
          <div style={{ width:36, height:36, borderRadius:4, background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <ImageIcon size={16} color="#a1a1aa"/>
          </div>
          <div>
            <div style={{ fontSize:12.5, color:'#52525b' }}>Drop image or <span style={{ color:'var(--ink)', fontWeight:500 }}>browse</span></div>
            <div style={{ fontSize:11, color:'#a1a1aa', marginTop:2 }}>Auto-compressed to WebP</div>
          </div>
        </div>
      )}
    </div>
  )
}
