/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
  },
  headers: async () => ([
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'browsing-topics=()' },
      ],
    },
  ]),
}
module.exports = nextConfig
