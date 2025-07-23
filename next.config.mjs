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
    ],
  },
};

export default nextConfig;
