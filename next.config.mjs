/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    appIsrStatus: true,
    devLoading: true,
  },
  headers: [
    {
      key: "Access-Control-Allow-Origin",
      value: "*",
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.collabute.com",
      },
      {
        protocol: "https",
        hostname: "clear-rhinoceros-559.convex.site",
      },
      {
        protocol: "https",
        hostname: "clear-rhinoceros-559.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
