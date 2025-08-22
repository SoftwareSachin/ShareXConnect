import { useState } from "react";
import { ChevronDown, Plus, Settings, CreditCard, Building, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import type { Subscription } from "@shared/schema";

interface SubscriptionSelectorProps {
  selectedSubscription?: string;
  onSubscriptionChange?: (subscriptionId: string) => void;
}

export default function SubscriptionSelector({ 
  selectedSubscription, 
  onSubscriptionChange 
}: SubscriptionSelectorProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(selectedSubscription || "");

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const handleSubscriptionChange = (value: string) => {
    setSelectedSub(value);
    onSubscriptionChange?.(value);
  };

  const selectedSubscriptionData = subscriptions?.find(sub => sub.id.toString() === selectedSub);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-fluent-neutral-60 mb-2 uppercase tracking-wide">
          Subscription
        </label>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subscription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>To add a new Azure subscription:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Go to Azure Portal</li>
                  <li>Navigate to Subscriptions</li>
                  <li>Copy the subscription ID</li>
                  <li>Configure access permissions</li>
                </ul>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Handle subscription creation
                  setCreateDialogOpen(false);
                }}>
                  Open Azure Portal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={selectedSub} onValueChange={handleSubscriptionChange}>
        <SelectTrigger className="w-full bg-fluent-neutral-10 border-fluent-neutral-30 text-fluent-neutral-90">
          <SelectValue placeholder="Select subscription" />
        </SelectTrigger>
        <SelectContent>
          {subscriptions?.map((subscription) => (
            <SelectItem key={subscription.id} value={subscription.id.toString()}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-azure-blue" />
                  <div>
                    <div className="font-medium">{subscription.name}</div>
                    <div className="text-xs text-gray-500">{subscription.subscriptionId}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </Badge>
                  {selectedSub === subscription.id.toString() && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedSubscriptionData && (
        <div className="bg-fluent-neutral-10 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="w-5 h-5 text-azure-blue" />
              <div>
                <h4 className="font-medium text-fluent-neutral-90">
                  {selectedSubscriptionData.name}
                </h4>
                <p className="text-sm text-fluent-neutral-60">
                  {selectedSubscriptionData.subscriptionId}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(selectedSubscriptionData.status)}`}>
              {selectedSubscriptionData.status}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-fluent-neutral-60">Region:</span>
              <p className="font-medium text-fluent-neutral-90">{selectedSubscriptionData.region}</p>
            </div>
            <div>
              <span className="text-fluent-neutral-60">Resource Group:</span>
              <p className="font-medium text-fluent-neutral-90">{selectedSubscriptionData.resourceGroup}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Configure
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
              <CreditCard className="w-3 h-3 mr-1" />
              Billing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}