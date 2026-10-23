import type { NextConfig } from 'next';

const apiProxyUrl = process.env.API_PROXY_URL;

const securityHeaders = [
  // Prevent the app from being embedded in iframes (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Only send the origin as referer (no full URL path to third parties)
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser feature access; none are needed by this app
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Force HTTPS for 1 year (set only when COOKIE_SECURE=true i.e. production)
  ...(process.env.COOKIE_SECURE === 'true'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    if (!apiProxyUrl) {
      return [];
    }

    return [{ source: '/graphql', destination: apiProxyUrl }];
  },
};

export default nextConfig;
