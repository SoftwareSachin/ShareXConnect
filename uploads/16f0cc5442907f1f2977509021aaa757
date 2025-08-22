import { useState, useRef, useEffect } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Info, 
  MapPin, 
  Activity, 
  Settings,
  Filter,
  Download,
  RefreshCw,
  Network,
  Shield,
  Database,
  Globe,
  Server,
  Monitor,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SpokeNetwork, HubNetwork } from "@shared/schema";
import { 
  AzureVirtualNetworkIcon,
  AzureHubIcon,
  AzureSpokeIcon,
  AzureSecurityIcon,
  AzureStatusIcon,
  AzureTopologyIcon
} from "@/components/ui/azure-icons";

// Comprehensive network topology data
const networkElements = {
  hubNetworks: [
    {
      id: 1,
      name: "hub-network-prod",
      addressSpace: "10.0.0.0/16",
      location: "East US",
      subscriptionId: 1,
      resourceGroupName: "rg-hub-prod",
      status: "active",
      subnets: [
        { name: "GatewaySubnet", addressSpace: "10.0.0.0/24", type: "gateway" },
        { name: "AzureFirewallSubnet", addressSpace: "10.0.1.0/24", type: "firewall" },
        { name: "SharedServices", addressSpace: "10.0.2.0/24", type: "shared" }
      ],
      services: ["Azure Firewall", "VPN Gateway", "ExpressRoute Gateway", "DNS Resolver"],
      connections: 8,
      monthlyTraffic: "2.4 TB",
      compliance: "SOC2, ISO27001, PCI-DSS"
    }
  ],
  spokeNetworks: [
    {
      id: 1,
      name: "spoke-prod-web",
      addressSpace: "10.1.0.0/24",
      environment: "production",
      hubNetworkId: 1,
      resourceGroupName: "rg-spoke-prod-web",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "485.50",
      dataTransferTB: "2.150",
      services: ["Application Gateway", "Load Balancer", "Web Apps"],
      security: { nsg: "active", firewall: "enabled", ddos: "standard" },
      workloads: ["Frontend APIs", "Web Services", "CDN"]
    },
    {
      id: 2,
      name: "spoke-prod-api",
      addressSpace: "10.1.1.0/24",
      environment: "production",
      hubNetworkId: 1,
      resourceGroupName: "rg-spoke-prod-api",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "320.75",
      dataTransferTB: "1.840",
      services: ["API Management", "Azure Functions", "Service Bus"],
      security: { nsg: "active", firewall: "enabled", ddos: "standard" },
      workloads: ["REST APIs", "Microservices", "Message Queue"]
    },
    {
      id: 3,
      name: "spoke-prod-data",
      addressSpace: "10.1.2.0/24",
      environment: "production",
      hubNetworkId: 1,
      resourceGroupName: "rg-spoke-prod-data",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "750.25",
      dataTransferTB: "0.950",
      services: ["SQL Database", "Cosmos DB", "Storage Account"],
      security: { nsg: "active", firewall: "enabled", ddos: "premium" },
      workloads: ["Database Services", "Data Analytics", "Backup Storage"]
    },
    {
      id: 4,
      name: "spoke-dev-test",
      addressSpace: "10.2.0.0/24",
      environment: "development",
      hubNetworkId: 1,
      resourceGroupName: "rg-spoke-dev-test",
      status: "active",
      complianceStatus: "non-compliant",
      monthlyCost: "125.25",
      dataTransferTB: "0.450",
      services: ["Container Instances", "Dev/Test Labs"],
      security: { nsg: "active", firewall: "basic", ddos: "basic" },
      workloads: ["Development Environment", "Testing Services"]
    },
    {
      id: 5,
      name: "spoke-staging-preview",
      addressSpace: "10.2.1.0/24",
      environment: "staging",
      hubNetworkId: 1,
      resourceGroupName: "rg-spoke-staging",
      status: "inactive",
      complianceStatus: "compliant",
      monthlyCost: "89.50",
      dataTransferTB: "0.220",
      services: ["App Service", "Application Insights"],
      security: { nsg: "active", firewall: "basic", ddos: "basic" },
      workloads: ["Staging Environment", "Pre-production Testing"]
    },
    {
      id: 6,
      name: "spoke-security-monitor",
      addressSpace: "10.3.0.0/24",
      environment: "security",
      hubNetworkId: 1,
      resourceGroupName: "rg-spoke-security",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "410.75",
      dataTransferTB: "0.125",
      services: ["Security Center", "Sentinel", "Key Vault"],
      security: { nsg: "strict", firewall: "premium", ddos: "premium" },
      workloads: ["Security Monitoring", "Threat Detection", "Compliance"]
    }
  ],
  connections: [
    { from: "hub", to: "spoke-1", status: "active", bandwidth: "1 Gbps", latency: "8ms" },
    { from: "hub", to: "spoke-2", status: "active", bandwidth: "1 Gbps", latency: "12ms" },
    { from: "hub", to: "spoke-3", status: "active", bandwidth: "2 Gbps", latency: "6ms" },
    { from: "hub", to: "spoke-4", status: "active", bandwidth: "500 Mbps", latency: "15ms" },
    { from: "hub", to: "spoke-5", status: "inactive", bandwidth: "500 Mbps", latency: "N/A" },
    { from: "hub", to: "spoke-6", status: "active", bandwidth: "1 Gbps", latency: "5ms" }
  ]
};

export default function NetworkTopology() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [viewMode, setViewMode] = useState("logical");
  const [filterEnvironment, setFilterEnvironment] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { data: spokeNetworks = networkElements.spokeNetworks } = useQuery({
    queryKey: ["/api/spoke-networks"],
  });

  const { data: hubNetworks = networkElements.hubNetworks } = useQuery({
    queryKey: ["/api/hub-networks"],
  });

  const { data: liveMetrics } = useQuery({
    queryKey: ["/api/live/network-metrics"],
    refetchInterval: 5000,
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleFullscreen = async () => {
    if (!isFullscreen && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.warn('Fullscreen not supported');
      }
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case "production":
        return "#0078d4"; // Azure blue
      case "development":
        return "#ffb900"; // Azure yellow
      case "staging":
        return "#5c2d91"; // Azure purple
      case "security":
        return "#d13438"; // Azure red
      default:
        return "#005a9e"; // Azure dark blue
    }
  };

  const getEnvironmentIcon = (environment: string) => {
    switch (environment) {
      case "production":
        return Database;
      case "development":
        return Globe;
      case "staging":
        return Clock;
      case "security":
        return Shield;
      default:
        return Network;
    }
  };

  const filteredSpokes = spokeNetworks.filter(spoke => 
    filterEnvironment === "all" || spoke.environment === filterEnvironment
  );

  const calculateNodePosition = (index: number, total: number, centerX: number, centerY: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / total;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const handleNodeClick = (node: any, type: string) => {
    setSelectedNode({ ...node, type });
    setShowNodeDetails(true);
  };

  return (
    <div ref={containerRef} className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
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
            <BreadcrumbPage>Network Topology</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            <AzureTopologyIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Network Topology</h1>
              <p className="text-gray-600">Visualize and manage your hub-and-spoke network architecture</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logical">Logical View</SelectItem>
                <SelectItem value="physical">Physical View</SelectItem>
                <SelectItem value="security">Security View</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEnvironment} onValueChange={setFilterEnvironment}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-1 border rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>

            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Main Topology Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gray-50">
          <svg
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center'
            }}
          >
            {/* Grid Background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.5"/>
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Hub Network */}
            <g>
              <circle
                cx="400"
                cy="300"
                r="60"
                fill="#0078d4"
                stroke="#004578"
                strokeWidth="3"
                filter="url(#glow)"
                className="cursor-pointer"
                onClick={() => handleNodeClick(hubNetworks[0], 'hub')}
              />
              <circle cx="400" cy="300" r="30" fill="#ffffff" opacity="0.3" />
              <text x="400" y="295" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                HUB
              </text>
              <text x="400" y="310" textAnchor="middle" fill="white" fontSize="10">
                {hubNetworks[0]?.addressSpace}
              </text>
              
              {/* Hub Status Indicator */}
              <circle cx="440" cy="260" r="8" fill="#00bcf2" className="animate-pulse" />
              <text x="440" y="250" textAnchor="middle" fill="#333" fontSize="10" fontWeight="bold">
                ACTIVE
              </text>
            </g>

            {/* Spoke Networks */}
            {filteredSpokes.map((spoke, index) => {
              const position = calculateNodePosition(index, filteredSpokes.length, 400, 300, 180);
              const color = getEnvironmentColor(spoke.environment);
              
              return (
                <g key={spoke.id}>
                  {/* Connection Line */}
                  <line
                    x1="400"
                    y1="300"
                    x2={position.x}
                    y2={position.y}
                    stroke={spoke.status === 'active' ? color : '#d1d5db'}
                    strokeWidth={spoke.status === 'active' ? '3' : '1'}
                    strokeDasharray={spoke.status === 'active' ? '0' : '5,5'}
                    opacity="0.7"
                  />
                  
                  {/* Data Flow Animation */}
                  {spoke.status === 'active' && (
                    <circle
                      r="3"
                      fill={color}
                      opacity="0.8"
                    >
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path={`M 400,300 L ${position.x},${position.y}`}
                      />
                    </circle>
                  )}

                  {/* Spoke Node */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="40"
                    fill={color}
                    stroke={spoke.status === 'active' ? '#ffffff' : '#9ca3af'}
                    strokeWidth="2"
                    className="cursor-pointer hover:r-45 transition-all"
                    onClick={() => handleNodeClick(spoke, 'spoke')}
                  />
                  
                  {/* Environment Icon Area */}
                  <circle cx={position.x} cy={position.y} r="20" fill="#ffffff" opacity="0.3" />
                  
                  {/* Environment Label */}
                  <text 
                    x={position.x} 
                    y={position.y - 5} 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="10" 
                    fontWeight="bold"
                  >
                    {spoke.environment.toUpperCase()}
                  </text>
                  <text 
                    x={position.x} 
                    y={position.y + 8} 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="8"
                  >
                    {spoke.addressSpace}
                  </text>

                  {/* Status Indicator */}
                  <circle 
                    cx={position.x + 25} 
                    cy={position.y - 25} 
                    r="6" 
                    fill={spoke.status === 'active' ? '#00d4aa' : '#ff4b4b'}
                    className={spoke.status === 'active' ? 'animate-pulse' : ''}
                  />

                  {/* Cost Indicator */}
                  <text 
                    x={position.x} 
                    y={position.y + 55} 
                    textAnchor="middle" 
                    fill="#374151" 
                    fontSize="10" 
                    fontWeight="bold"
                  >
                    ${spoke.monthlyCost}/mo
                  </text>
                </g>
              );
            })}

            {/* Network Statistics Overlay */}
            <g>
              <rect x="20" y="20" width="200" height="120" fill="white" fillOpacity="0.95" rx="8" stroke="#e5e7eb" />
              <text x="30" y="40" fill="#374151" fontSize="14" fontWeight="bold">Network Statistics</text>
              <text x="30" y="60" fill="#6b7280" fontSize="12">
                Total Networks: {hubNetworks.length + filteredSpokes.length}
              </text>
              <text x="30" y="80" fill="#6b7280" fontSize="12">
                Active Connections: {filteredSpokes.filter(s => s.status === 'active').length}
              </text>
              <text x="30" y="100" fill="#6b7280" fontSize="12">
                Total Cost: ${filteredSpokes.reduce((sum, s) => sum + parseFloat(s.monthlyCost), 0).toFixed(2)}/mo
              </text>
              <text x="30" y="120" fill="#6b7280" fontSize="12">
                Avg Latency: {liveMetrics?.latency?.toFixed(1) || '12.3'}ms
              </text>
            </g>
          </svg>

          {/* Zoom Level Indicator */}
          <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md border">
            <span className="text-sm font-medium">Zoom: {Math.round(zoomLevel * 100)}%</span>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-md border max-w-xs">
            <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span>Hub Network</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Production Environment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>Development Environment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                <span>Staging Environment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <span>Security Environment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-1 border-t-2 border-dashed border-gray-400"></div>
                <span>Inactive Connection</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Active Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {!isFullscreen && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Network Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hub Networks</span>
                        <span className="font-semibold">{hubNetworks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spoke Networks</span>
                        <span className="font-semibold">{spokeNetworks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Connections</span>
                        <span className="font-semibold">{spokeNetworks.filter(s => s.status === 'active').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Monthly Cost</span>
                        <span className="font-semibold text-green-600">
                          ${spokeNetworks.reduce((sum, s) => sum + parseFloat(s.monthlyCost), 0).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Environment Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {['production', 'development', 'staging', 'security'].map(env => {
                        const count = spokeNetworks.filter(s => s.environment === env).length;
                        const color = getEnvironmentColor(env);
                        return (
                          <div key={env} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className="capitalize text-gray-700">{env}</span>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Live Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Latency</span>
                        <span className="font-semibold">{liveMetrics?.latency?.toFixed(1) || '12.3'}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Throughput</span>
                        <span className="font-semibold">{liveMetrics?.throughput?.toFixed(1) || '2.4'} Gbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Packet Loss</span>
                        <span className="font-semibold text-green-600">0.01%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Availability</span>
                        <span className="font-semibold text-green-600">99.97%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Traffic Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Data Transfer</span>
                        <span className="font-semibold">
                          {spokeNetworks.reduce((sum, s) => sum + parseFloat(s.dataTransferTB), 0).toFixed(2)} TB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Peak Usage</span>
                        <span className="font-semibold">18:30 UTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Sessions</span>
                        <span className="font-semibold">1,247</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Security Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Network Security Groups</span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Azure Firewall</span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">DDoS Protection</span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Compliance Score</span>
                        <span className="font-semibold text-green-600">94%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Compliance Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {spokeNetworks.map(spoke => (
                        <div key={spoke.id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{spoke.name}</span>
                          <Badge variant={spoke.complianceStatus === 'compliant' ? 'default' : 'destructive'}>
                            {spoke.complianceStatus}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>

      {/* Node Details Modal */}
      <Dialog open={showNodeDetails} onOpenChange={setShowNodeDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              {selectedNode?.type === 'hub' ? (
                <AzureHubIcon className="w-6 h-6 text-blue-600" />
              ) : (
                <AzureSpokeIcon className="w-6 h-6" style={{ color: getEnvironmentColor(selectedNode?.environment) }} />
              )}
              <span>{selectedNode?.name}</span>
              <Badge variant={selectedNode?.status === 'active' ? 'default' : 'secondary'}>
                {selectedNode?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedNode && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Network Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address Space:</span>
                      <span className="font-mono">{selectedNode.addressSpace}</span>
                    </div>
                    {selectedNode.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span>{selectedNode.location}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resource Group:</span>
                      <span>{selectedNode.resourceGroupName}</span>
                    </div>
                    {selectedNode.environment && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Environment:</span>
                        <Badge style={{ backgroundColor: getEnvironmentColor(selectedNode.environment), color: 'white' }}>
                          {selectedNode.environment}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Performance & Cost */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance & Cost</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedNode.monthlyCost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Cost:</span>
                        <span className="font-semibold text-green-600">${selectedNode.monthlyCost}</span>
                      </div>
                    )}
                    {selectedNode.dataTransferTB && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data Transfer:</span>
                        <span className="font-mono">{selectedNode.dataTransferTB} TB</span>
                      </div>
                    )}
                    {selectedNode.connections && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Connections:</span>
                        <span className="font-semibold">{selectedNode.connections}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latency:</span>
                      <span className="font-mono">{(liveMetrics?.latency || 12).toFixed(1)}ms</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Services */}
              {selectedNode.services && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Deployed Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedNode.services.map((service: string, index: number) => (
                        <Badge key={index} variant="outline" className="justify-center">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Configuration */}
              {selectedNode.security && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">Network Security Group</div>
                        <div className="text-lg font-semibold capitalize">{selectedNode.security.nsg}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">Firewall</div>
                        <div className="text-lg font-semibold capitalize">{selectedNode.security.firewall}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">DDoS Protection</div>
                        <div className="text-lg font-semibold capitalize">{selectedNode.security.ddos}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Workloads */}
              {selectedNode.workloads && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Workloads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedNode.workloads.map((workload: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-gray-700">{workload}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}