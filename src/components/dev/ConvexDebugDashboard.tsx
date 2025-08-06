import React, { useState, useEffect } from 'react';
import { convexLogger } from '../../utils/convexDebugLogger';

/**
 * 🏥 MedQuiz Pro - Convex Debug Dashboard
 * 
 * A comprehensive debugging interface for monitoring Convex operations,
 * performance metrics, and system health in real-time.
 * 
 * Features:
 * - Live operation monitoring
 * - Performance metrics visualization
 * - Error tracking and analysis
 * - User action timeline
 * - Database operation insights
 */

interface DebugDashboardProps {
  isVisible: boolean;
  onToggle: () => void;
}

const ConvexDebugDashboard: React.FC<DebugDashboardProps> = ({
  isVisible,
  onToggle
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'errors' | 'performance'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [logs, setLogs] = useState(convexLogger.getRecentLogs(100));
  const [errorSummary, setErrorSummary] = useState(convexLogger.getErrorSummary());
  const [performanceData, setPerformanceData] = useState(convexLogger.getPerformanceSummary());

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLogs(convexLogger.getRecentLogs(100));
      setErrorSummary(convexLogger.getErrorSummary());
      setPerformanceData(convexLogger.getPerformanceSummary());
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {
        event.preventDefault();
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const handleExportLogs = () => {
    const logsData = convexLogger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medquiz-debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      convexLogger.clearLogs();
      setLogs([]);
      setErrorSummary(convexLogger.getErrorSummary());
    }
  };

  const getStatusColor = (success: boolean) => 
    success ? 'text-green-600' : 'text-red-600';

  const formatDuration = (ms?: number) => 
    ms !== undefined ? `${ms.toFixed(1)}ms` : '-';

  const renderOverview = () => (
    <div className="space-y-4">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Operations</h3>
          <p className="text-2xl font-bold text-blue-600">{performanceData.totalOperations}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Error Rate</h3>
          <p className="text-2xl font-bold text-red-600">
            {performanceData.totalOperations > 0 
              ? ((errorSummary.totalErrors / performanceData.totalOperations) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Avg Response Time</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatDuration(performanceData.averageOperationTime)}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Activity</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.slice(-10).reverse().map((log, index) => (
            <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <span className={`w-2 h-2 rounded-full ${log.success ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className="font-medium">{log.category}</span>
                <span className="text-gray-600">{log.operation}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatDuration(log.duration)}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Categories */}
      {Object.keys(errorSummary.errorsByCategory).length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Errors by Category</h3>
          <div className="space-y-2">
            {Object.entries(errorSummary.errorsByCategory).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="font-medium">{category}</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-4">
      {/* Log Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            Auto-refresh
          </label>
          <button
            onClick={() => {
              setLogs(convexLogger.getRecentLogs(100));
              setErrorSummary(convexLogger.getErrorSummary());
              setPerformanceData(convexLogger.getPerformanceSummary());
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        <span className="text-sm text-gray-600">
          Showing {logs.length} recent entries
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left p-3 font-semibold">Time</th>
                <th className="text-left p-3 font-semibold">Category</th>
                <th className="text-left p-3 font-semibold">Operation</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Duration</th>
                <th className="text-left p-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.reverse().map((log, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.category === 'CONVEX' ? 'bg-blue-100 text-blue-800' :
                      log.category === 'QUIZ' ? 'bg-green-100 text-green-800' :
                      log.category === 'AUTH' ? 'bg-purple-100 text-purple-800' :
                      log.category === 'USER' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{log.operation}</td>
                  <td className="p-3">
                    <span className={getStatusColor(log.success)}>
                      {log.success ? '✅' : '❌'}
                    </span>
                  </td>
                  <td className="p-3">{formatDuration(log.duration)}</td>
                  <td className="p-3 max-w-xs overflow-hidden">
                    {log.error && (
                      <div className="text-red-600 text-xs truncate" title={log.error}>
                        {log.error}
                      </div>
                    )}
                    {log.context && (
                      <div className="text-gray-600 text-xs truncate">
                        {JSON.stringify(log.context)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderErrors = () => (
    <div className="space-y-4">
      {/* Error Summary */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Error Summary</h3>
        <p className="text-gray-600 mb-2">
          Total Errors: <span className="font-bold text-red-600">{errorSummary.totalErrors}</span>
        </p>
      </div>

      {/* Recent Errors */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Errors</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {errorSummary.recentErrors.map((error, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-red-800">{error.operation}</h4>
                <span className="text-xs text-red-600">
                  {new Date(error.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-red-700 text-sm mb-2">{error.error}</p>
              {error.context && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-red-600 hover:text-red-800">
                    Show Context
                  </summary>
                  <pre className="mt-2 p-2 bg-white border rounded overflow-x-auto text-gray-700">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Response Times</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Average:</span>
              <span className="font-bold">{formatDuration(performanceData.averageOperationTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Network Latency:</span>
              <span className="font-bold">{formatDuration(performanceData.networkLatency)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">System Resources</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Memory Usage:</span>
              <span className="font-bold">
                {(performanceData.memoryUsage / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Operations:</span>
              <span className="font-bold">{performanceData.totalOperations}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance History */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Performance</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs
            .filter(log => log.duration !== undefined)
            .slice(-20)
            .reverse()
            .map((log, index) => (
              <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">{log.operation}</span>
                  <span className="text-xs text-gray-500">{log.category}</span>
                </div>
                <div className={`text-sm font-bold ${
                  log.duration! < 100 ? 'text-green-600' :
                  log.duration! < 500 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {formatDuration(log.duration)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Open Debug Dashboard (Ctrl+Shift+D)"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-100 w-full max-w-6xl h-5/6 rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-300 p-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">🏥 Convex Debug Dashboard</h2>
            <div className="flex space-x-1">
              {(['overview', 'logs', 'errors', 'performance'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportLogs}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Export
            </button>
            <button
              onClick={handleClearLogs}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Clear
            </button>
            <button
              onClick={onToggle}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'logs' && renderLogs()}
          {activeTab === 'errors' && renderErrors()}
          {activeTab === 'performance' && renderPerformance()}
        </div>
      </div>
    </div>
  );
};

export default ConvexDebugDashboard;