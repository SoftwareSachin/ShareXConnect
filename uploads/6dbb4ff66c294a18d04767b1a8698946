import { useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Download, 
  Plus, 
  ExternalLink, 
  Activity, 
  Settings, 
  RefreshCw, 
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Network,
  Database,
  Globe,
  DollarSign,
  Users,
  Zap,
  BarChart3,
  PieChart,
  Eye,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  AzureVirtualNetworkIcon,
  AzureHubIcon,
  AzureSecurityIcon,
  AzureStatusIcon,
  AzureTopologyIcon,
  AzureCloudIcon,
  AzureMonitorIcon,
  AzureProvisionIcon
} from "@/components/ui/azure-icons";

// Comprehensive dashboard data for professional Azure interface
const dashboardData = {
  metrics: {
    totalSpokes: 12,
    activeSpokes: 10,
    securityCompliance: 94,
    monthlyCost: 2847.65,
    dataTransfer: 5.8,
    networkLatency: 8.5,
    throughput: 4.2,
    availability: 99.97,
    activeConnections: 1847,
    resourceHealth: "Healthy",
    totalResources: 156,
    complianceScore: 94,
    securityAlerts: 2,
    costOptimization: 87
  },
  recentActivities: [
    {
      id: 1,
      activityType: "spoke_provisioned",
      description: "Spoke network provisioned successfully",
      resourceName: "spoke-prod-analytics",
      userName: "john.doe@company.com",
      status: "completed",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      location: "East US",
      environment: "production",
      cost: "$425.50"
    },
    {
      id: 2,
      activityType: "security_policy_updated",
      description: "Network security group rules updated",
      resourceName: "nsg-prod-web-001",
      userName: "jane.smith@company.com",
      status: "applied",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      location: "West US",
      environment: "production",
      cost: "$0.00"
    },
    {
      id: 3,
      activityType: "compliance_drift_detected",
      description: "Compliance policy drift detected",
      resourceName: "spoke-dev-test-002",
      userName: "system@company.com",
      status: "attention_required",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      location: "Central US",
      environment: "development",
      cost: "$125.25"
    },
    {
      id: 4,
      activityType: "spoke_provisioned",
      description: "Spoke network deployment initiated",
      resourceName: "spoke-staging-api",
      userName: "mike.wilson@company.com",
      status: "in_progress",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      location: "North Europe",
      environment: "staging",
      cost: "$289.75"
    },
    {
      id: 5,
      activityType: "security_audit_completed",
      description: "Security audit completed successfully",
      resourceName: "hub-network-prod",
      userName: "security@company.com",
      status: "completed",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      location: "East US",
      environment: "production",
      cost: "$0.00"
    },
    {
      id: 6,
      activityType: "firewall_rule_added",
      description: "Azure Firewall rule configured",
      resourceName: "azfw-hub-prod-001",
      userName: "ops@company.com",
      status: "completed",
      createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      location: "East US",
      environment: "production",
      cost: "$0.00"
    },
    {
      id: 7,
      activityType: "spoke_deprovisioned",
      description: "Spoke network decommissioned",
      resourceName: "spoke-legacy-app",
      userName: "admin@company.com",
      status: "completed",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      location: "West US",
      environment: "production",
      cost: "-$156.25"
    },
    {
      id: 8,
      activityType: "peering_established",
      description: "VNet peering connection established",
      resourceName: "spoke-prod-data",
      userName: "network@company.com",
      status: "completed",
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      location: "East US",
      environment: "production",
      cost: "$0.00"
    }
  ],
  networkTopology: {
    hubNetworks: 1,
    spokeNetworks: 12,
    activeConnections: 10,
    regions: 4,
    peerings: 10,
    vpnConnections: 2
  },
  environmentDistribution: {
    production: 5,
    development: 3,
    staging: 2,
    security: 2
  },
  costBreakdown: {
    compute: 1245.80,
    networking: 567.45,
    storage: 445.20,
    security: 589.20
  },
  alerts: [
    {
      severity: "High",
      title: "Security policy drift detected",
      description: "Non-compliant configuration found in development environment",
      affectedResource: "spoke-dev-test-002",
      time: "2 hours ago"
    },
    {
      severity: "Medium",
      title: "Cost optimization opportunity",
      description: "Unused resources detected in staging environment",
      affectedResource: "spoke-staging-preview",
      time: "4 hours ago"
    }
  ]
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState("comprehensive");

  const { data: activities = dashboardData.recentActivities } = useQuery({
    queryKey: ["/api/activities"],
  });

  const { data: metrics = dashboardData.metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: liveMetrics } = useQuery({
    queryKey: ["/api/live/network-metrics"],
    refetchInterval: 5000,
  });

  const handleExportReport = async (exportType: string) => {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        exportType,
        metrics: metrics,
        activities: activities,
        networkTopology: dashboardData.networkTopology,
        environmentDistribution: dashboardData.environmentDistribution,
        costBreakdown: dashboardData.costBreakdown,
        alerts: dashboardData.alerts,
        summary: {
          totalSpokes: metrics?.totalSpokes || 0,
          securityCompliance: metrics?.securityCompliance || 0,
          monthlyCost: metrics?.monthlyCost || 0,
          dataTransfer: metrics?.dataTransfer || 0,
          generatedBy: "Azure Hub & Spoke Management Platform",
          version: "1.0.0"
        }
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `azure-hub-spoke-report-${exportType}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Exported Successfully",
        description: `${exportType} network report has been downloaded successfully.`,
      });
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "spoke_provisioned":
        return Plus;
      case "security_policy_updated":
        return Shield;
      case "compliance_drift_detected":
        return AlertTriangle;
      case "security_audit_completed":
        return CheckCircle;
      case "firewall_rule_added":
        return Shield;
      case "spoke_deprovisioned":
        return Database;
      case "peering_established":
        return Network;
      default:
        return Activity;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case "spoke_provisioned":
        return "text-green-600";
      case "security_policy_updated":
        return "text-blue-600";
      case "compliance_drift_detected":
        return "text-yellow-600";
      case "security_audit_completed":
        return "text-green-600";
      case "firewall_rule_added":
        return "text-blue-600";
      case "spoke_deprovisioned":
        return "text-red-600";
      case "peering_established":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case "applied":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Applied</Badge>;
      case "attention_required":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Attention Required</Badge>;
      case "in_progress":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const metricCards = [
    {
      title: "Total Spoke Networks",
      value: metrics?.totalSpokes || 12,
      subValue: `${metrics?.activeSpokes || 10} active`,
      change: "+2 this month",
      changeType: "positive",
      icon: AzureVirtualNetworkIcon,
      color: "bg-blue-50 text-blue-600",
      href: "/network-topology"
    },
    {
      title: "Security Compliance",
      value: `${metrics?.securityCompliance || 94}%`,
      subValue: "SOC2, ISO27001",
      change: "+2% this month",
      changeType: "positive",
      icon: AzureSecurityIcon,
      color: "bg-green-50 text-green-600",
      href: "/security-policies"
    },
    {
      title: "Monthly Cost",
      value: `$${metrics?.monthlyCost?.toLocaleString() || '2,847'}`,
      subValue: "Across all environments",
      change: "+8% this month",
      changeType: "negative",
      icon: DollarSign,
      color: "bg-yellow-50 text-yellow-600",
      href: "/compliance"
    },
    {
      title: "Data Transfer",
      value: `${metrics?.dataTransfer || 5.8} TB`,
      subValue: "This month",
      change: "+15% this month",
      changeType: "positive",
      icon: BarChart3,
      color: "bg-purple-50 text-purple-600",
      href: "/monitoring"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-blue-600 hover:text-blue-800">
                Network Management
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Overview</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            <AzureCloudIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Hub & Spoke Network Overview</h1>
              <p className="text-gray-600">Manage your Azure network infrastructure across all environments</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setLocation("/provision-spoke")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Spoke
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm"
                onClick={() => setLocation(card.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${card.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {card.changeType === "positive" ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        card.changeType === "positive" ? "text-green-600" : "text-red-600"
                      }`}>
                        {card.change}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.subValue}</p>
                    <p className="text-sm font-medium text-gray-900">{card.title}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Network Topology Overview */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Network Topology</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation("/network-topology")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Topology
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-50 rounded-lg p-6 h-64">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Simplified topology visualization */}
                    <div className="relative">
                      {/* Hub */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          HUB
                        </div>
                      </div>
                      
                      {/* Spokes */}
                      {[0, 1, 2, 3].map((index) => {
                        const angle = (index * 2 * Math.PI) / 4;
                        const radius = 80;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        const colors = ['bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
                        
                        return (
                          <div
                            key={index}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                              transform: `translate(${x - 50}px, ${y - 50}px)`
                            }}
                          >
                            <div className={`w-8 h-8 ${colors[index]} rounded-full`}></div>
                            <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gray-300 transform -translate-y-1/2" 
                                 style={{
                                   transform: `translate(-50%, -50%) rotate(${angle + Math.PI}rad)`,
                                   transformOrigin: 'left center'
                                 }}>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Stats overlay */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className="bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {dashboardData.networkTopology.spokeNetworks} Spokes
                    </div>
                    <div className="bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {dashboardData.networkTopology.activeConnections} Active
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setLocation("/provision-spoke")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <AzureProvisionIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Provision New Spoke</p>
                        <p className="text-sm text-gray-500">Create a new spoke network</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setLocation("/security-policies")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Security Policies</p>
                        <p className="text-sm text-gray-500">Review and update rules</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setLocation("/compliance")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                        <PieChart className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Compliance Report</p>
                        <p className="text-sm text-gray-500">Generate audit reports</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setLocation("/monitoring")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                        <AzureMonitorIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Network Monitoring</p>
                        <p className="text-sm text-gray-500">View performance metrics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Live Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Live Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Network Latency</span>
                  <span className="font-semibold">{liveMetrics?.latency?.toFixed(1) || '8.5'}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Throughput</span>
                  <span className="font-semibold">{liveMetrics?.throughput?.toFixed(1) || '4.2'} Gbps</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Availability</span>
                  <span className="font-semibold text-green-600">{metrics?.availability || '99.97'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Connections</span>
                  <span className="font-semibold">{metrics?.activeConnections?.toLocaleString() || '1,847'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Environment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Environment Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(dashboardData.environmentDistribution).map(([env, count]) => {
                  const colors = {
                    production: 'bg-blue-500',
                    development: 'bg-yellow-500',
                    staging: 'bg-purple-500',
                    security: 'bg-red-500'
                  };
                  
                  return (
                    <div key={env} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${colors[env as keyof typeof colors]}`}></div>
                        <span className="text-sm capitalize">{env}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">System Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.alerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{alert.affectedResource}</span>
                          <span className="text-xs text-gray-500">{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activities */}
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation("/monitoring")}
            >
              View All Activities
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Activity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Resource</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Environment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.slice(0, 6).map((activity) => {
                    const Icon = getActivityIcon(activity.activityType);
                    const iconColor = getActivityColor(activity.activityType);
                    
                    return (
                      <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                            <span className="text-sm font-medium">{activity.description}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">{activity.resourceName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{activity.userName}</span>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(activity.status)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {activity.environment}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-500">{formatTimeAgo(activity.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Network Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="comprehensive"
                    name="reportType"
                    value="comprehensive"
                    checked={selectedExportType === "comprehensive"}
                    onChange={(e) => setSelectedExportType(e.target.value)}
                  />
                  <label htmlFor="comprehensive" className="text-sm">Comprehensive Report</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="security"
                    name="reportType"
                    value="security"
                    checked={selectedExportType === "security"}
                    onChange={(e) => setSelectedExportType(e.target.value)}
                  />
                  <label htmlFor="security" className="text-sm">Security Report</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="cost"
                    name="reportType"
                    value="cost"
                    checked={selectedExportType === "cost"}
                    onChange={(e) => setSelectedExportType(e.target.value)}
                  />
                  <label htmlFor="cost" className="text-sm">Cost Report</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleExportReport(selectedExportType)}>
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}