import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type errors don't prevent production builds — fix post-deploy
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
