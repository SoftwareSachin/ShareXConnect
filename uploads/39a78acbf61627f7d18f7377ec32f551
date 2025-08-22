import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Server, Circle, Shield, Database, Lock, Globe, Info, Activity, Wifi } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import type { SpokeNetwork } from "@shared/schema";
import { AzureStatusIcon } from "@/components/ui/azure-icons";

// Azure-style network icons
const AzureHubIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 4l8 4v16l-8 4-8-4V8l8-4z"/>
    <path d="M16 8l4 2v8l-4 2-4-2v-8l4-2z"/>
    <circle cx="16" cy="16" r="2"/>
  </svg>
);

const AzureSpokeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8"/>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v4M12 18v4M22 12h-4M6 12H2"/>
  </svg>
);

export default function NetworkTopologyViewer() {
  const [, setLocation] = useLocation();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data: spokeNetworks } = useQuery<SpokeNetwork[]>({
    queryKey: ["/api/spoke-networks"],
  });

  const { data: liveMetrics } = useQuery({
    queryKey: ["/api/live/network-metrics"],
    refetchInterval: 5000,
  });

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case "production":
        return "bg-fluent-success text-white";
      case "development":
        return "bg-fluent-warning text-white";
      case "staging":
        return "bg-purple-600 text-white";
      case "security":
        return "bg-fluent-error text-white";
      default:
        return "bg-azure-blue text-white";
    }
  };

  const getEnvironmentIcon = (environment: string) => {
    switch (environment) {
      case "security":
        return Shield;
      case "production":
        return Database;
      case "development":
        return Globe;
      default:
        return Circle;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-fluent-neutral-100">
          Network Topology
        </CardTitle>
        <Button 
          variant="link" 
          className="azure-blue hover:text-azure-blue-dark text-sm font-medium p-0"
          onClick={() => setLocation("/network-topology")}
        >
          View Full Topology <ExternalLink className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative bg-fluent-neutral-10 rounded-lg p-8 min-h-96">
          {/* Hub */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div 
              className="network-node bg-azure-blue text-white p-6 rounded-lg shadow-lg text-center cursor-pointer hover:bg-azure-blue-dark transition-colors relative group"
              onClick={() => {
                setSelectedNode({
                  type: 'hub',
                  name: 'Hub VNet',
                  addressSpace: '10.0.0.0/16',
                  location: 'East US',
                  connections: spokeNetworks?.length || 0,
                  status: 'Active',
                  latency: liveMetrics?.latency || 12,
                  throughput: liveMetrics?.throughput || 2.4,
                });
                setShowDetails(true);
              }}
            >
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <AzureHubIcon />
              <div className="text-sm font-semibold mt-2">Hub VNet</div>
              <div className="text-xs opacity-90">10.0.0.0/16</div>
              <div className="text-xs opacity-75 mt-1">East US</div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-20 p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-xs flex items-center justify-center space-x-2">
                  <Activity className="h-3 w-3" />
                  <span>{liveMetrics?.latency || 12}ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Spokes */}
          {spokeNetworks?.map((spoke, index) => {
            const positions = [
              { top: "16px", left: "16px" }, // top-left
              { top: "16px", right: "16px" }, // top-right
              { bottom: "16px", left: "20px" }, // bottom-left
              { bottom: "16px", right: "20px" }, // bottom-right
            ];
            
            const position = positions[index % positions.length];
            const EnvironmentIcon = getEnvironmentIcon(spoke.environment);
            
            return (
              <div key={spoke.id} className="absolute" style={position}>
                <div 
                  className={`network-node p-4 rounded-lg shadow-md text-center cursor-pointer hover:scale-105 transition-transform relative group ${getEnvironmentColor(spoke.environment)}`}
                  onClick={() => {
                    setSelectedNode({
                      type: 'spoke',
                      ...spoke,
                      connections: 1, // Connected to hub
                      latency: (liveMetrics?.latency || 12) + Math.random() * 5,
                      throughput: (liveMetrics?.throughput || 2.4) * 0.3,
                    });
                    setShowDetails(true);
                  }}
                >
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${spoke.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <EnvironmentIcon className="text-lg mb-2 mx-auto h-5 w-5" />
                  <div className="text-xs font-semibold capitalize">{spoke.environment}</div>
                  <div className="text-xs opacity-90">{spoke.addressSpace}</div>
                  <div className="text-xs opacity-75 mt-1 flex items-center">
                    <AzureStatusIcon 
                      className="w-3 h-3 mr-1" 
                      status={spoke.complianceStatus === "compliant" ? "active" : "warning"} 
                    />
                    {spoke.complianceStatus === "compliant" ? "Compliant" : "Review Required"}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-20 p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-xs flex items-center justify-center space-x-1">
                      <Wifi className="h-3 w-3" />
                      <span>${spoke.monthlyCost}</span>
                    </div>
                  </div>
                </div>
                
                {/* Connection line */}
                <svg className="absolute pointer-events-none" viewBox="0 0 200 200" style={{
                  width: index < 2 ? "120px" : "120px",
                  height: index < 2 ? "120px" : "120px",
                  [index === 0 ? "top" : index === 1 ? "top" : "bottom"]: index < 2 ? "32px" : "32px",
                  [index === 0 || index === 2 ? "left" : "right"]: index % 2 === 0 ? "48px" : "48px",
                }}>
                  <line 
                    x1={index % 2 === 0 ? 0 : 120} 
                    y1={index < 2 ? 0 : 120} 
                    x2={index % 2 === 0 ? 90 : 30} 
                    y2={index < 2 ? 80 : 40} 
                    stroke="var(--azure-blue)" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"
                    opacity="0.7"
                  />
                  <circle 
                    cx={index % 2 === 0 ? 90 : 30} 
                    cy={index < 2 ? 80 : 40} 
                    r="2" 
                    fill="var(--azure-blue)"
                    opacity="0.8"
                  />
                </svg>
              </div>
            );
          })}
        </div>

        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {selectedNode?.type === 'hub' ? (
                  <Server className="h-5 w-5 text-azure-blue" />
                ) : (
                  React.createElement(getEnvironmentIcon(selectedNode?.environment || ""), { className: "h-5 w-5" })
                )}
                <span>{selectedNode?.name}</span>
                <Badge className={selectedNode?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {selectedNode?.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            {selectedNode && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-fluent-neutral-100">Network Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-fluent-neutral-60">Address Space:</span>
                        <span className="font-mono">{selectedNode.addressSpace}</span>
                      </div>
                      {selectedNode.location && (
                        <div className="flex justify-between">
                          <span className="text-fluent-neutral-60">Location:</span>
                          <span>{selectedNode.location}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-fluent-neutral-60">Connections:</span>
                        <span>{selectedNode.connections}</span>
                      </div>
                      {selectedNode.environment && (
                        <div className="flex justify-between">
                          <span className="text-fluent-neutral-60">Environment:</span>
                          <span className="capitalize">{selectedNode.environment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-fluent-neutral-100">Performance Metrics</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-fluent-neutral-60">Latency:</span>
                        <span className="font-mono">{selectedNode.latency?.toFixed(1)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fluent-neutral-60">Throughput:</span>
                        <span className="font-mono">{selectedNode.throughput?.toFixed(1)} Gbps</span>
                      </div>
                      {selectedNode.monthlyCost && (
                        <div className="flex justify-between">
                          <span className="text-fluent-neutral-60">Monthly Cost:</span>
                          <span className="font-mono">${selectedNode.monthlyCost}</span>
                        </div>
                      )}
                      {selectedNode.complianceStatus && (
                        <div className="flex justify-between">
                          <span className="text-fluent-neutral-60">Compliance:</span>
                          <Badge className={selectedNode.complianceStatus === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {selectedNode.complianceStatus}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedNode.type === 'spoke' && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-fluent-neutral-100">Security Configuration</h4>
                    <div className="bg-fluent-neutral-10 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium mb-2">Network Security Groups</div>
                          <div className="space-y-1 text-fluent-neutral-70">
                            <div>• Allow HTTPS (443)</div>
                            <div>• Allow SSH from Hub (22)</div>
                            <div>• Deny all other inbound</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium mb-2">Peering Configuration</div>
                          <div className="space-y-1 text-fluent-neutral-70">
                            <div>• Hub peering: Active</div>
                            <div>• Gateway transit: Disabled</div>
                            <div>• Forwarded traffic: Allowed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                  <Button className="bg-azure-blue hover:bg-azure-blue-dark text-white">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Portal
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
