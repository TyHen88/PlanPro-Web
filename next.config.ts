import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [
      'planpro-dev.up.railway.app',
      'planpro.up.railway.app',
      'localhost',
      // Google OAuth profile images
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      // GitHub OAuth profile images (for future use)
      'avatars.githubusercontent.com',
      // Microsoft OAuth profile images (for future use)
      'graph.microsoft.com',
    ],
  },
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // External packages for server components
  serverExternalPackages: [],
};

export default nextConfig;
