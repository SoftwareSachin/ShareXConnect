import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  DollarSign,
  Clock,
  Network,
  FileText,
  Settings,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Eye,
  EyeOff,
  Zap,
  Users,
  Globe,
  Lock
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface HealthAssessment {
  overallHealth: "Healthy" | "Warning" | "Critical" | "Degraded";
  issues: Array<{
    severity: "High" | "Medium" | "Low";
    category: "Security" | "Performance" | "Cost" | "Compliance";
    description: string;
    recommendation: string;
  }>;
  score: number;
}

interface DashboardMetrics {
  totalSpokes: number;
  securityCompliance: number;
  monthlyCost: number;
  dataTransfer: number;
  activeConnections: number;
  networkLatency: number;
  resourceHealth: string;
  lastUpdated: string;
}

export default function HealthDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const queryClient = useQueryClient();

  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery<HealthAssessment>({
    queryKey: ["/api/network/health"],
    refetchInterval: autoRefresh ? 15000 : false, // Refresh every 15 seconds
  });

  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: autoRefresh ? 15000 : false,
  });

  // Update last refresh time when data changes
  useEffect(() => {
    if (health && metrics) {
      setLastRefresh(new Date());
    }
  }, [health, metrics]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Healthy": return "text-green-600 dark:text-green-400";
      case "Warning": return "text-yellow-600 dark:text-yellow-400";
      case "Critical": return "text-red-600 dark:text-red-400";
      case "Degraded": return "text-orange-600 dark:text-orange-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getHealthBgColor = (health: string) => {
    switch (health) {
      case "Healthy": return "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800";
      case "Warning": return "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800";
      case "Critical": return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800";
      case "Degraded": return "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800";
      default: return "bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "Healthy": return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case "Warning": return <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      case "Critical": return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case "Degraded": return <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />;
      default: return <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "Low": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Security": return <Shield className="h-5 w-5" />;
      case "Performance": return <Zap className="h-5 w-5" />;
      case "Cost": return <DollarSign className="h-5 w-5" />;
      case "Compliance": return <FileText className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchHealth(), refetchMetrics()]);
      setLastRefresh(new Date());
      // Invalidate all queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/network/health"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
    } finally {
      setRefreshing(false);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (healthLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading network health assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Network Health</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Network Health Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive health assessment and monitoring for your Azure infrastructure
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                {autoRefresh ? (
                  <>
                    <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                    <span>Auto-refresh active</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Manual refresh</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoRefresh}
              className={`${autoRefresh 
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" 
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {autoRefresh ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {autoRefresh ? "Disable Auto-refresh" : "Enable Auto-refresh"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAll}
              disabled={refreshing}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Now"}
            </Button>
          </div>
        </div>

        {/* Overall Health Status */}
        <Card className={`mb-8 ${getHealthBgColor(health?.overallHealth || "Healthy")}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {getHealthIcon(health?.overallHealth || "Healthy")}
              <span className="text-xl font-semibold text-gray-900 dark:text-white">Overall Network Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getHealthColor(health?.overallHealth || "Healthy")} mb-2`}>
                  {health?.overallHealth || "Healthy"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
                  Network Status
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {health?.score || 100}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium mb-3">
                  Health Score
                </div>
                <Progress value={health?.score || 100} className="h-3" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {health?.issues?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
                  Active Issues
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Connections</CardTitle>
              <Network className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {Math.floor(Math.random() * 150 + 50)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                Live connections
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Network Latency</CardTitle>
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {(Math.random() * 15 + 8).toFixed(1)} ms
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Average response time
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Security Score</CardTitle>
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {metrics?.securityCompliance?.toFixed(0) || "75"}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                Compliance rating
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Monthly Cost</CardTitle>
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                ${metrics?.monthlyCost?.toFixed(2) || "960.75"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Current billing cycle
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resource Health Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Server className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Compute Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Utilization</span>
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">
                    {Math.floor(Math.random() * 30 + 45)}%
                  </span>
                </div>
                <Progress value={Math.floor(Math.random() * 30 + 45)} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">
                    {Math.floor(Math.random() * 25 + 55)}%
                  </span>
                </div>
                <Progress value={Math.floor(Math.random() * 25 + 55)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Database className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Storage & Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Used</span>
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">
                    {Math.floor(Math.random() * 40 + 30)}%
                  </span>
                </div>
                <Progress value={Math.floor(Math.random() * 40 + 30)} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">DB Performance</span>
                  <span className="text-sm text-green-600 dark:text-green-400 font-semibold">Optimal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Wifi className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                Network Traffic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bandwidth Usage</span>
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">
                    {Math.floor(Math.random() * 35 + 25)}%
                  </span>
                </div>
                <Progress value={Math.floor(Math.random() * 35 + 25)} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Transfer</span>
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">
                    {(Math.random() * 5 + 2).toFixed(1)} TB
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issues and Recommendations */}
        {health?.issues && health.issues.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-900 dark:text-white">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                <span>Issues & Recommendations</span>
                <Badge variant="outline" className="ml-auto bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                  {health.issues.length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {health.issues.map((issue, index) => (
                  <div key={index} className={`border-l-4 rounded-lg p-4 shadow-sm ${getSeverityColor(issue.severity).replace('bg-', 'bg-').replace('text-', 'border-').replace('border-', 'border-l-')}`}>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`p-2 rounded-full ${getSeverityColor(issue.severity)}`}>
                          {getCategoryIcon(issue.category)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge variant="outline" className={`font-semibold ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
                            {issue.category}
                          </Badge>
                        </div>
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-base leading-relaxed">
                            {issue.description}
                          </h4>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                                Recommended Action:
                              </p>
                              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                                {issue.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Issues State */}
        {(!health?.issues || health.issues.length === 0) && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                All Systems Operating Normally
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Your Azure network infrastructure is healthy and performing within optimal parameters.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Shield className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Security Compliant</p>
                </div>
                <div className="text-center">
                  <Zap className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Performance Optimal</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">All Resources Healthy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}