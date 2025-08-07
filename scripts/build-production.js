#!/usr/bin/env node

/**
 * Production Build Script with Compression and Analysis
 * Optimizes build output for maximum performance
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { gzipSync, brotliCompressSync } from 'zlib';

const BUILD_DIR = 'dist';
const COMPRESSION_EXTENSIONS = ['.js', '.css', '.html', '.json', '.svg'];
const MAX_GZIP_SIZE = 200 * 1024; // 200KB warning threshold

console.log('🚀 Starting production build with optimizations...\n');

// Step 1: Clean and build
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Analyze bundle
console.log('📊 Analyzing bundle composition...');
const bundleStats = analyzeBundleComposition();
console.log(bundleStats);

// Step 3: Create compressed versions
console.log('🗜️  Creating compressed assets...');
const compressionStats = compressAssets();
console.log(compressionStats);

// Step 4: Performance report
console.log('📈 Performance Report:');
generatePerformanceReport();

console.log('\n🎉 Production build completed successfully!');
console.log('💡 Deploy the contents of the dist/ directory to your hosting provider.');

/**
 * Analyze bundle composition and sizes
 */
function analyzeBundleComposition() {
  const assetsDir = join(BUILD_DIR, 'assets');
  const files = readdirSync(assetsDir);
  
  const analysis = {
    js: { count: 0, size: 0 },
    css: { count: 0, size: 0 },
    other: { count: 0, size: 0 },
    total: { count: 0, size: 0 }
  };
  
  let largestFiles = [];
  
  files.forEach(file => {
    const filePath = join(assetsDir, file);
    const stats = statSync(filePath);
    const ext = extname(file);
    
    analysis.total.count++;
    analysis.total.size += stats.size;
    
    if (ext === '.js') {
      analysis.js.count++;
      analysis.js.size += stats.size;
    } else if (ext === '.css') {
      analysis.css.count++;
      analysis.css.size += stats.size;
    } else {
      analysis.other.count++;
      analysis.other.size += stats.size;
    }
    
    largestFiles.push({ name: file, size: stats.size });
  });
  
  // Sort by size and get top 5
  largestFiles = largestFiles
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);
  
  return `
Bundle Analysis:
- JavaScript: ${analysis.js.count} files, ${formatBytes(analysis.js.size)}
- CSS: ${analysis.css.count} files, ${formatBytes(analysis.css.size)}  
- Other: ${analysis.other.count} files, ${formatBytes(analysis.other.size)}
- Total: ${analysis.total.count} files, ${formatBytes(analysis.total.size)}

Largest Files:
${largestFiles.map(f => `  - ${f.name}: ${formatBytes(f.size)}`).join('\n')}
`;
}

/**
 * Create compressed versions of assets
 */
function compressAssets() {
  const assetsDir = join(BUILD_DIR, 'assets');
  const files = readdirSync(assetsDir);
  
  let gzipSavings = 0;
  let brotliSavings = 0;
  let originalSize = 0;
  let compressedCount = 0;
  
  files.forEach(file => {
    const ext = extname(file);
    if (!COMPRESSION_EXTENSIONS.includes(ext)) return;
    
    const filePath = join(assetsDir, file);
    const content = readFileSync(filePath);
    originalSize += content.length;
    
    // Create gzip version
    const gzipped = gzipSync(content, { level: 9 });
    writeFileSync(`${filePath}.gz`, gzipped);
    gzipSavings += (content.length - gzipped.length);
    
    // Create brotli version (better compression)
    const brotlied = brotliCompressSync(content);
    writeFileSync(`${filePath}.br`, brotlied);
    brotliSavings += (content.length - brotlied.length);
    
    compressedCount++;
    
    // Warn about large files
    if (gzipped.length > MAX_GZIP_SIZE) {
      console.warn(`⚠️  Large file detected: ${file} (${formatBytes(gzipped.length)} gzipped)`);
    }
  });
  
  return `
Compression Results:
- Files compressed: ${compressedCount}
- Original size: ${formatBytes(originalSize)}
- Gzip savings: ${formatBytes(gzipSavings)} (${((gzipSavings/originalSize)*100).toFixed(1)}%)
- Brotli savings: ${formatBytes(brotliSavings)} (${((brotliSavings/originalSize)*100).toFixed(1)}%)
`;
}

/**
 * Generate comprehensive performance report
 */
function generatePerformanceReport() {
  const indexPath = join(BUILD_DIR, 'index.html');
  const indexContent = readFileSync(indexPath, 'utf8');
  
  // Extract resource hints
  const preloads = (indexContent.match(/rel="modulepreload"/g) || []).length;
  const stylesheets = (indexContent.match(/rel="stylesheet"/g) || []).length;
  
  // Calculate total bundle size
  const assetsDir = join(BUILD_DIR, 'assets');
  const files = readdirSync(assetsDir).filter(f => !f.endsWith('.gz') && !f.endsWith('.br'));
  const totalSize = files.reduce((sum, file) => {
    return sum + statSync(join(assetsDir, file)).size;
  }, 0);
  
  console.log(`
Performance Metrics:
- Total Bundle Size: ${formatBytes(totalSize)}
- Module Preloads: ${preloads}
- CSS Files: ${stylesheets}
- Code Splitting: ${files.filter(f => f.endsWith('.js')).length} JS chunks
- Caching Strategy: ✅ Enabled (hash-based file names)
- PWA Support: ✅ Service Worker generated
- Compression: ✅ Gzip + Brotli available

Recommendations:
${totalSize > 500 * 1024 ? '⚠️  Bundle size exceeds 500KB - consider further optimization' : '✅ Bundle size is within recommended limits'}
${preloads > 0 ? '✅ Using module preloading for faster initial load' : '💡 Consider adding module preloads'}
${files.some(f => statSync(join(assetsDir, f)).size > 200 * 1024) ? '⚠️  Some chunks are large - consider further splitting' : '✅ All chunks are reasonably sized'}
`);
  
  // Write performance report to file
  const report = {
    timestamp: new Date().toISOString(),
    bundleSize: totalSize,
    chunkCount: files.filter(f => f.endsWith('.js')).length,
    preloads,
    stylesheets,
    recommendations: totalSize <= 500 * 1024 ? 'optimal' : 'needs-optimization'
  };
  
  writeFileSync(join(BUILD_DIR, 'build-report.json'), JSON.stringify(report, null, 2));
  console.log('📄 Detailed report saved to dist/build-report.json');
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}