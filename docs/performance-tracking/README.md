# Performance Monitoring Dashboard (KAN-147)

## Overview
This directory contains automated performance tracking for the AST/IA workshop platform bundle sizes and performance budgets.

## Current Performance Status

### Performance Budgets
- **Main Bundle**: 500 KB gzipped (currently **FAILING** at 639 KB)
- **Total Assets**: 1000 KB gzipped (currently **PASSING** at 693 KB)
- **Warning Threshold**: 90% of budget

### Current Bundle Analysis
- **Main Bundle**: `index-B4JNcQuY.js` = 2.18 MB raw (639 KB gzipped) ❌
- **CSS Bundle**: `index-VNkjiNbx.css` = 159 KB raw (39 KB gzipped) ✅
- **Additional JS**: `html2canvas-Ci2ETXQl.js` = 408 B raw (122 B gzipped) ✅
- **Total Size**: 693 KB gzipped ⚠️ (69% of total budget)

## Monitoring Commands

### Check Current Bundle Size
```bash
npm run bundle:analyze
```
Analyzes existing build artifacts without rebuilding.

### Full Build + Analysis
```bash
npm run bundle:check
```
Rebuilds the application and analyzes bundle sizes.

### Build with Automatic Analysis
```bash
npm run build
```
Normal build process now includes automatic bundle size analysis.

## Performance Tracking

### History File
All bundle size measurements are stored in:
- **File**: `bundle-size-history.json`
- **Retention**: Last 50 builds
- **Format**: JSON with timestamps, sizes, and budget status

### Data Structure
```json
{
  "timestamp": "2025-08-16T16:31:07.730Z",
  "mainBundleSize": 653925,
  "totalSize": 693856,
  "bundles": [...],
  "budgetStatus": {
    "mainBundleStatus": "FAIL",
    "totalSizeStatus": "PASS",
    "warnings": [...]
  }
}
```

## Performance Budget Violations

### Current Status: ❌ FAILING
The main bundle currently exceeds the 500 KB performance budget by **27%** (139 KB over limit).

### Impact
- **User Experience**: Slower initial page load
- **Mobile Performance**: Significant impact on 3G networks
- **Core Web Vitals**: Affects Largest Contentful Paint (LCP)

### Recommendations
1. **Immediate**: Implement code splitting (see KAN-147 implementation report)
2. **Short-term**: Remove unused dependencies
3. **Long-term**: Lazy load non-critical components

## Code Splitting Potential

Based on KAN-147 experiments, code splitting can achieve:
- **72% bundle reduction** (639 KB → 165 KB gzipped)
- **Separate workshop chunks**: AllStar Teams, Imaginal Agility, Admin
- **On-demand loading**: Only load workshop code when accessed

## Monitoring Integration

### CI/CD Integration
To add performance monitoring to CI/CD:
```bash
# Add to deployment pipeline
npm run build
if [ $? -eq 1 ]; then
  echo "Performance budget exceeded - deployment blocked"
  exit 1
fi
```

### Development Workflow
1. **Before PR**: Run `npm run bundle:check`
2. **Monitor trends**: Check `bundle-size-history.json` for size increases
3. **Budget violations**: Address immediately before merging

## Performance Budget Philosophy

### Why 500 KB?
- **Mobile First**: 3G networks can load 500 KB in ~3 seconds
- **Best Practice**: Google recommends <500 KB for initial bundle
- **User Experience**: Keeps Time to Interactive under 5 seconds

### Budget Adjustments
If budgets need adjustment, update `scripts/bundle-size-check.js`:
```javascript
const PERFORMANCE_BUDGETS = {
  mainBundleGzipped: 500 * 1024, // Adjust this value
  totalAssetsGzipped: 1000 * 1024, // And this value
  warningThreshold: 0.9, // Warning at 90%
};
```

## Optimization Strategies

### Priority 1: Code Splitting
- Implement React.lazy() for workshop components
- See KAN-147 implementation report for detailed guidance
- **Potential savings**: 72% bundle reduction

### Priority 2: Dependency Audit
- Remove unused npm packages
- Replace large libraries with smaller alternatives
- Use tree-shaking compatible imports

### Priority 3: Asset Optimization
- Compress images and static assets
- Implement dynamic imports for heavy components
- Lazy load below-the-fold content

## Next Steps

1. **Review KAN-147 implementation report** for code splitting approach
2. **Audit dependencies** for unused packages
3. **Implement incremental code splitting** starting with least critical features
4. **Monitor performance trends** with each deployment

## Performance History Analysis

The `bundle-size-history.json` file tracks trends over time:
- **Size increases**: Identify commits that add significant weight
- **Optimization impact**: Measure effect of performance improvements
- **Budget compliance**: Track how often budgets are exceeded

For analysis scripts and additional tooling, see the implementation in `scripts/bundle-size-check.js`.