import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3, S3_BUCKET, S3_BASE_URL } from '@/lib/s3'
import crypto from 'crypto'
import path from 'path'

const ALLOWED_TYPES: Record<string, string> = {
  // Images
  'image/jpeg':      'jpg',
  'image/jpg':       'jpg',
  'image/png':       'png',
  'image/webp':      'webp',
  'image/gif':       'gif',
  // Presentations
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-powerpoint':                                             'ppt',
  'application/pdf':                                                           'pdf',
  'application/zip':                                                           'zip',
  'application/x-zip-compressed':                                              'zip',
  // Keynote
  'application/x-iwork-keynote-sffkey': 'key',
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { fileName, fileType, fileSize, folder = 'uploads' } = await req.json()

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType required' }, { status: 400 })
    }

    // Validate type
    const ext = ALLOWED_TYPES[fileType] || path.extname(fileName).replace('.','').toLowerCase()
    if (!ext) return NextResponse.json({ error: `File type "${fileType}" not allowed` }, { status: 400 })

    // Generate unique S3 key
    const id  = crypto.randomBytes(16).toString('hex')
    const key = `${folder}/${id}.${ext}`

    // Generate presigned PUT URL — valid for 30 minutes
    const command = new PutObjectCommand({
      Bucket:      S3_BUCKET,
      Key:         key,
      ContentType: fileType,
      ...(fileSize ? { ContentLength: fileSize } : {}),
    })

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 30 * 60 })
    const publicUrl    = `${S3_BASE_URL}/${key}`

    return NextResponse.json({ presignedUrl, publicUrl, key })
  } catch (err: any) {
    console.error('[presign]', err.message)
    return NextResponse.json({ error: err.message || 'Failed to generate upload URL' }, { status: 500 })
  }
}
