/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: { serverActions: { bodySizeLimit: '1mb' } }
};
export default nextConfig;
