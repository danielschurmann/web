import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/novedades/:slug.md",
        destination: "/api/public/novedades/:slug/md",
      },
      {
        source: "/docs/agent-api.md",
        destination: "/api/public/docs/agent-api",
      },
    ];
  },
};

export default nextConfig;
