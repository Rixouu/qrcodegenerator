/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['vercel.com', 'nextjs.org'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Disable experimental features that might cause issues
    turbo: false,
  }
};

export default nextConfig; 