import { useState } from "react";
import { Plus, Settings, CreditCard, Building, Users, Globe, Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Subscription } from "@shared/schema";

const subscriptionSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  subscriptionId: z.string().uuid("Invalid subscription ID format"),
  region: z.string().min(1, "Region is required"),
  resourceGroup: z.string().min(1, "Resource group is required"),
  status: z.enum(["active", "trial", "expired", "suspended"]),
});

type SubscriptionForm = z.infer<typeof subscriptionSchema>;

export default function SubscriptionManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const form = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: "",
      subscriptionId: "",
      region: "",
      resourceGroup: "",
      status: "active",
    },
  });

  const createSubscription = useMutation({
    mutationFn: async (data: SubscriptionForm) => {
      return await apiRequest("/api/subscriptions", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Subscription Added",
        description: "Azure subscription has been successfully added to your account.",
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add subscription",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscriptionForm) => {
    createSubscription.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'trial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Azure Subscriptions</h2>
          <p className="text-gray-600">Manage your Azure subscriptions and billing</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-azure-blue hover:bg-azure-blue-dark">
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Azure Subscription</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Production Environment"
                    className="mt-1"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subscriptionId">Subscription ID</Label>
                  <Input
                    id="subscriptionId"
                    {...form.register("subscriptionId")}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="mt-1"
                  />
                  {form.formState.errors.subscriptionId && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.subscriptionId.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region">Primary Region</Label>
                  <Select onValueChange={(value) => form.setValue("region", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="East US">East US</SelectItem>
                      <SelectItem value="West US 2">West US 2</SelectItem>
                      <SelectItem value="Central US">Central US</SelectItem>
                      <SelectItem value="North Europe">North Europe</SelectItem>
                      <SelectItem value="West Europe">West Europe</SelectItem>
                      <SelectItem value="Southeast Asia">Southeast Asia</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.region && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.region.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="resourceGroup">Resource Group</Label>
                  <Input
                    id="resourceGroup"
                    {...form.register("resourceGroup")}
                    placeholder="rg-network-prod"
                    className="mt-1"
                  />
                  {form.formState.errors.resourceGroup && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.resourceGroup.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => form.setValue("status", value as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSubscription.isPending}>
                  {createSubscription.isPending ? "Adding..." : "Add Subscription"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {subscriptions?.map((subscription) => (
          <Card key={subscription.id} className="border-l-4 border-l-azure-blue">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building className="w-8 h-8 text-azure-blue" />
                  <div>
                    <CardTitle className="text-lg">{subscription.name}</CardTitle>
                    <CardDescription>
                      ID: {subscription.subscriptionId}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="access">Access</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Region</p>
                        <p className="font-medium">{subscription.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Resource Group</p>
                        <p className="font-medium">{subscription.resourceGroup}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium">{subscription.status}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="billing">
                  <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <p className="text-sm text-gray-600">Billing information is managed through Azure Portal</p>
                  </div>
                </TabsContent>
                <TabsContent value="access">
                  <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-500" />
                    <p className="text-sm text-gray-600">Access control is managed through Azure RBAC</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {subscriptions?.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
          <p className="text-gray-600 mb-4">Add your first Azure subscription to get started</p>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-azure-blue hover:bg-azure-blue-dark">
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
        </div>
      )}
    </div>
  );
}