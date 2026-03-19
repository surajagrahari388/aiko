import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s.gravatar.com",
      },

      {
        protocol: "https",
        hostname: "images.entitysport.com",
      },
      {
        protocol: "https",
        hostname: "gcdnimages.entitysport.com",
      },
           {
        protocol: "https",
        hostname: "media.licdn.com",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
    incomingRequests: true,
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/cricket",
        permanent: true,
      },
    ];
  },
  output: "standalone",
  transpilePackages: ["shiki"],
  /* config options here */
};

export default nextConfig;
