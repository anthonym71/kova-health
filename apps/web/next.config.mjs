/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@kova/domain", "@kova/design-tokens", "@kova/api-client"],
  reactStrictMode: true,
  async headers() {
    // Private patient pages must never enter a shared cache (MVP-PLAN: Architecture).
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};
export default nextConfig;
