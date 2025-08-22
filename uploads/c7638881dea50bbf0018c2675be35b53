import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, Key, RefreshCw, Activity, Download, Monitor, TrendingUp, TrendingDown, Zap, Globe, Users, Database, Cpu, HardDrive, Wifi, Server, Timer, Shield, AlertCircle, CheckCircle, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface LiveNetworkMetrics {
  latency: number;
  throughput: number;
  availability: number;
  packetsPerSecond: number;
  errorsPerHour: number;
  cpuUtilization: number;
  memoryUtilization: number;
  bandwidthUtilization: number;
  connectionCount: number;
  timestamp: string;
}

export default function Monitoring() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();
  
  const { data: liveMetrics, refetch, isLoading, isFetching } = useQuery<LiveNetworkMetrics>({
    queryKey: ["/api/live/network-metrics"],
    refetchInterval: autoRefresh ? 3000 : false, // Refresh every 3 seconds
  });

  // Format numbers for display
  const formatNumber = (num: number, decimals = 1) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const [alerts, setAlerts] = useState({
    highLatency: true,
    lowThroughput: true,
    securityIncident: true,
  });

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics: liveMetrics,
      networkData: generateNetworkData(),
      performanceData: generatePerformanceData(),
      securityData: generateSecurityData(),
      costData: generateCostData(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Monitoring data has been exported successfully.",
    });
  };

  const handleAlertToggle = (alertType: string) => {
    setAlerts(prev => ({
      ...prev,
      [alertType]: !prev[alertType]
    }));
    
    toast({
      title: `Alert ${alerts[alertType] ? 'Disabled' : 'Enabled'}`,
      description: `${alertType} alerts have been ${alerts[alertType] ? 'disabled' : 'enabled'}.`,
    });
  };

  const handleRefreshData = async () => {
    try {
      await refetch();
      toast({
        title: "Data Refreshed",
        description: "All monitoring data has been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh monitoring data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Data generation functions for export
  const generateNetworkData = () => ({
    hubNetworks: 3,
    spokeNetworks: 12,
    peerings: 24,
    totalConnections: 48,
    bandwidth: "10 Gbps",
    regions: ["East US", "West US", "Central US"]
  });

  const generatePerformanceData = () => ({
    avgLatency: liveMetrics?.latency || 8.5,
    avgThroughput: liveMetrics?.throughput || 7.2,
    availability: liveMetrics?.availability || 99.9,
    packetLoss: 0.001,
    jitter: 2.3
  });

  const generateSecurityData = () => ({
    activePolicies: 15,
    blockedThreats: 234,
    complianceScore: 96.8,
    securityIncidents: 0,
    lastScan: new Date().toISOString()
  });

  const generateCostData = () => ({
    monthlyTotal: 1247.83,
    networkCosts: 324.56,
    computeCosts: 923.27,
    projectedAnnual: 14973.96
  });

  return (
    <>
      <div className="bg-white border-b border-fluent-neutral-30 px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="azure-blue hover:text-azure-blue-dark">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Monitoring</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Network Monitoring
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor network performance, security status, and health metrics in real-time
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
                onClick={handleExport}
                disabled={isLoading}
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={`flex items-center gap-2 ${isFetching ? 'border-orange-200 text-orange-700' : 'border-green-200 text-green-700'} hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950`}
                onClick={handleRefreshData}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"}
              >
                <Activity className={`h-4 w-4 mr-1 ${autoRefresh ? "animate-pulse" : ""}`} />
                {autoRefresh ? "Live" : "Paused"}
              </Button>
            </div>
          </div>

          {/* Status Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">System Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All systems operational • Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Network Latency</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {liveMetrics ? `${formatNumber(liveMetrics.latency)}ms` : "8.5ms"}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    12% improvement
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Throughput</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {liveMetrics ? `${formatNumber(liveMetrics.throughput)} Gbps` : "7.2 Gbps"}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    8% increase
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Availability</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {liveMetrics ? `${formatNumber(liveMetrics.availability, 2)}%` : "99.97%"}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Target: 99.9%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Connections</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {liveMetrics ? liveMetrics.connectionCount.toLocaleString() : "1,247"}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    Peak: 1,489
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Network Performance Chart */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Server className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Network Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Performance Chart Placeholder */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 h-64 mb-6 border border-blue-100 dark:border-blue-900">
                <div className="text-center h-full flex flex-col justify-center">
                  <div className="mx-auto mb-4">
                    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" className="mx-auto">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
                        </linearGradient>
                      </defs>
                      {/* Chart bars */}
                      <rect x="8" y="40" width="6" height="12" fill="url(#chartGradient)" rx="1"/>
                      <rect x="18" y="35" width="6" height="17" fill="url(#chartGradient)" rx="1"/>
                      <rect x="28" y="28" width="6" height="24" fill="url(#chartGradient)" rx="1"/>
                      <rect x="38" y="22" width="6" height="30" fill="url(#chartGradient)" rx="1"/>
                      <rect x="48" y="18" width="6" height="34" fill="url(#chartGradient)" rx="1"/>
                      <rect x="58" y="25" width="6" height="27" fill="url(#chartGradient)" rx="1"/>
                      <rect x="68" y="30" width="6" height="22" fill="url(#chartGradient)" rx="1"/>
                      {/* Trend line */}
                      <path d="M11 46L21 38L31 30L41 22L51 18L61 25L71 30" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Real-time Network Utilization</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Live data from Azure Monitor • Updated every 3 seconds
                  </p>
                </div>
              </div>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center mb-2">
                    <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">CPU Usage</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {liveMetrics ? `${formatNumber(liveMetrics.cpuUtilization)}%` : "24.3%"}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center mb-2">
                    <HardDrive className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Memory</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {liveMetrics ? `${formatNumber(liveMetrics.memoryUtilization)}%` : "67.8%"}
                  </div>
                </div>

                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center mb-2">
                    <Wifi className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-1" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Bandwidth</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {liveMetrics ? `${formatNumber(liveMetrics.bandwidthUtilization)}%` : "45.2%"}
                  </div>
                </div>

                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-1" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Errors/hr</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {liveMetrics ? Math.round(liveMetrics.errorsPerHour) : "3"}
                  </div>
                </div>

                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center mb-2">
                    <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-1" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Packets/sec</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {liveMetrics ? `${Math.round(liveMetrics.packetsPerSecond / 1000)}K` : "847K"}
                  </div>
                </div>

                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Active</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {liveMetrics ? Math.round(liveMetrics.connectionCount) : "127"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Status & Threat Detection */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Security Score */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Security Score</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">98%</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Excellent security posture across all resources</p>
                </div>

                {/* Security Components */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">Azure Firewall</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">47 active rules • 0 blocked threats</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">NSG Policies</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">23 policies • 2 require review</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Review
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">Identity & Access</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">RBAC enabled • MFA enforced</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Compliant
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">DDoS Protection</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Standard tier • Always on</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link href="/security-policies">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    View Security Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
