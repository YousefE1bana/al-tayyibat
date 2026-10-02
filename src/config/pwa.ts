/** Static, local-only PWA configuration shared by the build and worker. */
export const pwa = {
  name: "نظام الطيبات — الدليل التفاعلي",
  shortName: "الطيبات",
  description: "دليل معلوماتي عربي لقواعد نظام الطيبات والأطعمة، وليس نصيحة طبية شخصية.",
  themeColor: "#0e1310",
  icons: [
    { src: "brand/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "brand/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "brand/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
  appleIcon: "brand/apple-touch-icon.png",
  foodCache: { name: "al-tayyibat-food-images", maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
} as const;
