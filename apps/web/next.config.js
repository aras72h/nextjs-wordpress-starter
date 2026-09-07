/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@starter/ui'],
  output: 'standalone',
};

module.exports = nextConfig;
