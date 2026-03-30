/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev tooling is mounted once at the App Router root (wraps every route: /, /shop,
  // /login, /dashboard, etc.). It is not part of the dashboard layout — so any stuck
  // dev overlay affects the whole site. `devIndicators: false` hides the on-canvas
  // indicator (Next 16 docs); restart `next dev` after changing this.
  devIndicators: false,
  // Keep Turbopack explicit for Next.js 16+ build compatibility on Vercel.
  turbopack: {},
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
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
    ],
  },
};

export default nextConfig;
