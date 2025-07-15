import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    // Remove Replit-specific plugins for production build
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
