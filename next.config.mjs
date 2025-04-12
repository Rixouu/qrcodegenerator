/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['vercel.com', 'nextjs.org'],
    formats: ['image/avif', 'image/webp'],
  }
};

export default nextConfig; 