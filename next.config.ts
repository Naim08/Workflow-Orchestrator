import { NextConfig } from "next/dist/types";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Add this webpack configuration
  webpack: (config, { isServer }) => {
    // If we're building for the browser (not server)
    if (!isServer) {
      // Replace Node.js modules with empty objects
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        // Add any other Node.js built-ins that are causing issues
      };
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;