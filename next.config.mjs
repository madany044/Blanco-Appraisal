/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep local correction checks separate from any existing dev server output.
  distDir: process.env.APPRAISAL_ISOLATED_OUTPUT === "build" ? ".local-correction-test/next-build"
    : process.env.APPRAISAL_ISOLATED_OUTPUT === "dev" ? ".local-correction-test/next-dev" : ".next",
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      encoding: false,
    };
    return config;
  },
};

export default nextConfig;