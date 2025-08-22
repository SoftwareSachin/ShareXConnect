import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Code, Shield, BarChart, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

// Azure-style action icons
const AzureProvisionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2l6 3.5v9L10 18l-6-3.5v-9L10 2z"/>
    <path d="M10 6v8M6 10h8"/>
  </svg>
);

const AzureTemplateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 4h12v12H4V4zm2 2v8h8V6H6z"/>
    <path d="M8 8h4v1H8V8zm0 2h4v1H8v-1zm0 2h2v1H8v-1z"/>
  </svg>
);

const AzureShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2l6 3v6.5c0 3.5-2.4 6.8-6 7.5-3.6-.7-6-4-6-7.5V5l6-3z"/>
    <path d="M8 10l2 2 4-4"/>
  </svg>
);

const AzureReportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 3h12v14H4V3zm2 2v10h8V5H6z"/>
    <path d="M8 7h4v1H8V7zm0 2h4v1H8V9zm0 2h2v1H8v-1z"/>
  </svg>
);

const quickActions = [
  {
    title: "Provision New Spoke",
    description: "Create a new spoke network with automated configuration",
    icon: AzureProvisionIcon,
    iconBg: "bg-azure-blue bg-opacity-10",
    iconColor: "text-azure-blue",
    href: "/provision-spoke",
  },
  {
    title: "Generate ARM Template",
    description: "Export infrastructure as code templates",
    icon: AzureTemplateIcon,
    iconBg: "bg-fluent-success bg-opacity-10",
    iconColor: "text-fluent-success",
    href: "/provision-spoke",
  },
  {
    title: "Security Policy Review",
    description: "Review and update firewall and NSG rules",
    icon: AzureShieldIcon,
    iconBg: "bg-fluent-warning bg-opacity-10",
    iconColor: "text-fluent-warning",
    href: "/security-policies",
  },
  {
    title: "Generate Compliance Report",
    description: "Create audit reports for PCI, ISO compliance",
    icon: AzureReportIcon,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    href: "/compliance",
  },
];

export default function QuickActions() {
  const [, setLocation] = useLocation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-fluent-neutral-100">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div 
                key={index}
                className="border border-fluent-neutral-30 rounded-lg p-4 hover:border-azure-blue hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => setLocation(action.href)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.iconBg} group-hover:scale-105 transition-transform`}>
                      <Icon className={action.iconColor} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-fluent-neutral-100 group-hover:text-azure-blue transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-fluent-neutral-60 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-fluent-neutral-40 group-hover:text-azure-blue transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
