import type { NextConfig } from 'next';

const apiProxyUrl = process.env.API_PROXY_URL;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    if (!apiProxyUrl) {
      return [];
    }

    return [{ source: '/graphql', destination: apiProxyUrl }];
  },
};

export default nextConfig;
