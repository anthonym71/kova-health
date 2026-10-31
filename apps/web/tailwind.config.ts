import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          base: "#FAF6F0",
          raised: "#FFFFFF",
          sunken: "#F1EAE0",
          overlay: "#FFFDF9",
        },
        ink: {
          strong: "#17222E",
          body: "#33404F",
          muted: "#64707E",
          faint: "#97A1AD",
        },
        brand: {
          teal: "#0E7C6B",
          tealdark: "#0A5F53",
          tealsoft: "#DCEDEA",
          blue: "#3D6FD8",
          bluesoft: "#E2EAF9",
          lilac: "#7E73C8",
          lilacsoft: "#E9E6F7",
        },
        status: {
          ok: "#1E7F4F",
          oksoft: "#DFF0E5",
          warn: "#9A6A12",
          warnsoft: "#F7EBD3",
          danger: "#B3261E",
          dangersoft: "#F9DEDC",
        },
      },
      borderRadius: { card: "16px" },
    },
  },
  plugins: [],
};
export default config;
