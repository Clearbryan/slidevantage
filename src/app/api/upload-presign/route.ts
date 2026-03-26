/**
 * Step 1 of S3 upload: get a presigned PUT URL + the final public URL
 * Client uploads directly to S3 using the presigned URL — server never touches the file bytes
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getS3Client, S3_BUCKET, s3Url } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import path from 'path'
import crypto from 'crypto'

// MIME types we allow
const ALLOWED: Record<string, string> = {
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

    const { fileName, contentType, folder = 'uploads' } = await req.json()
    if (!fileName) return NextResponse.json({ error: 'fileName required' }, { status: 400 })

    const ext = path.extname(fileName).toLowerCase()
    const mime = ALLOWED[ext]
    if (!mime) return NextResponse.json({ error: `File type ${ext} not allowed` }, { status: 400 })

    const key = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`

    const s3 = getS3Client()
    const cmd = new PutObjectCommand({
      Bucket:      S3_BUCKET,
      Key:         key,
      ContentType: contentType || mime,
    })

    // Presigned URL valid for 1 hour
    const presignedUrl = await getSignedUrl(s3, cmd, { expiresIn: 3600 })
    const publicUrl    = s3Url(key)

    return NextResponse.json({ presignedUrl, publicUrl, key })
  } catch (err: any) {
    console.error('[upload-presign]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
