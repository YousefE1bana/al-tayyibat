import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { brand } from "./src/config/brand";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = process.env.VITE_BASE_PATH || "/al-tayyibat/";

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  base,
  plugins: [react(), tailwindcss(), {
    name: "approved-brand-icon",
    transformIndexHtml: (html) => html.replace("%BRAND_ICON%", `${base}${brand.icon.src.slice(1)}`),
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
