import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the frontend to reach the backend via NEXT_PUBLIC_API_URL
  // No rewrites needed — the frontend calls the backend directly.
};

export default nextConfig;
