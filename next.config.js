/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  // API routes configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

module.exports = nextConfig
