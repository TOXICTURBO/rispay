const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
  buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Output configuration for Render
  output: 'standalone',
  // WebSocket configuration
  // Note: Custom server (server.js) handles WebSocket connections
  // For Render, ensure WebSocket is enabled in service settings
};

module.exports = withPWA(nextConfig);
