import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable production optimizations
  reactStrictMode: true,
  swcMinify: true,

  // API rewrites with environment-aware configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/:path*',
      },
    ];
  },

  // External dependencies
  webpack: (config) => {
    config.externals = [...config.externals || [], 'canvas', 'jsdom'];
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Origin', 
            value: '*'  // Allow all origins during development
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },

  // Output configuration
  output: 'standalone',
};

export default nextConfig;