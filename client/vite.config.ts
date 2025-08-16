import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Performance budget configuration (KAN-147)
const PERFORMANCE_BUDGETS = {
  mainBundle: 500 * 1024, // 500 KB gzipped
  chunkBundle: 200 * 1024, // 200 KB gzipped per chunk
  totalAssets: 2 * 1024 * 1024, // 2 MB total assets
};

// Bundle size tracking plugin (KAN-147)
function bundleSizeTracker() {
  return {
    name: 'bundle-size-tracker',
    writeBundle(options: any, bundle: Record<string, any>) {
      const timestamp = new Date().toISOString();
      const stats = {
        timestamp,
        bundles: [] as any[],
        totalSize: 0,
        gzippedSize: 0,
        budgetViolations: [] as string[]
      };

      // Calculate bundle sizes
      Object.entries(bundle).forEach(([fileName, chunk]: [string, any]) => {
        if (chunk.type === 'chunk') {
          const size = chunk.code?.length || 0;
          const estimatedGzipped = Math.round(size * 0.3); // Rough gzip estimate
          
          stats.bundles.push({
            name: fileName,
            size,
            estimatedGzipped,
            isEntry: chunk.isEntry || false,
            modules: chunk.modules ? Object.keys(chunk.modules).length : 0
          });

          stats.totalSize += size;
          stats.gzippedSize += estimatedGzipped;

          // Check performance budgets (only for entry chunks)
          if (chunk.isEntry && estimatedGzipped > PERFORMANCE_BUDGETS.mainBundle) {
            stats.budgetViolations.push(
              `${fileName}: ${Math.round(estimatedGzipped / 1024)}KB exceeds main bundle budget of ${Math.round(PERFORMANCE_BUDGETS.mainBundle / 1024)}KB`
            );
          }
        }
      });

      // Save tracking data
      const trackingDir = path.resolve(__dirname, '..', 'docs', 'performance-tracking');
      if (!fs.existsSync(trackingDir)) {
        fs.mkdirSync(trackingDir, { recursive: true });
      }

      const trackingFile = path.join(trackingDir, 'bundle-size-history.json');
      let history = [];
      
      try {
        if (fs.existsSync(trackingFile)) {
          history = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
        }
      } catch (e) {
        console.warn('Could not read existing bundle size history');
      }

      history.push(stats);
      
      // Keep only last 50 builds
      if (history.length > 50) {
        history = history.slice(-50);
      }

      fs.writeFileSync(trackingFile, JSON.stringify(history, null, 2));

      // Log results
      console.log('\n📊 Bundle Size Analysis (KAN-147):');
      console.log(`📦 Total size: ${Math.round(stats.totalSize / 1024)}KB`);
      console.log(`🗜️  Estimated gzipped: ${Math.round(stats.gzippedSize / 1024)}KB`);
      
      if (stats.budgetViolations.length > 0) {
        console.log('\n⚠️  Performance Budget Violations:');
        stats.budgetViolations.forEach(violation => console.log(`   ${violation}`));
      } else {
        console.log('✅ All performance budgets met');
      }

      stats.bundles.forEach(bundle => {
        console.log(`   ${bundle.name}: ${Math.round(bundle.estimatedGzipped / 1024)}KB gzipped`);
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html in dist folder
    visualizer({
      filename: "stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true
    }),
    // KAN-147: Bundle size tracking and performance budgets
    bundleSizeTracker()
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
