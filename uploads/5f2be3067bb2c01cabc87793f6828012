import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PlusCircle, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Activity } from "@shared/schema";

// Azure-style status icons
const AzureSuccessIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.1"/>
    <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm3.5 4.5L7 11 4.5 8.5l1-1L7 9l4.5-4.5 1 1z"/>
  </svg>
);

const AzureWarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.1"/>
    <path d="M8 2L2 14h12L8 2zm0 3l3.5 7h-7L8 5z"/>
    <circle cx="8" cy="11" r="0.5"/>
    <path d="M8 7v3"/>
  </svg>
);

export default function RecentActivities() {
  const [, setLocation] = useLocation();
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "spoke_provisioned":
        return PlusCircle;
      case "security_policy_updated":
        return Shield;
      case "compliance_drift_detected":
        return AlertTriangle;
      default:
        return PlusCircle;
    }
  };

  const getActivityIconColor = (activityType: string) => {
    switch (activityType) {
      case "spoke_provisioned":
        return "text-fluent-success";
      case "security_policy_updated":
        return "text-azure-blue";
      case "compliance_drift_detected":
        return "text-fluent-warning";
      default:
        return "text-azure-blue";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-fluent-success bg-opacity-10 text-fluent-success border-fluent-success border-opacity-20 font-medium">✓ Completed</Badge>;
      case "applied":
        return <Badge className="bg-fluent-success bg-opacity-10 text-fluent-success border-fluent-success border-opacity-20 font-medium">✓ Applied</Badge>;
      case "attention_required":
        return <Badge className="bg-fluent-warning bg-opacity-10 text-fluent-warning border-fluent-warning border-opacity-20 font-medium">⚠ Attention Required</Badge>;
      default:
        return <Badge className="font-medium">{status}</Badge>;
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours === 1) return "1 hour ago";
    return `${diffInHours} hours ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-fluent-neutral-20 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-fluent-neutral-100">
          Recent Activities
        </CardTitle>
        <Button 
          variant="link" 
          className="azure-blue hover:text-azure-blue-dark text-sm font-medium p-0"
          onClick={() => setLocation("/monitoring")}
        >
          View All Activities <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-fluent-neutral-30">
                <th className="text-left py-3 px-4 font-medium text-fluent-neutral-90 text-sm">Activity</th>
                <th className="text-left py-3 px-4 font-medium text-fluent-neutral-90 text-sm">Resource</th>
                <th className="text-left py-3 px-4 font-medium text-fluent-neutral-90 text-sm">User</th>
                <th className="text-left py-3 px-4 font-medium text-fluent-neutral-90 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-fluent-neutral-90 text-sm">Time</th>
              </tr>
            </thead>
            <tbody>
              {activities?.map((activity) => {
                const Icon = getActivityIcon(activity.activityType);
                const iconColor = getActivityIconColor(activity.activityType);
                
                return (
                  <tr key={activity.id} className="border-b border-fluent-neutral-20 hover:bg-fluent-neutral-10">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                        <span className="text-sm">{activity.description}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-fluent-neutral-90">
                      {activity.resourceName}
                    </td>
                    <td className="py-3 px-4 text-sm text-fluent-neutral-90">
                      {activity.userName}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(activity.status)}
                    </td>
                    <td className="py-3 px-4 text-sm text-fluent-neutral-60">
                      {formatTimeAgo(activity.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
