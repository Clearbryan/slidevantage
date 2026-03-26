import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'bcryptjs', 'sharp', '@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',   // for server actions only; upload route streams so this doesn't apply
    },
  },
}

export default nextConfig
