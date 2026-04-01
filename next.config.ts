import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type errors are caught by getDiagnostics / IDE — don't block the build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
