import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  // Pin the Turbopack root to this project. Without it Next walks up looking for a lockfile and can pick a
  // stray package-lock.json in a parent folder (e.g. the home directory on Windows) and warn about it.
  turbopack: { root: path.resolve(process.cwd()) },
  async redirects() {
    return [
      { source: "/work", destination: "/projects", permanent: true },
      { source: "/work/:slug", destination: "/projects/:slug", permanent: true },
    ];
  },
};

export default config;
