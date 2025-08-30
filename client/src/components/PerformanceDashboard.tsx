/**
 * Performance Dashboard Component
 * Provides comprehensive visual analytics for database performance monitoring
 */

import { 
  Activity, Clock, Database, TrendingUp, AlertTriangle, 
  CheckCircle, Info, Zap, Target, Brain
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

import { aiIndexAnalyzer, IndexRecommendation } from '../services/AIIndexAnalyzer';
import { performanceMonitor, PerformanceStats } from '../services/PerformanceMonitor';

interface DashboardStats {
  totalQueries: number;
  avgQueryTime: number;
  slowQueries: number;
  successRate: number;
  weeklyImprovement: number;
  activeIndexes: number;
  recommendationsCount: number;
}

interface ChartData {
  queryTrends: Array<{ time: string; queries: number; avgTime: number }>;
  queryTypes: Array<{ type: string; count: number; avgTime: number }>;
  tablePerformance: Array<{ table: string; avgTime: number; queryCount: number }>;
  hourlyActivity: Array<{ hour: string; queries: number }>;
}

type TimeRange = '1h' | '24h' | '7d' | '30d';
 type TabKey = 'overview' | 'trends' | 'recommendations' | 'alerts';

export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalQueries: 0,
    avgQueryTime: 0,
    slowQueries: 0,
    successRate: 0,
    weeklyImprovement: 0,
    activeIndexes: 0,
    recommendationsCount: 0
  });

  const [chartData, setChartData] = useState<ChartData>({
    queryTrends: [],
    queryTypes: [],
    tablePerformance: [],
    hourlyActivity: []
  });

const [recommendations, setRecommendations] = useState<IndexRecommendation[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load performance stats
      const performanceStats = await performanceMonitor.getStats();
      const recommendations = await aiIndexAnalyzer.analyzeAndRecommend();
      
      setStats({
        totalQueries: performanceStats.totalQueries,
        avgQueryTime: performanceStats.averageQueryTime,
        slowQueries: performanceStats.slowQueries.length,
        successRate: 99.2, // Mock data
        weeklyImprovement: performanceStats.performanceTrends?.improvementSinceLastWeek || 0,
        activeIndexes: 12, // Mock data - would be calculated from actual indexes
        recommendationsCount: recommendations.recommendations.length
      });

      // Generate chart data
      setChartData({
        queryTrends: generateQueryTrends(),
        queryTypes: generateQueryTypes(performanceStats),
        tablePerformance: generateTablePerformance(performanceStats),
        hourlyActivity: generateHourlyActivity()
      });

      setRecommendations(recommendations.recommendations);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQueryTrends = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        queries: Math.floor(Math.random() * 100) + 50,
        avgTime: Math.floor(Math.random() * 50) + 20
      });
    }
    
    return data;
  };

const generateQueryTypes = (_stats: PerformanceStats) => {
    return [
      { type: 'SELECT', count: 850, avgTime: 45 },
      { type: 'INSERT', count: 320, avgTime: 25 },
      { type: 'UPDATE', count: 180, avgTime: 35 },
      { type: 'DELETE', count: 45, avgTime: 30 }
    ];
  };

const generateTablePerformance = (_stats: PerformanceStats) => {
    return [
      { table: 'products', avgTime: 42, queryCount: 450 },
      { table: 'sales', avgTime: 38, queryCount: 380 },
      { table: 'customers', avgTime: 28, queryCount: 220 },
      { table: 'transactions', avgTime: 35, queryCount: 180 },
      { table: 'cashRegisterSessions', avgTime: 25, queryCount: 95 }
    ];
  };

  const generateHourlyActivity = () => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        queries: Math.floor(Math.random() * 200) + (i >= 8 && i <= 18 ? 100 : 20)
      });
    }
    return data;
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    color: string;
  }> = ({ title, value, icon, trend, color }) => (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend !== undefined && (
            <p className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend >= 0 ? '+' : ''}{trend}% bu hafta
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-opacity-20 ${color.replace('text-', 'bg-')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
          <p className="text-gray-600">Database performance monitoring and optimization insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
{(
            [
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'trends', label: 'Trends', icon: TrendingUp },
              { key: 'recommendations', label: 'AI Recommendations', icon: Brain },
              { key: 'alerts', label: 'Alerts', icon: AlertTriangle }
            ] as Array<{ key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }>
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Queries"
              value={stats.totalQueries.toLocaleString()}
              icon={<Database className="w-6 h-6" />}
              trend={12}
              color="text-blue-600"
            />
            <StatCard
              title="Avg Query Time"
              value={`${stats.avgQueryTime.toFixed(1)}ms`}
              icon={<Clock className="w-6 h-6" />}
              trend={-8}
              color="text-green-600"
            />
            <StatCard
              title="Success Rate"
              value={`${stats.successRate}%`}
              icon={<CheckCircle className="w-6 h-6" />}
              color="text-green-600"
            />
            <StatCard
              title="AI Suggestions"
              value={stats.recommendationsCount}
              icon={<Brain className="w-6 h-6" />}
              color="text-purple-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query Performance Trends */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Query Performance Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.queryTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="queries" fill="#8884d8" name="Query Count" />
                  <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#ff7c7c" name="Avg Time (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Query Types Distribution */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Query Types Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.queryTypes}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={(entry) => `${entry.type}: ${entry.count}`}
                  >
                    {chartData.queryTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Table Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Table Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData.tablePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="table" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="queryCount" fill="#8884d8" name="Query Count" />
                <Bar yAxisId="right" dataKey="avgTime" fill="#82ca9d" name="Avg Time (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">24-Hour Activity Pattern</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="queries" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI-Powered Index Recommendations</h3>
            <button
              onClick={() => aiIndexAnalyzer.analyzeAndRecommend()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>Run Analysis</span>
            </button>
          </div>

          <div className="grid gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="text-sm text-gray-500">{rec.type.toUpperCase()} INDEX</span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {rec.indexName} on {rec.table}
                    </h4>
                    
                    <p className="text-gray-600 mb-3">{rec.reasoning}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        <span>+{rec.estimatedImprovement.toFixed(1)}% speedup</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-blue-600" />
                        <span>{rec.impact.storageOverhead}% storage overhead</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span>{rec.impact.maintenanceCost} maintenance</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ml-4">
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Performance Alerts</h3>
          
          <div className="space-y-3">
            {[
              {
                type: 'warning',
                title: 'Slow Query Detected',
                message: 'Product search query averaging 150ms - consider adding category index',
                time: '5 minutes ago'
              },
              {
                type: 'info',
                title: 'Optimization Complete',
                message: 'Sales table indexes updated - 40% performance improvement achieved',
                time: '1 hour ago'
              },
              {
                type: 'success',
                title: 'All Systems Normal',
                message: 'Database performance is within optimal ranges',
                time: '2 hours ago'
              }
            ].map((alert, index) => (
              <div key={index} className={`border-l-4 p-4 bg-white rounded-r-lg shadow-sm ${
                alert.type === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                alert.type === 'info' ? 'border-blue-400 bg-blue-50' :
                'border-green-400 bg-green-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    {alert.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                    {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    <h4 className="font-medium">{alert.title}</h4>
                  </div>
                  <span className="text-sm text-gray-500">{alert.time}</span>
                </div>
                <p className="text-gray-700 mt-1">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};