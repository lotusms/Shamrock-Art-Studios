/** @type {import('next').NextConfig} */
const nextConfig = {
  // External / network volumes often break native file watchers; polling keeps HMR reliable.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  images: {
    unoptimized: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self';",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.metmuseum.org",
        port: "",
        pathname: "/CRDImages/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
