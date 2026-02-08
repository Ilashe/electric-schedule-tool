/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
}

module.exports = nextConfig
