/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Ensure API routes use Node.js runtime
  experimental: {
    runtime: "nodejs",
  },
};

module.exports = nextConfig;
