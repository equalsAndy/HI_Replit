#!/usr/bin/env node

/**
 * Bundle Size Performance Monitor (KAN-147)
 * Tracks bundle sizes and enforces performance budgets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance budgets (KAN-147)
const PERFORMANCE_BUDGETS = {
  mainBundleGzipped: 500 * 1024, // 500 KB gzipped
  totalAssetsGzipped: 1000 * 1024, // 1 MB total gzipped
  warningThreshold: 0.9, // Warn at 90% of budget
};

function formatBytes(bytes) {
  return Math.round(bytes / 1024);
}

function checkBundleSize() {
  const distPath = path.join(__dirname, '..', 'dist', 'public', 'assets');
  const trackingDir = path.join(__dirname, '..', 'docs', 'performance-tracking');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ No build artifacts found. Run npm run build first.');
    process.exit(1);
  }

  // Ensure tracking directory exists
  if (!fs.existsSync(trackingDir)) {
    fs.mkdirSync(trackingDir, { recursive: true });
    console.log('📁 Created performance tracking directory');
  }

  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  let totalSize = 0;
  let mainBundleSize = 0;
  const bundleInfo = [];

  // Analyze JavaScript bundles
  jsFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    const estimatedGzipped = Math.round(size * 0.3); // Rough gzip estimate
    
    bundleInfo.push({
      name: file,
      type: 'js',
      size,
      estimatedGzipped,
      isMain: file.includes('index-') && !file.includes('html2canvas')
    });

    totalSize += estimatedGzipped;
    if (file.includes('index-') && !file.includes('html2canvas')) {
      mainBundleSize = estimatedGzipped;
    }
  });

  // Analyze CSS bundles
  cssFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    const estimatedGzipped = Math.round(size * 0.25); // CSS compresses better
    
    bundleInfo.push({
      name: file,
      type: 'css',
      size,
      estimatedGzipped,
      isMain: false
    });

    totalSize += estimatedGzipped;
  });

  // Performance analysis
  const timestamp = new Date().toISOString();
  const analysis = {
    timestamp,
    mainBundleSize,
    totalSize,
    bundles: bundleInfo,
    budgetStatus: {
      mainBundleStatus: mainBundleSize <= PERFORMANCE_BUDGETS.mainBundleGzipped ? 'PASS' : 'FAIL',
      totalSizeStatus: totalSize <= PERFORMANCE_BUDGETS.totalAssetsGzipped ? 'PASS' : 'FAIL',
      warnings: []
    }
  };

  // Check for warnings
  if (mainBundleSize > PERFORMANCE_BUDGETS.mainBundleGzipped * PERFORMANCE_BUDGETS.warningThreshold) {
    analysis.budgetStatus.warnings.push(
      `Main bundle approaching size limit: ${formatBytes(mainBundleSize)}KB / ${formatBytes(PERFORMANCE_BUDGETS.mainBundleGzipped)}KB`
    );
  }

  if (totalSize > PERFORMANCE_BUDGETS.totalAssetsGzipped * PERFORMANCE_BUDGETS.warningThreshold) {
    analysis.budgetStatus.warnings.push(
      `Total assets approaching size limit: ${formatBytes(totalSize)}KB / ${formatBytes(PERFORMANCE_BUDGETS.totalAssetsGzipped)}KB`
    );
  }

  // Save to tracking history
  const historyFile = path.join(trackingDir, 'bundle-size-history.json');
  let history = [];
  
  try {
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }
  } catch (e) {
    console.warn('⚠️  Could not read existing bundle size history');
  }

  history.push(analysis);
  
  // Keep only last 50 builds
  if (history.length > 50) {
    history = history.slice(-50);
  }

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  // Console output
  console.log('\n📊 Bundle Size Analysis (KAN-147):');
  console.log('═'.repeat(50));
  console.log(`📦 Main bundle: ${formatBytes(mainBundleSize)}KB gzipped`);
  console.log(`📦 Total assets: ${formatBytes(totalSize)}KB gzipped`);
  console.log(`🎯 Budget status: Main=${analysis.budgetStatus.mainBundleStatus}, Total=${analysis.budgetStatus.totalSizeStatus}`);
  
  if (analysis.budgetStatus.warnings.length > 0) {
    console.log('\n⚠️  Performance Warnings:');
    analysis.budgetStatus.warnings.forEach(warning => {
      console.log(`   ${warning}`);
    });
  }

  console.log('\n📋 Bundle Details:');
  bundleInfo.forEach(bundle => {
    const icon = bundle.type === 'js' ? '📜' : '🎨';
    const mainLabel = bundle.isMain ? ' (MAIN)' : '';
    console.log(`   ${icon} ${bundle.name}${mainLabel}: ${formatBytes(bundle.estimatedGzipped)}KB gzipped`);
  });

  // Check for failures
  if (analysis.budgetStatus.mainBundleStatus === 'FAIL' || analysis.budgetStatus.totalSizeStatus === 'FAIL') {
    console.log('\n❌ Performance Budget Exceeded!');
    console.log('   Consider implementing code splitting to reduce bundle sizes.');
    console.log('   See KAN-147 implementation report for guidance.');
    process.exit(1);
  } else {
    console.log('\n✅ All performance budgets met');
  }

  console.log('\n📁 Tracking data saved to:', historyFile);
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  checkBundleSize();
}

export { checkBundleSize };