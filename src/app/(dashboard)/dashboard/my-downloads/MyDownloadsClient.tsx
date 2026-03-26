'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  Search,
  X,
  Loader2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/index';
import { downloadTemplate } from '@/actions/download.actions';
import { deleteDownload } from '@/actions';
import { fmtDate, timeAgo } from '@/lib/utils';

interface DL {
  _id: string;
  downloadedAt: string;
  format: string;
  template?: {
    _id: string;
    title: string;
    thumbnailUrl: string;
    tier: string;
    format: string[];
    category?: { name: string };
  };
}

const FMT: Record<string, string> = {
  powerpoint: 'PowerPoint',
  google_slides: 'Google Slides',
  keynote: 'Keynote',
  canva: 'Canva',
};
const FMT_SHORT: Record<string, string> = {
  powerpoint: 'PPT',
  google_slides: 'Slides',
  keynote: 'Key',
  canva: 'Canva',
};

export function MyDownloadsClient({ data }: { data: DL[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [redownloading, setReDl] = useState<string | null>(null);

  // Group downloads by template — one row per template, show all formats downloaded
  const grouped = data.reduce<
    Record<
      string,
      { template: DL['template']; downloads: DL[]; lastDownloadedAt: string }
    >
  >((acc, d) => {
    const tid = d.template?._id ?? 'deleted';
    if (!acc[tid]) {
      acc[tid] = {
        template: d.template,
        downloads: [],
        lastDownloadedAt: d.downloadedAt,
      };
    }
    acc[tid].downloads.push(d);
    if (d.downloadedAt > acc[tid].lastDownloadedAt) {
      acc[tid].lastDownloadedAt = d.downloadedAt;
    }
    return acc;
  }, {});

  const rows = Object.values(grouped).sort(
    (a, b) =>
      new Date(b.lastDownloadedAt).getTime() -
      new Date(a.lastDownloadedAt).getTime(),
  );

  const filtered = search.trim()
    ? rows.filter((r) =>
        r.template?.title?.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  async function handleReDownload(row: (typeof rows)[0], format?: string) {
    if (!row.template) return;
    const fmt = format ?? row.downloads[0]?.format ?? row.template.format?.[0];
    if (!fmt) {
      toast.error('No format available');
      return;
    }
    const key = `${row.template._id}-${fmt}`;
    setReDl(key);
    try {
      const result = await downloadTemplate(row.template._id, fmt);
      const a = document.createElement('a');
      a.href = result.url;
      a.download = row.template.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Download started');
    } catch (err: any) {
      toast.error(err.message || 'Download failed');
    } finally {
      setReDl(null);
    }
  }

  async function handleDelete(downloadId: string) {
    setDeleting(downloadId);
    try {
      await deleteDownload(downloadId);
      toast.success('Removed from downloads');
      router.refresh();
    } catch {
      toast.error('Failed to remove');
    } finally {
      setDeleting(null);
    }
  }

  async function handleDeleteAll(templateId: string) {
    const ids = grouped[templateId]?.downloads.map((d) => d._id) ?? [];
    setDeleting(templateId);
    try {
      await Promise.all(ids.map((id) => deleteDownload(id)));
      toast.success('Removed from downloads');
      router.refresh();
    } catch {
      toast.error('Failed to remove');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">My Downloads</div>
          <div className="page-subtitle">
            {rows.length} template{rows.length !== 1 ? 's' : ''} downloaded
          </div>
        </div>
      </div>

      <div className="search-wrap" style={{ maxWidth: 280, marginBottom: 14 }}>
        <Search size={13} color="#a1a1aa" style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by template…"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              padding: 0,
              color: '#a1a1aa',
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div
          className="card"
          style={{ padding: '48px 20px', textAlign: 'center' }}
        >
          <Download
            size={28}
            strokeWidth={1}
            style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }}
          />
          <div
            style={{
              fontSize: 13,
              color: 'var(--ink-2)',
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            No downloads yet
          </div>
          <div
            style={{ fontSize: 12.5, color: 'var(--ink-4)', marginBottom: 16 }}
          >
            Templates you download will appear here.
          </div>
          <Link
            href="/dashboard/templates"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', margin: '0 auto' }}
          >
            Browse templates
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>
            No results for &quot;{search}&quot;
          </div>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Template</th>
                <th>Category</th>
                <th>Downloaded formats</th>
                <th>Last downloaded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const tid = row.template?._id ?? 'deleted';
                const isDeleting = deleting === tid;
                return (
                  <tr key={tid}>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        {row.template ? (
                          <Link
                            href={`/dashboard/templates/${row.template._id}`}
                            style={{
                              flexShrink: 0,
                              display: 'block',
                              width: 64,
                              height: 40,
                              borderRadius: 4,
                              overflow: 'hidden',
                              border: '1px solid var(--line)',
                              position: 'relative',
                              background: 'var(--surface)',
                            }}
                          >
                            {row.template.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={row.template.thumbnailUrl}
                                alt={row.template.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    'none';
                                }}
                              />
                            ) : null}
                          </Link>
                        ) : (
                          <div
                            style={{
                              width: 64,
                              height: 40,
                              background: 'var(--surface)',
                              borderRadius: 4,
                              flexShrink: 0,
                              border: '1px solid var(--line)',
                            }}
                          />
                        )}
                        <div>
                          {row.template ? (
                            <Link
                              href={`/dashboard/templates/${row.template._id}`}
                              style={{
                                display: 'block',
                                fontWeight: 500,
                                color: 'var(--ink)',
                                fontSize: 12.5,
                                textDecoration: 'none',
                                marginBottom: 3,
                              }}
                            >
                              {row.template.title}
                            </Link>
                          ) : (
                            <div
                              style={{
                                fontWeight: 500,
                                color: 'var(--ink-4)',
                                fontSize: 12.5,
                              }}
                            >
                              Deleted template
                            </div>
                          )}
                          {row.template && (
                            <StatusBadge status={row.template.tier} />
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--ink-3)' }}>
                      {row.template?.category?.name ?? '—'}
                    </td>
                    <td>
                      <div
                        style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}
                      >
                        {row.downloads.map((d) => (
                          <button
                            key={d._id}
                            onClick={() =>
                              row.template && handleReDownload(row, d.format)
                            }
                            disabled={!!redownloading}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              color: 'var(--brand)',
                              background: 'var(--brand-light)',
                              border: '1px solid var(--brand-border)',
                              padding: '2px 8px',
                              borderRadius: 3,
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            {redownloading ===
                            `${row.template?._id}-${d.format}` ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Download size={10} />
                            )}
                            {FMT_SHORT[d.format] ?? d.format}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td
                      style={{ color: 'var(--ink-4)', fontSize: 12 }}
                      title={fmtDate(row.lastDownloadedAt)}
                    >
                      {timeAgo(row.lastDownloadedAt)}
                    </td>
                    <td>
                      <div
                        className="row-actions"
                        style={{ justifyContent: 'flex-end', gap: 4 }}
                      >
                        {row.template && (
                          <Link
                            href={`/dashboard/templates/${row.template._id}`}
                            className="btn btn-ghost btn-icon-sm"
                            title="View template"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        )}
                        <button
                          onClick={() => handleDeleteAll(tid)}
                          disabled={isDeleting}
                          className="btn btn-ghost btn-icon-sm"
                          style={{ color: 'var(--red)' }}
                          title="Remove from history"
                        >
                          {isDeleting ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
