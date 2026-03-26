'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface Banner {
  _id: string; title: string; subtitle?: string
  imageUrl: string; linkUrl?: string
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx]       = useState(0)
  const [paused, setPaused] = useState(false)
  const [animating, setAnim] = useState(false)

  const go = useCallback((next: number) => {
    if (animating) return
    setAnim(true)
    setIdx(next)
    setTimeout(() => setAnim(false), 600)
  }, [animating])

  const next = useCallback(() => go((idx + 1) % banners.length), [go, idx, banners.length])
  const prev = useCallback(() => go((idx - 1 + banners.length) % banners.length), [go, idx, banners.length])

  useEffect(() => {
    if (paused || banners.length <= 1) return
    const t = setInterval(next, 6000)
    return () => clearInterval(t)
  }, [paused, next, banners.length])

  if (!banners.length) return null
  const b = banners[idx]

  return (
    <div
      style={{ position: 'relative', width: '100%', height: 520, overflow: 'hidden', background: '#030329' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {banners.map((banner, i) => (
        <div key={banner._id} style={{
          position: 'absolute', inset: 0,
          opacity: i === idx ? 1 : 0,
          transition: 'opacity .7s ease',
          pointerEvents: i === idx ? 'auto' : 'none',
        }}>
          {/* Background image */}
          {banner.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banner.imageUrl} alt={banner.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.55)' }} />
          )}
          {/* Gradient overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(3,3,41,.9) 0%, rgba(3,3,41,.4) 50%, rgba(3,3,41,.2) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,3,41,.8) 0%, transparent 50%)' }} />
        </div>
      ))}

      {/* Content */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', padding: '0 80px' }}>
        <div style={{ maxWidth: 600, opacity: animating ? 0 : 1, transform: animating ? 'translateY(10px)' : 'translateY(0)', transition: 'opacity .4s ease, transform .4s ease' }}>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, textShadow: '0 2px 30px rgba(0,0,0,.5)' }}>
            {b.title}
          </h1>
          {b.subtitle && (
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,.75)', marginBottom: 32, lineHeight: 1.65, maxWidth: 480 }}>
              {b.subtitle}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href={b.linkUrl || '/templates'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 48, padding: '0 28px', background: 'var(--gold)', color: '#030329', borderRadius: 6, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
              Browse templates <ArrowRight size={15} />
            </Link>
            <Link href="/register"
              style={{ display: 'inline-flex', alignItems: 'center', height: 48, padding: '0 24px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', borderRadius: 6, fontSize: 14, fontWeight: 500, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
              Get started free
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={prev}
            style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', transition: 'background .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,162,39,.3)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)' }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={next}
            style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', transition: 'background .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,162,39,.3)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)' }}>
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
            {banners.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                style={{ width: i === idx ? 28 : 8, height: 8, borderRadius: 4, background: i === idx ? 'var(--gold)' : 'rgba(255,255,255,.3)', border: 'none', cursor: 'pointer', transition: 'all .35s', padding: 0 }} />
            ))}
          </div>

          {/* Slide counter */}
          <div style={{ position: 'absolute', bottom: 28, right: 32, zIndex: 3, fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>
            {idx + 1} / {banners.length}
          </div>
        </>
      )}
    </div>
  )
}
