/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable production optimizations
    reactStrictMode: true,
    swcMinify: true,
  
    // API rewrites
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: process.env.NODE_ENV === 'production'
            ? 'https://your-backend-url.com/api/:path*'
            : 'http://localhost:8000/api/:path*',
        },
      ];
    },
  
    // Webpack configuration
    webpack: (config) => {
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
      return config;
    }
  };
  
  module.exports = nextConfig;