import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    return [
      { source: "/work", destination: "/projects", permanent: true },
      { source: "/work/:slug", destination: "/projects/:slug", permanent: true },
    ];
  },
};

export default config;
