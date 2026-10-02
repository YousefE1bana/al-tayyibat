import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { brand } from "./src/config/brand";
import { VitePWA } from "vite-plugin-pwa";
import { pwa } from "./src/config/pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = process.env.VITE_BASE_PATH || "/al-tayyibat/";

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  base,
  plugins: [react(), tailwindcss(), VitePWA({
    strategies: "injectManifest",
    srcDir: "src/pwa",
    filename: "sw.ts",
    injectRegister: false,
    registerType: "prompt",
    manifest: {
      id: base, name: pwa.name, short_name: pwa.shortName, description: pwa.description,
      start_url: `${base}#/`, scope: base, display: "standalone", lang: "ar", dir: "rtl",
      theme_color: pwa.themeColor, background_color: pwa.themeColor,
      icons: pwa.icons.map(icon => ({ ...icon, src: `${base}${icon.src}` })),
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,woff2}", "brand/*.png", "images/doctor/*.{jpg,webp}", "data/*.json", "ai/*.json", "llms.txt"],
      maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
    },
  }), {
    name: "approved-brand-icon",
    transformIndexHtml: (html) => html.replace("%BRAND_ICON%", `${base}${brand.icon.src.slice(1)}`).replace("%APPLE_ICON%", `${base}${pwa.appleIcon}`),
  }],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["framer-motion"],
          search: ["fuse.js"],
          react: ["react", "react-dom", "react-dom/client", "react-router-dom"],
          catalog: ["./src/data/foods.ts"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    watch: {
      ignored: ["**/public/images/**", "**/.git/**", "**/node_modules/**"],
    },
  },
});
