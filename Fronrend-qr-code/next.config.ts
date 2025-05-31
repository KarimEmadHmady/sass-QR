// next.config.js أو next.config.ts لو TS
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>[^.]+).localhost:3000',
            },
          ],
          destination: '/restaurant/:subdomain/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
