import { useState } from "react";
import { Search, Clock, Hash, Globe, Shield, Server, Database } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import type { SpokeNetwork, HubNetwork, SecurityPolicy } from "@shared/schema";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "spoke" | "hub" | "policy" | "subscription" | "resource";
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
}

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches] = useState([
    "Virtual Network Gateway",
    "Security Policy Rules",
    "Spoke Network Configuration",
    "Hub Network Settings"
  ]);

  const { data: spokeNetworks } = useQuery<SpokeNetwork[]>({
    queryKey: ["/api/spoke-networks"],
  });

  const { data: hubNetworks } = useQuery<HubNetwork[]>({
    queryKey: ["/api/hub-networks"],
  });

  const { data: securityPolicies } = useQuery<SecurityPolicy[]>({
    queryKey: ["/api/security-policies"],
  });

  const generateSearchResults = (): SearchResult[] => {
    const results: SearchResult[] = [];
    
    // Add spoke networks
    spokeNetworks?.forEach(spoke => {
      if (spoke.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          spoke.region.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({
          id: `spoke-${spoke.id}`,
          title: spoke.name,
          description: `Spoke Network in ${spoke.region} - ${spoke.addressSpace}`,
          type: "spoke",
          category: "Network",
          icon: Globe,
          path: `/network-topology?spoke=${spoke.id}`
        });
      }
    });

    // Add hub networks
    hubNetworks?.forEach(hub => {
      if (hub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          hub.region.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({
          id: `hub-${hub.id}`,
          title: hub.name,
          description: `Hub Network in ${hub.region} - ${hub.addressSpace}`,
          type: "hub",
          category: "Network",
          icon: Server,
          path: `/network-topology?hub=${hub.id}`
        });
      }
    });

    // Add security policies
    securityPolicies?.forEach(policy => {
      if (policy.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          policy.policyType.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({
          id: `policy-${policy.id}`,
          title: policy.name,
          description: `${policy.policyType} Policy - ${policy.description}`,
          type: "policy",
          category: "Security",
          icon: Shield,
          path: `/security-policies?policy=${policy.id}`
        });
      }
    });

    // Add static Azure resources based on search
    const staticResults: SearchResult[] = [
      {
        id: "resource-vnet",
        title: "Virtual Networks",
        description: "Manage Azure virtual networks and subnets",
        type: "resource",
        category: "Networking",
        icon: Globe,
        path: "/network-topology"
      },
      {
        id: "resource-nsg",
        title: "Network Security Groups",
        description: "Configure network security rules and policies",
        type: "resource",
        category: "Security",
        icon: Shield,
        path: "/security-policies"
      },
      {
        id: "resource-monitoring",
        title: "Azure Monitor",
        description: "Monitor network performance and health",
        type: "resource",
        category: "Monitoring",
        icon: Database,
        path: "/monitoring"
      }
    ];

    staticResults.forEach(result => {
      if (result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push(result);
      }
    });

    return results.slice(0, 8); // Limit to 8 results
  };

  const searchResults = searchQuery.length > 0 ? generateSearchResults() : [];

  const handleResultClick = (result: SearchResult) => {
    if (result.path) {
      window.location.href = result.path;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Resources
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for resources, networks, policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="h-96">
            {searchQuery.length === 0 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => setSearchQuery(search)}
                      >
                        <div className="flex items-center gap-3">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{search}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <Button
                      key={result.id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-4 hover:bg-gray-50"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <result.icon className="w-5 h-5 text-azure-blue mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{result.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {result.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{result.description}</p>
                        </div>
                      </div>
                    </Button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}