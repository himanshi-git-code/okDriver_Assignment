/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Proxy all /api/* calls to smart.okdriver.in backend
      // This avoids CORS issues when calling from browser
      {
        source: '/proxy/:path*',
        destination: 'https://smart.okdriver.in/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/proxy/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
