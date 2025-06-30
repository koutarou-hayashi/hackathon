import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // For Docker deployment
  eslint: {
    // Ignore ESLint errors during build (for Docker)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build (for Docker)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
