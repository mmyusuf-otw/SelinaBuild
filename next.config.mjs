
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone sangat krusial untuk deployment Docker
  output: 'standalone',
  // Konfigurasi lainnya...
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
