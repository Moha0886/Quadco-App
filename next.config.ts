import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railway configuration
  output: 'standalone',
  
  // Environment configuration
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },

  // Server configuration for Railway
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

export default nextConfig;
