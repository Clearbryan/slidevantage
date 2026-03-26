import { S3Client } from '@aws-sdk/client-s3';

let _client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (_client) return _client;
  const region = process.env.S3_REGION || 'us-east-1';
  const endpoint = process.env.S3_ENDPOINT; // for R2/MinIO — omit for S3
  if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY)
    throw new Error('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set');

  _client = new S3Client({
    region,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  return _client;
}

export const S3_BUCKET = process.env.S3_BUCKET ?? '';

export function s3Url(key: string): string {
  const base = (process.env.S3_PUBLIC_URL || '').replace(/\/$/, '');
  if (base) return `${base}/${key}`;
  return `https://${S3_BUCKET}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}
