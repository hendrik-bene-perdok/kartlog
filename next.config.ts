import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Turbopack is enabled by default in Next.js 16
  // Empty config acknowledges we're using it alongside PWA webpack config
  turbopack: {},
};

export default withPWA(nextConfig);
