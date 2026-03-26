'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Download, Lock, ChevronLeft, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { downloadTemplate } from '@/actions/download.actions'

const FMT_LABEL: Record<string, string> = {
  powerpoint: 'PowerPoint (.pptx)', google_slides: 'Google Slides (.pptx)', keynote: 'Keynote (.key)', canva: 'Canva',
}

interface Template {
  _id: string; title: string; description: string; tier: string
  format: string[]; tags: string[]; downloadCount: number
  slideCount?: number; thumbnailUrl: string; previewImages: string[]
  category?: { name: string; _id: string }
}

interface Props {
  template: Template; fileUrls: Record<string, string>
  related: { _id: string; title: string; thumbnailUrl: string; tier: string; downloadCount: number }[]
  canDownloadFree: boolean; canDownloadPremium: boolean; isLoggedIn: boolean
}

export function TemplateDetailClient({ template, fileUrls, related, canDownloadFree, canDownloadPremium, isLoggedIn }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloaded,  setDownloaded]  = useState<Set<string>>(new Set())
  const [, startT] = useTransition()

  const canDownload = template.tier === 'free' ? canDownloadFree : canDownloadPremium
  const needsUpgrade = template.tier === 'premium' && !canDownloadPremium && isLoggedIn
  const needsLogin   = !isLoggedIn

  async function handleDownload(format: string) {
    if (!canDownload) return
    setDownloading(format)
    try {
      const result = await downloadTemplate(template._id, format)
      // Trigger browser download
      const a = document.createElement('a')
      a.href     = result.url
      a.download = `${template.title} - ${FMT_LABEL[format] ?? format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setDownloaded(prev => new Set([...prev, format]))
      toast.success(`Downloading ${FMT_LABEL[format] ?? format}`)
    } catch (err: any) {
      toast.error(err.message || 'Download failed')
    } finally {
      setDownloading(null)
    }
  }

  // Available formats = formats that have a file uploaded
  const availableFormats = template.format.filter(f => fileUrls[f])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>

      {/* Back */}
      <Link href="/templates" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#71717a', textDecoration: 'none', marginBottom: 24 }}>
        <ChevronLeft size={14}/> All templates
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>

        {/* Left: preview */}
        <div>
          {/* Main thumbnail */}
          <div style={{ width: '100%', paddingTop: '62.5%', position: 'relative', background: '#f4f4f5', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
            {template.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={template.thumbnailUrl} alt={template.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4d4d8' }}>No preview</div>
            )}
          </div>

          {/* Preview strip */}
          {template.previewImages?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {template.previewImages.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img} alt={`Preview ${i + 1}`}
                  style={{ width: 120, height: 72, objectFit: 'cover', borderRadius: 4, border: '1px solid #f4f4f5', flexShrink: 0 }}
                />
              ))}
            </div>
          )}

          {/* Description */}
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>About this template</h2>
            <p style={{ fontSize: 13.5, color: '#52525b', lineHeight: 1.7 }}>{template.description}</p>
          </div>

          {/* Tags */}
          {template.tags?.length > 0 && (
            <div style={{ marginTop: 20, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {template.tags.map(tag => (
                <Link key={tag} href={`/templates?q=${encodeURIComponent(tag)}`}
                  style={{ fontSize: 12, color: '#71717a', background: '#fafafa', border: '1px solid #e4e4e7', padding: '3px 10px', borderRadius: 20, textDecoration: 'none' }}>
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: download panel */}
        <div style={{ position: 'sticky', top: 76 }}>
          <div style={{ border: '1px solid #e4e4e7', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 16px' }}>
              {/* Tier badge */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 3, background: template.tier === 'premium' ? 'var(--gold-light)' : '#f0fdf4', color: template.tier === 'premium' ? 'var(--gold-dark)' : '#15803d', border: `1px solid ${template.tier === 'premium' ? 'var(--gold-border)' : '#bbf7d0'}` }}>
                  {template.tier === 'premium' ? '⭐ Premium' : '✓ Free'}
                </span>
              </div>

              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 12 }}>
                {template.title}
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, fontSize: 12.5, color: '#71717a' }}>
                {template.category && (
                  <div><span style={{ color: '#a1a1aa' }}>Category: </span>{template.category.name}</div>
                )}
                {template.slideCount && (
                  <div><span style={{ color: '#a1a1aa' }}>Slides: </span>{template.slideCount}</div>
                )}
                <div>
                  <span style={{ color: '#a1a1aa' }}>Downloads: </span>
                  {template.downloadCount.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f4f4f5', padding: '16px 20px' }}>
              {/* Download buttons */}
              {needsLogin ? (
                <div>
                  <Link href="/register" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    height: 40, background: 'var(--brand)', color: '#fff', borderRadius: 5,
                    fontSize: 13.5, fontWeight: 600, textDecoration: 'none', marginBottom: 8,
                  }}>
                    Sign up to download
                  </Link>
                  <Link href="/login" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 36, border: '1px solid #e4e4e7', borderRadius: 5,
                    fontSize: 13, color: '#52525b', textDecoration: 'none',
                  }}>
                    Already have an account? Sign in
                  </Link>
                </div>
              ) : needsUpgrade ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 12px', background: '#fafafa', border: '1px solid #e4e4e7', borderRadius: 5, marginBottom: 12 }}>
                    <Lock size={14} color="#a1a1aa"/>
                    <span style={{ fontSize: 12.5, color: '#71717a' }}>Premium template — Pro plan required</span>
                  </div>
                  <Link href="/pricing" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 40, background: 'var(--brand)', color: '#fff', borderRadius: 5,
                    fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
                  }}>
                    Upgrade to Pro
                  </Link>
                </div>
              ) : availableFormats.length === 0 ? (
                <div style={{ padding: '12px', background: '#fafafa', border: '1px solid #e4e4e7', borderRadius: 5, fontSize: 12.5, color: '#a1a1aa', textAlign: 'center' }}>
                  Files are being prepared. Check back soon.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {availableFormats.map(format => (
                    <button
                      key={format}
                      onClick={() => handleDownload(format)}
                      disabled={!!downloading}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        height: 40, padding: '0 14px',
                        background: downloaded.has(format) ? '#f0fdf4' : '#fff',
                        border: `1px solid ${downloaded.has(format) ? '#bbf7d0' : '#e4e4e7'}`,
                        borderRadius: 5, cursor: downloading ? 'wait' : 'pointer',
                        fontSize: 13, color: downloaded.has(format) ? '#15803d' : 'var(--ink)',
                        fontWeight: 500, opacity: downloading && downloading !== format ? 0.6 : 1,
                      }}
                    >
                      <span>{FMT_LABEL[format] ?? format}</span>
                      {downloading === format
                        ? <Loader2 size={15} className="animate-spin" color="#a1a1aa"/>
                        : downloaded.has(format)
                          ? <Check size={15} color="#16a34a"/>
                          : <Download size={15} color="#a1a1aa"/>
                      }
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: 56, borderTop: '1px solid #f4f4f5', paddingTop: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 20 }}>More templates</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {related.map(t => (
              <Link key={t._id} href={`/templates/${t._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ border: '1px solid #f4f4f5', borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
                  <div style={{ width: '100%', paddingTop: '62.5%', position: 'relative', background: '#f4f4f5' }}>
                    {t.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.thumbnailUrl} alt={t.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: 11.5, color: '#a1a1aa', marginTop: 3 }}>{t.downloadCount.toLocaleString()} downloads</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
