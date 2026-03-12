/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export - Vercel handles Next.js natively
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
