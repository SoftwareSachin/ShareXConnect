import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Network, ShieldCheck, DollarSign, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";

interface DashboardMetrics {
  totalSpokes: number;
  securityCompliance: number;
  monthlyCost: number;
  dataTransfer: number;
}

// Azure-style metric icons
const AzureVNetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 3l6 3.5v7L10 17l-6-3.5v-7L10 3z"/>
    <path d="M10 5l4 2.5v5L10 15l-4-2.5v-5L10 5z"/>
  </svg>
);

const AzureSecurityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2l6 3v6.5c0 3.5-2.4 6.8-6 7.5-3.6-.7-6-4-6-7.5V5l6-3z"/>
    <path d="M8.5 10l1.5 1.5L13 8.5"/>
  </svg>
);

const AzureCostIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
    <path d="M10 6v2h2v2h-2v2h-2v-2H6V8h2V6h2z"/>
  </svg>
);

const AzureDataIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 7v10h14V7H3zm12 8H5V9h10v6z"/>
    <path d="M7 11h6v1H7v-1zm0 2h4v1H7v-1z"/>
    <path d="M17 3H3v2h14V3z"/>
  </svg>
);

export default function MetricsOverview() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-fluent-neutral-20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Active Spokes",
      value: metrics?.totalSpokes || 0,
      change: "+12%",
      changeType: "positive" as const,
      icon: AzureVNetIcon,
      iconBg: "bg-azure-blue bg-opacity-10",
      iconColor: "text-azure-blue",
    },
    {
      title: "Security Compliance",
      value: `${metrics?.securityCompliance || 0}%`,
      change: "100%",
      changeType: "positive" as const,
      icon: AzureSecurityIcon,
      iconBg: "bg-fluent-success bg-opacity-10",
      iconColor: "text-fluent-success",
    },
    {
      title: "Monthly Cost",
      value: `$${metrics?.monthlyCost?.toLocaleString() || 0}`,
      change: "+8%",
      changeType: "negative" as const,
      icon: AzureCostIcon,
      iconBg: "bg-fluent-warning bg-opacity-10",
      iconColor: "text-fluent-warning",
    },
    {
      title: "Data Transfer",
      value: `${metrics?.dataTransfer || 0} TB`,
      change: "+15%",
      changeType: "positive" as const,
      icon: AzureDataIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.changeType === "positive" ? TrendingUp : TrendingDown;
        return (
          <Card key={index} className="metric-card cursor-pointer border-fluent-neutral-30 hover:border-azure-blue transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.iconBg}`}>
                  <Icon className={`${card.iconColor}`} />
                </div>
                <div className="flex items-center space-x-1">
                  <TrendIcon className={`h-3 w-3 ${
                    card.changeType === "positive" 
                      ? "text-fluent-success" 
                      : "text-fluent-error"
                  }`} />
                  <span 
                    className={`text-sm font-medium ${
                      card.changeType === "positive" 
                        ? "text-fluent-success" 
                        : "text-fluent-error"
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-fluent-neutral-100 mb-1">
                {card.value}
              </h3>
              <p className="text-fluent-neutral-60 text-sm font-medium">{card.title}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
