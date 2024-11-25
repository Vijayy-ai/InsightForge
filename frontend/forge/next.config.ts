import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable production optimizations
  reactStrictMode: true,
  swcMinify: true,

  // API rewrites with environment-aware configuration
  async rewrites() {
    // In development, use localhost
    // In production, use the deployed API URL (to be updated after backend deployment)
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://insightforge-api.onrender.com/api/:path*'  // Update this after backend deployment
          : 'http://localhost:8000/api/:path*',
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
          // Allow all origins in development, and Vercel's default URL in production
          { 
            key: 'Access-Control-Allow-Origin', 
            value: process.env.NODE_ENV === 'production' 
              ? '*'  // Temporarily allow all origins until domain is set up
              : '*'
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  // Output configuration
  output: 'standalone',
};

export default nextConfig;