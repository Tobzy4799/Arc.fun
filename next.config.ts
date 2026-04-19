import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        // This ensures your custom gateway from .env.local is allowed
        hostname: process.env.NEXT_PUBLIC_GATEWAY_URL || '', 
      },
    ],
  },
};

export default nextConfig;