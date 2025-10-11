import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    visualizer({
      filename: 'dist/stats.html',
      template: 'treemap',
      gzipSize: true,
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  // HMR optimization from Auth0 setup pack
  server: {
    host: "localhost",
    port: 8080,
    strictPort: true,
    hmr: { 
      host: "localhost", 
      port: 24679, 
      clientPort: 24679 
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@img": path.resolve(__dirname, "client", "src", "assets"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Split hls.js and any @ffmpeg/* modules into separate chunks when present
        manualChunks(id) {
          if (id.includes('node_modules/hls.js')) return 'hls';
          if (id.includes('node_modules/@ffmpeg/')) return 'ffmpeg';
        },
      },
    },
  },
});
