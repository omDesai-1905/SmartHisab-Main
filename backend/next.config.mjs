/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API routes only - no page rendering
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
