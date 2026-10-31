/** @type {import('next').NextConfig} */
// Static export for plain file hosting (no Node.js needed):
//   KOVA_STATIC_EXPORT=1 npx next build        -> apps/web/out served at the site root
//   KOVA_BASE_PATH=/kova KOVA_STATIC_EXPORT=1  -> same, but served under /kova/
const staticExport = process.env.KOVA_STATIC_EXPORT === "1";
const basePath = process.env.KOVA_BASE_PATH || "";
const nextConfig = {
  transpilePackages: ["@kova/domain", "@kova/design-tokens", "@kova/api-client"],
  reactStrictMode: true,
  ...(staticExport
    ? { output: "export", trailingSlash: true, ...(basePath ? { basePath } : {}) }
    : {
        async headers() {
          // Private patient pages must never enter a shared cache (MVP-PLAN: Architecture).
          return [
            {
              source: "/((?!_next/static|_next/image|favicon.ico).*)",
              headers: [{ key: "Cache-Control", value: "private, no-store" }],
            },
          ];
        },
      }),
};
export default nextConfig;
