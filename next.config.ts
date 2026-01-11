import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "filen.io",
      },
      {
        protocol: "https",
        hostname: "*.filen.io",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Behold Supabase domain for eksisterende bilder (hvis noen)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
