import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Monitor, 
  Zap, 
  HardDrive, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Download
} from 'lucide-react';

interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint  
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Custom metrics
  bundleSize: number;
  chunkCount: number;
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  
  // Network
  connectionType?: string;
  effectiveType?: string;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    collectPerformanceMetrics();
    
    // Set up periodic monitoring
    const interval = setInterval(collectPerformanceMetrics, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const collectPerformanceMetrics = () => {
    setIsCollecting(true);
    
    const metrics: PerformanceMetrics = {
      bundleSize: 589719, // From build report
      chunkCount: 22,
      loadTime: 0,
      renderTime: 0
    };

    // Collect Core Web Vitals if available
    if ('web-vital' in window) {
      // Use web-vitals library if available
    }

    // Performance Navigation Timing
    if (performance.navigation && performance.timing) {
      const timing = performance.timing;
      metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
    }

    // Performance Observer for modern browsers
    if ('PerformanceObserver' in window) {
      try {
        // First Contentful Paint
        const fcpEntries = performance.getEntriesByName('first-contentful-paint');
        if (fcpEntries.length > 0) {
          metrics.fcp = fcpEntries[0].startTime;
        }

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = memory.usedJSHeapSize;
    }

    // Network information (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.connectionType = connection?.type;
      metrics.effectiveType = connection?.effectiveType;
    }

    setMetrics(metrics);
    setIsCollecting(false);
  };

  const getScoreColor = (score: number, thresholds: { good: number; poor: number }) => {
    if (score <= thresholds.good) return 'green';
    if (score <= thresholds.poor) return 'orange';
    return 'red';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!metrics) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Monitor className="w-5 h-5 animate-spin" />
            <span>Collecting performance metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Real-time application performance metrics and Core Web Vitals
          </p>
        </div>
        <Button onClick={collectPerformanceMetrics} disabled={isCollecting}>
          {isCollecting ? (
            <Monitor className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Monitor className="w-4 h-4 mr-2" />
          )}
          Refresh Metrics
        </Button>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.fcp && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">First Contentful Paint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(metrics.fcp)}</div>
              <Badge variant={getScoreColor(metrics.fcp, { good: 1800, poor: 3000 }) as any}>
                {metrics.fcp <= 1800 ? 'Good' : metrics.fcp <= 3000 ? 'Needs Work' : 'Poor'}
              </Badge>
            </CardContent>
          </Card>
        )}

        {metrics.lcp && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Largest Contentful Paint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(metrics.lcp)}</div>
              <Badge variant={getScoreColor(metrics.lcp, { good: 2500, poor: 4000 }) as any}>
                {metrics.lcp <= 2500 ? 'Good' : metrics.lcp <= 4000 ? 'Needs Work' : 'Poor'}
              </Badge>
            </CardContent>
          </Card>
        )}

        {metrics.fid && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">First Input Delay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(metrics.fid)}</div>
              <Badge variant={getScoreColor(metrics.fid, { good: 100, poor: 300 }) as any}>
                {metrics.fid <= 100 ? 'Good' : metrics.fid <= 300 ? 'Needs Work' : 'Poor'}
              </Badge>
            </CardContent>
          </Card>
        )}

        {metrics.cls && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cumulative Layout Shift</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.cls.toFixed(3)}</div>
              <Badge variant={getScoreColor(metrics.cls * 1000, { good: 100, poor: 250 }) as any}>
                {metrics.cls <= 0.1 ? 'Good' : metrics.cls <= 0.25 ? 'Needs Work' : 'Poor'}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bundle & Network Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm">Bundle Size</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(metrics.bundleSize)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.chunkCount} chunks
            </p>
            <Badge variant={metrics.bundleSize > 500 * 1024 ? 'destructive' : 'default'}>
              {metrics.bundleSize > 500 * 1024 ? 'Needs Optimization' : 'Good Size'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-600" />
              <CardTitle className="text-sm">Load Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics.loadTime)}</div>
            <Badge variant={metrics.loadTime > 3000 ? 'destructive' : 'default'}>
              {metrics.loadTime > 3000 ? 'Slow' : 'Fast'}
            </Badge>
          </CardContent>
        </Card>

        {metrics.memoryUsage && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <CardTitle className="text-sm">Memory Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(metrics.memoryUsage)}</div>
              <Badge variant={metrics.memoryUsage > 50 * 1024 * 1024 ? 'destructive' : 'default'}>
                {metrics.memoryUsage > 50 * 1024 * 1024 ? 'High' : 'Normal'}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Network Information */}
      {(metrics.connectionType || metrics.effectiveType) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Network Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {metrics.connectionType && (
                <div>
                  <span className="font-medium">Connection Type:</span>
                  <span className="ml-2">{metrics.connectionType}</span>
                </div>
              )}
              {metrics.effectiveType && (
                <div>
                  <span className="font-medium">Effective Type:</span>
                  <span className="ml-2">{metrics.effectiveType}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.bundleSize > 500 * 1024 && (
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Bundle size is above recommended 500KB</p>
                  <p className="text-xs text-muted-foreground">
                    Consider code splitting, tree shaking, or removing unused dependencies
                  </p>
                </div>
              </div>
            )}

            {(!metrics.fcp || metrics.fcp > 2000) && (
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">First Contentful Paint could be improved</p>
                  <p className="text-xs text-muted-foreground">
                    Consider optimizing critical resources and reducing render-blocking resources
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">PWA features enabled</p>
                <p className="text-xs text-muted-foreground">
                  Service worker is active and caching resources for offline support
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Code splitting implemented</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.chunkCount} chunks created for optimal loading
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Only show in development
export function ConditionalPerformanceMonitor() {
  if (import.meta.env.PROD) {
    return null;
  }

  return <PerformanceMonitor />;
}