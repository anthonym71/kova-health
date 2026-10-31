/**
 * Kova design tokens - shared by web (Tailwind) and native (Expo).
 * Warm off-white surfaces, deep ink typography, teal primary,
 * restrained blue/lilac accents. See docs/BUILD-PROMPT.md (Product and design).
 */
export const colors = {
  surface: {
    base: "#FAF6F0", // warm off-white app background
    raised: "#FFFFFF",
    sunken: "#F1EAE0",
    overlay: "#FFFDF9",
  },
  ink: {
    strong: "#17222E",
    body: "#33404F",
    muted: "#64707E",
    faint: "#97A1AD",
    inverse: "#FBFAF7",
  },
  brand: {
    teal: "#0E7C6B",
    tealDark: "#0A5F53",
    tealSoft: "#DCEDEA",
    blue: "#3D6FD8",
    blueSoft: "#E2EAF9",
    lilac: "#7E73C8",
    lilacSoft: "#E9E6F7",
  },
  status: {
    ok: "#1E7F4F",
    okSoft: "#DFF0E5",
    warn: "#9A6A12",
    warnSoft: "#F7EBD3",
    danger: "#B3261E",
    dangerSoft: "#F9DEDC",
    info: "#3D6FD8",
    infoSoft: "#E2EAF9",
  },
} as const;

export const spacing = {
  pagePadding: 24,
  cardPadding: 20,
  cardRadius: 16,
  cardGap: 16,
  touchTargetMin: 44,
} as const;

export const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  scale: {
    display: { size: 28, weight: 700 },
    title: { size: 20, weight: 600 },
    section: { size: 16, weight: 600 },
    body: { size: 15, weight: 400 },
    caption: { size: 13, weight: 400 },
  },
} as const;

export type KovaColors = typeof colors;
