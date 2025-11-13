/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['next-auth', '@auth/core'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: lh3.googleusercontent.com; font-src 'self' fonts.gstatic.com; object-src 'none'; frame-ancestors 'none';",
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
