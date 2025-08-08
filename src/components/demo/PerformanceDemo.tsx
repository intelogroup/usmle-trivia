import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Activity,
  Zap,
  Gauge,
  TrendingUp,
  TrendingDown,
  Clock,
  MemoryStick,
  Wifi,
  Target,
  Package,
  Optimize,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  Cpu,
  HardDrive,
  Network,
  Image,
  FileText,
  BarChart3
} from 'lucide-react';
import { 
  performanceMonitor, 
  usePerformanceTracking,
  useMedicalContentPerformance,
  type PerformanceReport,
  type WebVitalMetrics 
} from '../../services/performanceMonitor';
import { 
  performanceOptimizer,
  type BundleAnalysis,
  type OptimizationResult 
} from '../../services/performanceOptimizer';

interface DashboardState {
  report: PerformanceReport | null;
  bundleAnalysis: BundleAnalysis | null;
  optimizations: OptimizationResult[];
  isMonitoring: boolean;
  isOptimizing: boolean;
  autoRefresh: boolean;
  selectedTab: 'overview' | 'vitals' | 'components' | 'bundle' | 'optimizations';
}

export const PerformanceDemo: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    report: null,
    bundleAnalysis: null,
    optimizations: [],
    isMonitoring: false,
    isOptimizing: false,
    autoRefresh: false,
    selectedTab: 'overview'
  });

  const intervalRef = useRef<number | null>(null);
  const { renderCount } = usePerformanceTracking('PerformanceDemo');
  const medicalTracker = useMedicalContentPerformance();

  useEffect(() => {
    // Initial load
    loadPerformanceData();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (state.autoRefresh) {
      intervalRef.current = window.setInterval(loadPerformanceData, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.autoRefresh]);

  const loadPerformanceData = async () => {
    try {
      const [report, bundleAnalysis] = await Promise.all([
        performanceMonitor.getPerformanceSnapshot(),
        performanceOptimizer.analyzeBundlePerformance()
      ]);
      
      setState(prev => ({ 
        ...prev, 
        report, 
        bundleAnalysis,
        optimizations: performanceOptimizer.getOptimizationHistory()
      }));
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  };

  const startMonitoring = () => {
    performanceMonitor.startMonitoring(5000);
    setState(prev => ({ ...prev, isMonitoring: true }));
  };

  const stopMonitoring = () => {
    performanceMonitor.stopMonitoring();
    setState(prev => ({ ...prev, isMonitoring: false }));
  };

  const runOptimization = async () => {
    setState(prev => ({ ...prev, isOptimizing: true }));
    
    try {
      const result = await performanceOptimizer.optimizePerformance();
      setState(prev => ({ 
        ...prev, 
        optimizations: result.optimizations,
        report: result.report,
        isOptimizing: false 
      }));
    } catch (error) {
      console.error('Optimization error:', error);
      setState(prev => ({ ...prev, isOptimizing: false }));
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600'; 
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Performance Monitoring & Optimization Dashboard
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Real-time performance monitoring with Web Vitals tracking, component analysis, and automated optimization 
          specifically designed for medical education platforms. Monitor quiz performance, medical content loading, 
          and user experience metrics.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={state.isMonitoring ? stopMonitoring : startMonitoring}
            variant={state.isMonitoring ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            <Activity className={`h-4 w-4 ${state.isMonitoring ? 'animate-pulse' : ''}`} />
            {state.isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          
          <Button
            onClick={runOptimization}
            disabled={state.isOptimizing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {state.isOptimizing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Optimize className="h-4 w-4" />
                Run Optimization
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.autoRefresh}
              onChange={(e) => setState(prev => ({ ...prev, autoRefresh: e.target.checked }))}
              className="rounded"
            />
            Auto-refresh (5s)
          </label>
          
          <Button
            onClick={loadPerformanceData}
            variant="ghost"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
          { id: 'vitals', label: 'Web Vitals', icon: <Activity className="h-4 w-4" /> },
          { id: 'components', label: 'Components', icon: <Package className="h-4 w-4" /> },
          { id: 'bundle', label: 'Bundle Analysis', icon: <FileText className="h-4 w-4" /> },
          { id: 'optimizations', label: 'Optimizations', icon: <Zap className="h-4 w-4" /> }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={state.selectedTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setState(prev => ({ ...prev, selectedTab: tab.id as any }))}
            className="flex items-center gap-2"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {state.selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Score */}
          {state.report && (
            <Card className={`border-2 ${getScoreBgColor(state.report.score)}`}>
              <CardContent className="p-6 text-center">
                <div className={`text-5xl font-bold ${getScoreColor(state.report.score)} mb-2`}>
                  {state.report.score}
                </div>
                <div className="text-lg font-semibold mb-4">Overall Performance Score</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">LCP</div>
                    <div className="text-muted-foreground">
                      {state.report.webVitals.LCP ? formatTime(state.report.webVitals.LCP) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">FID</div>
                    <div className="text-muted-foreground">
                      {state.report.webVitals.FID ? `${state.report.webVitals.FID.toFixed(0)}ms` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">CLS</div>
                    <div className="text-muted-foreground">
                      {state.report.webVitals.CLS ? state.report.webVitals.CLS.toFixed(3) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Memory</div>
                    <div className="text-muted-foreground">
                      {formatBytes(state.report.memory.usedJSHeapSize)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {state.report?.webVitals.firstQuestionLoad ? 
                    formatTime(state.report.webVitals.firstQuestionLoad) : 'N/A'
                  }
                </div>
                <div className="text-sm text-muted-foreground">First Question Load</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <MemoryStick className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {state.report ? state.report.memory.memoryPressure.toUpperCase() : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Memory Pressure</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Network className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {state.report ? formatTime(state.report.network.questionsLoadTime) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Question Load Time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {state.report ? state.report.components.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Tracked Components</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Optimizations */}
          {state.optimizations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recent Optimizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.optimizations.slice(-5).map((opt, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{opt.improvement}</div>
                        <div className="text-sm text-muted-foreground">{opt.estimatedImprovement}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {opt.type}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Web Vitals Tab */}
      {state.selectedTab === 'vitals' && (
        <div className="space-y-6">
          {state.report?.webVitals && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* LCP */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5" />
                    Largest Contentful Paint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className={`text-4xl font-bold ${
                      state.report.webVitals.LCP && state.report.webVitals.LCP <= 2500 ? 'text-green-600' : 
                      state.report.webVitals.LCP && state.report.webVitals.LCP <= 4000 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {state.report.webVitals.LCP ? formatTime(state.report.webVitals.LCP) : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: ≤2.5s | Poor: >4.0s
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Time for largest element to render
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FID */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" />
                    First Input Delay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className={`text-4xl font-bold ${
                      state.report.webVitals.FID && state.report.webVitals.FID <= 100 ? 'text-green-600' : 
                      state.report.webVitals.FID && state.report.webVitals.FID <= 300 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {state.report.webVitals.FID ? `${state.report.webVitals.FID.toFixed(0)}ms` : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: ≤100ms | Poor: >300ms
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Time to first user interaction
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CLS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    Cumulative Layout Shift
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className={`text-4xl font-bold ${
                      state.report.webVitals.CLS && state.report.webVitals.CLS <= 0.1 ? 'text-green-600' : 
                      state.report.webVitals.CLS && state.report.webVitals.CLS <= 0.25 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {state.report.webVitals.CLS ? state.report.webVitals.CLS.toFixed(3) : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: ≤0.1 | Poor: >0.25
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Visual stability measure
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Vitals */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Additional Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {state.report.webVitals.FCP ? formatTime(state.report.webVitals.FCP) : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">First Contentful Paint</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {state.report.webVitals.TTFB ? formatTime(state.report.webVitals.TTFB) : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Time to First Byte</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {state.report.webVitals.TTI ? formatTime(state.report.webVitals.TTI) : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Time to Interactive</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {state.report.webVitals.explanationRenderTime ? 
                          formatTime(state.report.webVitals.explanationRenderTime) : 'N/A'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Explanation Render</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Components Tab */}
      {state.selectedTab === 'components' && (
        <div className="space-y-6">
          {state.report?.components && state.report.components.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Component Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.report.components.map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{component.componentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {component.updateCount} renders • {formatBytes(component.memoryUsage)} memory
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          component.renderTime > 16 ? 'text-red-600' : 
                          component.renderTime > 8 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {component.renderTime.toFixed(2)}ms
                        </div>
                        <div className="text-xs text-muted-foreground">render time</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No component performance data available. Start monitoring to see component metrics.</p>
              </CardContent>
            </Card>
          )}

          {/* Demo Component Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Component Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">PerformanceDemo Component</div>
                    <div className="text-sm text-muted-foreground">
                      This component is being tracked in real-time
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{renderCount}</div>
                    <div className="text-xs text-muted-foreground">renders</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bundle Analysis Tab */}
      {state.selectedTab === 'bundle' && (
        <div className="space-y-6">
          {state.bundleAnalysis ? (
            <>
              {/* Bundle Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <HardDrive className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {formatBytes(state.bundleAnalysis.totalSize)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Bundle Size</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {formatBytes(state.bundleAnalysis.gzippedSize)}
                    </div>
                    <div className="text-sm text-muted-foreground">Gzipped Size</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {state.bundleAnalysis.chunks.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Chunks</div>
                  </CardContent>
                </Card>
              </div>

              {/* Chunks */}
              <Card>
                <CardHeader>
                  <CardTitle>Bundle Chunks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.bundleAnalysis.chunks.map((chunk, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{chunk.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {chunk.modules.length} modules • {chunk.isAsync ? 'Async' : 'Sync'} • Priority: {chunk.loadPriority}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatBytes(chunk.size)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatBytes(chunk.gzippedSize)} gzipped
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.bundleAnalysis.optimizations.map((opt, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium capitalize">{opt.type.replace('-', ' ')}: {opt.target}</div>
                          <div className="text-sm text-muted-foreground">
                            Estimated savings: {formatBytes(opt.estimatedSavings)} • Difficulty: {opt.difficulty}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          opt.priority === 'high' ? 'bg-red-100 text-red-800' :
                          opt.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {opt.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Loading bundle analysis...</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Optimizations Tab */}
      {state.selectedTab === 'optimizations' && (
        <div className="space-y-6">
          {/* Optimization Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={runOptimization}
                  disabled={state.isOptimizing}
                  className="h-20 text-left flex-col items-start justify-center"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-5 w-5" />
                    Run Full Optimization
                  </div>
                  <div className="text-xs opacity-80">
                    Optimize images, memory, network, and medical content
                  </div>
                </Button>

                <Button 
                  onClick={() => {
                    medicalTracker.startQuestionParse();
                    setTimeout(() => medicalTracker.endQuestionParse(), 100);
                    medicalTracker.startExplanationRender();
                    setTimeout(() => medicalTracker.endExplanationRender(), 150);
                  }}
                  variant="outline"
                  className="h-20 text-left flex-col items-start justify-center"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-5 w-5" />
                    Test Medical Content Performance
                  </div>
                  <div className="text-xs opacity-80">
                    Simulate medical content processing
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Optimization History */}
          {state.optimizations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Optimization History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.optimizations.map((opt, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {opt.applied ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{opt.improvement}</div>
                        <div className="text-sm text-muted-foreground">{opt.estimatedImprovement}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Type: {opt.type} • {opt.applied ? 'Applied' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No optimizations have been run yet. Click "Run Full Optimization" to start.</p>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {state.report?.recommendations && state.report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.report.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{rec.issue}</div>
                        <div className="text-sm text-muted-foreground">{rec.solution}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Impact: {rec.impact} • {rec.estimatedImprovement}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        rec.type === 'critical' ? 'bg-red-100 text-red-800' :
                        rec.type === 'important' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.type}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Performance monitoring is {state.isMonitoring ? 'active' : 'inactive'} •
        Last updated: {state.report ? new Date(state.report.timestamp).toLocaleTimeString() : 'Never'} •
        Component renders: {renderCount}
      </div>
    </div>
  );
};