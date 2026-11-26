/** @type {import('next').NextConfig} */

// La API puede vivir en otro origen según el entorno:
//  - local y E2E: http://localhost:3333 (mock API)
//  - producción: https://listacompra.laurafernandezenfermeria.com
// La CSP debe permitir el origen de NEXT_PUBLIC_API_URL; si se fija solo el
// dominio de producción, el navegador bloquea las llamadas a la API en dev/E2E
// (los E2E fallaban todos en crear lista / registrar por esto).
let apiOrigin = '';
try {
  if (process.env.NEXT_PUBLIC_API_URL) {
    apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
  }
} catch {
  apiOrigin = '';
}

const connectSrc = ["'self'", 'https://listacompra.laurafernandezenfermeria.com', apiOrigin]
  .filter(Boolean)
  .filter((value, index, array) => array.indexOf(value) === index)
  .join(' ');

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
              `default-src 'self'; connect-src ${connectSrc}; script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: lh3.googleusercontent.com; font-src 'self' fonts.gstatic.com; object-src 'none'; frame-ancestors 'none';`,
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
