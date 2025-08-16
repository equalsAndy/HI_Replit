import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html in dist folder
    visualizer({
      filename: "stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),  // Changed from "client/src" to "src"
      "@shared": path.resolve(__dirname, "..", "shared"),  // Go up one directory
      "@assets": path.resolve(__dirname, "..", "attached_assets"),  // Go up one directory
    },
  },
  build: {
    outDir: path.resolve(__dirname, "..", "dist", "public"),  // Output to parent dist/public
    emptyOutDir: true,
  },
});
