import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  LayoutDashboard, 
  Settings
} from "lucide-react";
import { 
  AzureVirtualNetworkIcon, 
  AzureSecurityIcon, 
  AzureComplianceIcon, 
  AzureMonitorIcon, 
  AzureProvisionIcon,
  AzureTopologyIcon 
} from "@/components/ui/azure-icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import type { Subscription } from "@shared/schema";
import SubscriptionSelector from "@/components/subscription/subscription-selector";



const navigationItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/network-topology", label: "Network Topology", icon: AzureTopologyIcon },
  { href: "/provision-spoke", label: "Provision Spoke", icon: AzureProvisionIcon },
  { href: "/security-policies", label: "Security Policies", icon: AzureSecurityIcon },
  { href: "/monitoring", label: "Monitoring", icon: AzureMonitorIcon },
  { href: "/compliance", label: "Compliance", icon: AzureComplianceIcon },
  { href: "/health", label: "Network Health", icon: AzureVirtualNetworkIcon },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <nav className="w-64 bg-white border-r border-fluent-neutral-30 shadow-sm">
      <div className="p-4">
        <div className="mb-6">
          <SubscriptionSelector />
        </div>
        
        <div className="mb-4">
          <label className="block text-xs font-medium text-fluent-neutral-60 mb-2 uppercase tracking-wide">
            Navigation
          </label>
        </div>
        
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-colors cursor-pointer ${
                      isActive
                        ? "bg-azure-blue text-white shadow-sm"
                        : "text-fluent-neutral-90 hover:bg-fluent-neutral-20"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
