'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Download,
  Heart,
  Lock,
  Loader2,
  Check,
  Star,
  ChevronLeft,
  ChevronRight,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { downloadTemplate } from '@/actions/download.actions';
import { toggleFavourite } from '@/actions';
import { fmt, fmtDate } from '@/lib/utils';

const FMT: Record<string, string> = {
  powerpoint: 'PowerPoint (.pptx)',
  google_slides: 'Google Slides',
  keynote: 'Keynote (.key)',
  canva: 'Canva',
};
const FMT_SHORT: Record<string, string> = {
  powerpoint: 'PPT',
  google_slides: 'Slides',
  keynote: 'Key',
  canva: 'Canva',
};

interface Template {
  _id: string;
  title: string;
  description: string;
  tier: string;
  format: string[];
  tags: string[];
  downloadCount: number;
  slideCount?: number;
  thumbnailUrl: string;
  previewImages?: string[];
  createdAt: string;
  category?: { name: string };
  fileUrls?: Record<string, string>;
}
interface Props {
  template: Template;
  isModal?: boolean;
  isFavourited?: boolean;
  canDownloadFree: boolean;
  canDownloadPremium: boolean;
  isLoggedIn: boolean;
}

function isPublicUrl(url: string) {
  if (!url) return false;
  if (
    url.startsWith('/') ||
    url.startsWith('http://localhost') ||
    url.startsWith('http://127.')
  )
    return false;
  return url.startsWith('http');
}

export function TemplateViewClient({
  template: t,
  isModal,
  isFavourited: initFav,
  canDownloadFree,
  canDownloadPremium,
  isLoggedIn,
}: Props) {
  const router = useRouter();
  const [fav, setFav] = useState(initFav ?? false);
  const [downloading, setDl] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [, startT] = useTransition();

  type Mode = 'iframe' | 'images' | 'converting' | 'none';
  const [mode, setMode] = useState<Mode>('none');
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(t.previewImages ?? []);
  const [idx, setIdx] = useState(0);
  const [convertError, setConvErr] = useState<string | null>(null);

  const canDl = t.tier === 'free' ? canDownloadFree : canDownloadPremium;
  const needsUp = t.tier === 'premium' && !canDownloadPremium && isLoggedIn;
  const needsLogin = !isLoggedIn;

  const fileUrls: Record<string, string> = t.fileUrls ?? {};
  const available = t.format.filter((f) => fileUrls[f]);
  const viewFile =
    fileUrls['powerpoint'] ||
    fileUrls['google_slides'] ||
    fileUrls['keynote'] ||
    fileUrls[available[0]] ||
    null;

  const dismiss = useCallback(() => router.back(), [router]);

  useEffect(() => {
    if (!isModal) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
      if (e.key === 'ArrowLeft' && mode === 'images' && idx > 0)
        setIdx((i) => i - 1);
      if (
        e.key === 'ArrowRight' &&
        mode === 'images' &&
        idx < images.length - 1
      )
        setIdx((i) => i + 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isModal, dismiss, mode, idx, images.length]);

  useEffect(() => {
    if ((t.previewImages ?? []).length > 0) {
      setMode('images');
      return;
    }
    if (!viewFile) {
      setMode('none');
      return;
    }
    if (isPublicUrl(viewFile)) {
      setIframeUrl(
        `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewFile)}`,
      );
      setMode('iframe');
      return;
    }
    convert(viewFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function convert(fileUrl: string) {
    setMode('converting');
    setConvErr(null);
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Conversion failed');
      if (data.images?.length) {
        setImages(data.images);
        setMode('images');
      } else throw new Error('No slides generated');
    } catch (err: any) {
      setConvErr(err.message);
      if (t.thumbnailUrl) {
        setImages([t.thumbnailUrl]);
        setMode('images');
      } else setMode('none');
    }
  }

  function handleFav() {
    setFav((v) => !v);
    startT(async () => {
      try {
        await toggleFavourite(t._id);
        toast.success(fav ? 'Removed' : 'Saved');
        router.refresh();
      } catch {
        setFav((v) => !v);
        toast.error('Failed');
      }
    });
  }

  async function handleDownload(format: string) {
    if (!canDl) return;
    setDl(format);
    try {
      const result = await downloadTemplate(t._id, format);
      const a = document.createElement('a');
      a.href = result.url;
      a.download = `${t.title} - ${FMT[format] ?? format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloaded((prev) => new Set([...prev, format]));
      toast.success('Download started');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    } finally {
      setDl(null);
    }
  }

  const slideArea = (
    <div
      style={{
        flex: 1,
        background: '#08082e',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {mode === 'converting' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <Loader2 size={40} className="animate-spin" color="var(--gold)" />
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                marginBottom: 6,
              }}
            >
              Generating slide previews…
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.4)' }}>
              Converting template file. This takes a few seconds.
            </div>
          </div>
        </div>
      )}

      {mode === 'none' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            color: 'rgba(255,255,255,.25)',
          }}
        >
          <Monitor size={48} strokeWidth={1} />
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: 'rgba(255,255,255,.5)',
                marginBottom: 4,
              }}
            >
              No file uploaded yet
            </div>
            <div style={{ fontSize: 12.5 }}>
              The admin hasn&apos;t uploaded the template file yet.
            </div>
          </div>
        </div>
      )}

      {mode === 'iframe' && iframeUrl && (
        <div style={{ flex: 1, position: 'relative' }}>
          <iframe
            src={iframeUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
            allow="fullscreen"
            title={`${t.title} preview`}
          />
        </div>
      )}

      {mode === 'images' && images.length > 0 && (
        <>
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              overflow: 'hidden',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={idx}
              src={images[idx]}
              alt={`Slide ${idx + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 6,
                boxShadow: '0 20px 60px rgba(0,0,0,.5)',
                display: 'block',
              }}
            />
            {idx > 0 && (
              <button
                onClick={() => setIdx((i) => i - 1)}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.12)',
                  border: '1px solid rgba(255,255,255,.2)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {idx < images.length - 1 && (
              <button
                onClick={() => setIdx((i) => i + 1)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.12)',
                  border: '1px solid rgba(255,255,255,.2)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div
              style={{
                background: '#050520',
                borderTop: '1px solid rgba(255,255,255,.07)',
                padding: '10px 16px',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: 'rgba(255,255,255,.4)',
                  marginBottom: 8,
                }}
              >
                Slide {idx + 1} of {images.length}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 5,
                  overflowX: 'auto',
                  paddingBottom: 2,
                  justifyContent: images.length <= 8 ? 'center' : 'flex-start',
                }}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    style={{
                      flexShrink: 0,
                      width: 72,
                      height: 44,
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: `2px solid ${i === idx ? 'var(--gold)' : 'transparent'}`,
                      padding: 0,
                      cursor: 'pointer',
                      background: '#0d0d40',
                      opacity: i === idx ? 1 : 0.5,
                      transition: 'all .15s',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Slide ${i + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const infoPanel = (
    <div
      style={{
        width: isModal ? 300 : '100%',
        flexShrink: 0,
        background: '#030329',
        borderLeft: isModal ? '1px solid rgba(255,255,255,.08)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 10,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '3px 9px',
              borderRadius: 3,
              color: t.tier === 'premium' ? 'var(--gold)' : 'var(--green)',
              background:
                t.tier === 'premium'
                  ? 'rgba(201,162,39,.12)'
                  : 'rgba(22,163,74,.12)',
              border: `1px solid ${t.tier === 'premium' ? 'rgba(201,162,39,.3)' : 'rgba(22,163,74,.3)'}`,
            }}
          >
            {t.tier === 'premium' ? '⭐ Premium' : '✓ Free'}
          </span>
          {t.category && (
            <span
              style={{
                fontSize: 10.5,
                color: 'rgba(255,255,255,.4)',
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)',
                padding: '3px 9px',
                borderRadius: 3,
              }}
            >
              {t.category.name}
            </span>
          )}
        </div>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.3,
            marginBottom: 12,
            letterSpacing: '-0.01em',
          }}
        >
          {t.title}
        </h2>
        <p
          style={{
            fontSize: 12.5,
            color: 'rgba(255,255,255,.5)',
            lineHeight: 1.65,
            marginBottom: 12,
          }}
        >
          {t.description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            ['Formats', t.format.map((f) => FMT_SHORT[f] ?? f).join(', ')],
            ...(t.slideCount ? [['Slides', String(t.slideCount)]] : []),
            ['Downloads', fmt(t.downloadCount)],
            ['Added', fmtDate(t.createdAt)],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
              }}
            >
              <span style={{ color: 'rgba(255,255,255,.3)' }}>{k}</span>
              <span style={{ color: 'rgba(255,255,255,.65)', fontWeight: 500 }}>
                {v}
              </span>
            </div>
          ))}
        </div>
        {t.tags?.length > 0 && (
          <div
            style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}
          >
            {t.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,.35)',
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.08)',
                  padding: '2px 8px',
                  borderRadius: 20,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px', flex: 1 }}>
        {needsLogin ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link
              href="/register"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 42,
                background: 'var(--gold)',
                color: '#030329',
                borderRadius: 5,
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Sign up to download
            </Link>
            <Link
              href="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 38,
                border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 5,
                fontSize: 13,
                color: 'rgba(255,255,255,.6)',
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          </div>
        ) : needsUp ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: 'rgba(201,162,39,.08)',
                border: '1px solid rgba(201,162,39,.2)',
                borderRadius: 5,
              }}
            >
              <Lock size={14} color="var(--gold)" />
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.65)' }}>
                Pro subscription required
              </span>
            </div>
            <Link
              href="/dashboard/billing"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 42,
                background: 'var(--gold)',
                color: '#030329',
                borderRadius: 5,
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Upgrade to Pro
            </Link>
          </div>
        ) : available.length === 0 ? (
          <div
            style={{
              padding: 14,
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 5,
              fontSize: 12.5,
              color: 'rgba(255,255,255,.4)',
              textAlign: 'center',
            }}
          >
            No files uploaded yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(255,255,255,.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              Download format
            </div>
            {available.map((format) => (
              <button
                key={format}
                onClick={() => handleDownload(format)}
                disabled={!!downloading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: 42,
                  padding: '0 14px',
                  background: downloaded.has(format)
                    ? 'rgba(22,163,74,.1)'
                    : 'rgba(255,255,255,.05)',
                  border: `1px solid ${downloaded.has(format) ? 'rgba(22,163,74,.3)' : 'rgba(255,255,255,.1)'}`,
                  borderRadius: 6,
                  cursor: downloading ? 'wait' : 'pointer',
                  fontSize: 13,
                  color: downloaded.has(format) ? '#4ade80' : '#fff',
                  fontWeight: 500,
                  transition: 'all .15s',
                }}
              >
                <span>{FMT[format] ?? format}</span>
                {downloading === format ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                    color="rgba(255,255,255,.4)"
                  />
                ) : downloaded.has(format) ? (
                  <Check size={15} color="#4ade80" />
                ) : (
                  <Download size={15} color="rgba(255,255,255,.4)" />
                )}
              </button>
            ))}
          </div>
        )}

        {convertError && viewFile && (
          <button
            onClick={() => convert(viewFile)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              height: 34,
              marginTop: 8,
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 12,
              color: 'rgba(255,255,255,.45)',
              fontWeight: 500,
            }}
          >
            <RefreshCw size={12} /> Retry slide generation
          </button>
        )}

        {isLoggedIn && (
          <button
            onClick={handleFav}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              width: '100%',
              height: 38,
              marginTop: 8,
              background: 'rgba(255,255,255,.04)',
              border: `1px solid ${fav ? 'rgba(239,68,68,.4)' : 'rgba(255,255,255,.1)'}`,
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 13,
              color: fav ? '#f87171' : 'rgba(255,255,255,.5)',
              fontWeight: 500,
            }}
          >
            <Heart
              size={14}
              fill={fav ? '#f87171' : 'none'}
              color={fav ? '#f87171' : 'rgba(255,255,255,.5)'}
            />{' '}
            {fav ? 'Saved to favourites' : 'Save to favourites'}
          </button>
        )}
      </div>
    </div>
  );

  const body = (
    <div
      style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
        flexDirection: isModal ? 'row' : 'column',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {slideArea}
      </div>
      {infoPanel}
    </div>
  );

  if (!isModal) {
    return (
      <div
        style={{
          background: '#030329',
          minHeight: 'calc(100vh - 56px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {body}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={dismiss}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,.8)',
          backdropFilter: 'blur(6px)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 1080,
          maxHeight: '95vh',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.1)',
          boxShadow: '0 40px 100px rgba(0,0,0,.7)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: '#020215',
            borderBottom: '1px solid rgba(255,255,255,.07)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {t.title}
            </span>
            {t.tier === 'premium' && (
              <Star
                size={13}
                color="var(--gold)"
                fill="var(--gold)"
                style={{ flexShrink: 0 }}
              />
            )}
          </div>
          <button
            onClick={dismiss}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,.7)',
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>
        {body}
      </div>
    </div>
  );
}
