/**
 * Upload API — streams file to S3 with server-side compression
 *
 * Flow:
 *   Images  → sharp compresses to WebP (max 1920×1080, quality 85) → stream to S3
 *   PPTX/PDF/ZIP → stream directly to S3 (binary files don't benefit from re-compression)
 *
 * File body sent as raw binary (Content-Type: application/octet-stream)
 * File name and size passed via x-file-name and x-file-size headers
 * No FormData — no body size limit
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getS3Client, S3_BUCKET, s3Url } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { Readable, Transform, pipeline as streamPipeline } from 'stream'
import { promisify } from 'util'
import crypto from 'crypto'
import path from 'path'

export const dynamic     = 'force-dynamic'
export const maxDuration = 120

const pipeline = promisify(streamPipeline)

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'])

const MIME: Record<string, string> = {
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt':  'application/vnd.ms-powerpoint',
  '.pdf':  'application/pdf',
  '.zip':  'application/zip',
  '.key':  'application/x-iwork-keynote-sffkey',
  '.webp': 'image/webp',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rawName = decodeURIComponent(req.headers.get('x-file-name') ?? 'file')
    const ext     = path.extname(rawName).toLowerCase()
    const isImage = IMAGE_EXTS.has(ext)

    if (!req.body) return NextResponse.json({ error: 'No file body' }, { status: 400 })

    // Convert Web ReadableStream → Node Readable for streaming
    const nodeStream = Readable.fromWeb(req.body as any)

    // Build S3 key
    const folder    = isImage ? 'uploads/images' : 'uploads/files'
    const outExt    = isImage ? '.webp' : ext
    const key       = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${outExt}`
    const mimeType  = isImage ? 'image/webp' : (MIME[ext] ?? 'application/octet-stream')

    // For images: pipe through sharp for compression
    // For binary files: pipe directly — collect into buffer for S3 PutObject
    let bodyBuffer: Buffer

    if (isImage) {
      // Dynamically import sharp (server-only, not bundled for client)
      const sharp = (await import('sharp')).default
      const chunks: Buffer[] = []
      const sharpStream = sharp()
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })

      await new Promise<void>((resolve, reject) => {
        nodeStream.pipe(sharpStream)
        sharpStream.on('data', (chunk: Buffer) => chunks.push(chunk))
        sharpStream.on('end', resolve)
        sharpStream.on('error', reject)
        nodeStream.on('error', reject)
      })
      bodyBuffer = Buffer.concat(chunks)
    } else {
      // Stream binary directly into buffer
      const chunks: Buffer[] = []
      await new Promise<void>((resolve, reject) => {
        nodeStream.on('data', (chunk: Buffer) => chunks.push(chunk))
        nodeStream.on('end', resolve)
        nodeStream.on('error', reject)
      })
      bodyBuffer = Buffer.concat(chunks)
    }

    // Upload to S3
    const s3 = getS3Client()
    await s3.send(new PutObjectCommand({
      Bucket:      S3_BUCKET,
      Key:         key,
      Body:        bodyBuffer,
      ContentType: mimeType,
      ContentLength: bodyBuffer.length,
    }))

    const publicUrl = s3Url(key)
    const origSize  = Number(req.headers.get('x-file-size') ?? 0)

    console.log(`[upload] ${rawName} → s3://${S3_BUCKET}/${key} (${(bodyBuffer.length/1024).toFixed(0)}KB${isImage && origSize ? `, was ${(origSize/1024).toFixed(0)}KB` : ''})`)

    return NextResponse.json({
      url:          publicUrl,
      key,
      name:         rawName,
      size:         bodyBuffer.length,
      originalSize: origSize,
      compressed:   isImage && origSize > bodyBuffer.length,
    })
  } catch (err: any) {
    console.error('[upload]', err.message)
    // If S3 not configured, fall back to local disk
    if (err.message?.includes('AWS_ACCESS_KEY_ID') || err.message?.includes('S3_BUCKET') || !process.env.AWS_ACCESS_KEY_ID) {
      return localFallback(req)
    }
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}

// ── Local disk fallback for dev without S3 configured ─────────────────────────
async function localFallback(req: NextRequest): Promise<NextResponse> {
  const { writeFile, mkdir } = await import('fs/promises')
  const path_  = await import('path')
  const rawName = decodeURIComponent(req.headers.get('x-file-name') ?? 'file')
  const ext     = path_.default.extname(rawName).toLowerCase()
  const isImage = IMAGE_EXTS.has(ext)

  if (!req.body) return NextResponse.json({ error: 'No body' }, { status: 400 })

  const nodeStream = Readable.fromWeb(req.body as any)
  const chunks: Buffer[] = []
  await new Promise<void>((resolve, reject) => {
    nodeStream.on('data', (c: Buffer) => chunks.push(c))
    nodeStream.on('end', resolve)
    nodeStream.on('error', reject)
  })
  let buffer = Buffer.concat(chunks)

  let outExt = ext
  if (isImage) {
    try {
      const sharp = (await import('sharp')).default
      buffer = await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer()
      outExt = '.webp'
    } catch { /* sharp not available, use original */ }
  }

  const safeName  = `${Date.now()}-${Math.random().toString(36).slice(2)}${outExt}`
  const uploadDir = path_.default.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path_.default.join(uploadDir, safeName), buffer)

  console.log(`[upload:local] ${rawName} → /uploads/${safeName} (no S3 configured)`)
  return NextResponse.json({ url: `/uploads/${safeName}`, name: rawName, size: buffer.length })
}
