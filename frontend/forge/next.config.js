/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
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
    },

    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      ignoreBuildErrors: true,
    }
  };
  
  module.exports = nextConfig;