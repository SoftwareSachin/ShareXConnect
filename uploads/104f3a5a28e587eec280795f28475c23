import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Plus, Eye, Edit, Trash2, AlertTriangle, CheckCircle, Globe, Lock, RefreshCw, Settings, Server, Network, FileText, Download, Filter } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSecurityPolicySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { SecurityPolicy } from "@shared/schema";

export default function SecurityPolicies() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: policies, isLoading, refetch } = useQuery<SecurityPolicy[]>({
    queryKey: ["/api/security-policies"],
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/security-policies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security-policies"] });
      toast({
        title: "Security Policy Created",
        description: "New security policy has been created and applied successfully.",
      });
      setOpenDialog(false);
      form.reset();
    },
  });

  const form = useForm({
    resolver: zodResolver(insertSecurityPolicySchema),
    defaultValues: {
      name: "",
      description: "",
      networkId: 1,
      networkType: "spoke",
      policyType: "firewall",
      rules: [],
      isActive: true,
      modifiedBy: "admin@company.com",
    },
  });

  const onSubmit = (data: any) => {
    // Add modifiedBy and ensure proper data format
    const policyData = {
      ...data,
      modifiedBy: "admin@company.com",
      rules: data.rules || []
    };
    createPolicyMutation.mutate(policyData);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Policies Refreshed",
      description: "Security policies have been refreshed successfully.",
    });
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      "Policy Name,Type,Network,Status,Description",
      ...firewallRules.map(rule => 
        `"${rule.name}","Firewall","${rule.source} -> ${rule.destination}","${rule.status}","${rule.action} ${rule.protocol}/${rule.destPort}"`
      ),
      ...nsgRules.map(rule => 
        `"${rule.name}","NSG","${rule.source} -> ${rule.destination}","${rule.status}","${rule.action} ${rule.protocol}/${rule.destPort}"`
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-policies-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Security policies have been exported to CSV format.",
    });
  };

  const handleReviewPolicy = (policyName: string) => {
    toast({
      title: "Policy Review",
      description: `Opening detailed review for ${policyName}`,
    });
  };

  const handleApplyFix = (issue: string) => {
    toast({
      title: "Applying Security Fix",
      description: `Implementing recommended fix for: ${issue}`,
    });
  };

  const handleViewSettings = (setting: string) => {
    toast({
      title: "Opening Settings",
      description: `Navigating to ${setting} configuration`,
    });
  };

  const handleViewRule = (ruleName: string) => {
    toast({
      title: "Rule Details",
      description: `Opening detailed view for rule: ${ruleName}`,
    });
  };

  const handleEditRule = (ruleName: string) => {
    toast({
      title: "Edit Rule",
      description: `Opening editor for rule: ${ruleName}`,
    });
  };

  const handleDeleteRule = (ruleName: string) => {
    toast({
      title: "Delete Rule",
      description: `Are you sure you want to delete rule: ${ruleName}? This action cannot be undone.`,
    });
  };

  const handleFilter = () => {
    toast({
      title: "Filter Applied",
      description: "Filtering rules based on selected criteria",
    });
  };

  // Firewall rules data for comprehensive Azure-style interface
  const firewallRules = [
    {
      id: 1,
      name: "Allow-HTTPS-Inbound",
      direction: "Inbound",
      priority: 100,
      source: "Internet",
      destination: "VirtualNetwork",
      destPort: "443",
      protocol: "TCP",
      action: "Allow",
      status: "Active",
      hits: "1,234,567",
      lastModified: "2024-01-10"
    },
    {
      id: 2,
      name: "Allow-SSH-Management",
      direction: "Inbound", 
      priority: 110,
      source: "10.0.0.0/8",
      destination: "VirtualNetwork",
      destPort: "22",
      protocol: "TCP",
      action: "Allow",
      status: "Active",
      hits: "45,678",
      lastModified: "2024-01-08"
    },
    {
      id: 3,
      name: "Deny-RDP-Internet",
      direction: "Inbound",
      priority: 200,
      source: "Internet",
      destination: "VirtualNetwork", 
      destPort: "3389",
      protocol: "TCP",
      action: "Deny",
      status: "Active",
      hits: "23,456",
      lastModified: "2024-01-05"
    },
    {
      id: 4,
      name: "Allow-HTTP-Internal",
      direction: "Inbound",
      priority: 120,
      source: "VirtualNetwork",
      destination: "VirtualNetwork",
      destPort: "80",
      protocol: "TCP", 
      action: "Allow",
      status: "Active",
      hits: "789,012",
      lastModified: "2024-01-12"
    },
    {
      id: 5,
      name: "Block-Suspicious-Traffic",
      direction: "Inbound",
      priority: 500,
      source: "185.220.0.0/16",
      destination: "VirtualNetwork",
      destPort: "*",
      protocol: "*",
      action: "Deny",
      status: "Warning",
      hits: "5,432",
      lastModified: "2024-01-11"
    }
  ];

  const nsgRules = [
    {
      id: 1,
      name: "AllowVnetInBound",
      direction: "Inbound",
      priority: 65000,
      source: "VirtualNetwork",
      destination: "VirtualNetwork", 
      destPort: "*",
      protocol: "*",
      action: "Allow",
      status: "System",
      hits: "N/A"
    },
    {
      id: 2,
      name: "AllowAzureLoadBalancerInBound",
      direction: "Inbound",
      priority: 65001,
      source: "AzureLoadBalancer",
      destination: "*",
      destPort: "*", 
      protocol: "*",
      action: "Allow",
      status: "System",
      hits: "N/A"
    },
    {
      id: 3,
      name: "DenyAllInBound",
      direction: "Inbound",
      priority: 65500,
      source: "*",
      destination: "*",
      destPort: "*",
      protocol: "*",
      action: "Deny",
      status: "System", 
      hits: "N/A"
    },
    {
      id: 4,
      name: "Custom-Database-Access",
      direction: "Inbound",
      priority: 1000,
      source: "10.1.0.0/24",
      destination: "10.3.0.0/24",
      destPort: "1433",
      protocol: "TCP",
      action: "Allow",
      status: "Active",
      hits: "67,890"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        );
      case "system":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
            <Settings className="h-3 w-3 mr-1" />
            System
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            {status}
          </Badge>
        );
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "allow":
        return "text-green-600 dark:text-green-400";
      case "deny":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <>
      <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 dark:text-gray-100 font-medium">Security Policies</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Shield className="h-7 w-7 mr-3 text-blue-600 dark:text-blue-400" />
              Security Policies
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage firewall rules, network security groups, and access policies
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Create Security Policy
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    Create a new security policy to protect your network resources
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Policy Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Allow-HTTPS-Inbound" 
                                {...field} 
                                className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="policyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Policy Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="firewall">Azure Firewall</SelectItem>
                                <SelectItem value="nsg">Network Security Group</SelectItem>
                                <SelectItem value="waf">Web Application Firewall</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Policy description and purpose"
                              {...field}
                              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="networkType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Network Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hub">Hub Network</SelectItem>
                                <SelectItem value="spoke">Spoke Network</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="networkId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Network ID</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                                className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpenDialog(false)}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createPolicyMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {createPolicyMutation.isPending ? "Creating..." : "Create Policy"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300">
              Overview
            </TabsTrigger>
            <TabsTrigger value="firewall" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300">
              Firewall Rules
            </TabsTrigger>
            <TabsTrigger value="nsg" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300">
              NSG Rules
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Security Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Healthy</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {policies ? policies.filter(p => p.isActive).length : 12}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Policies</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Review</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">3</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Require Review</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {policies ? policies.length : 15}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Policies</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Network className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Coverage</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">98.5%</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Network Coverage</p>
                </CardContent>
              </Card>
            </div>

            {/* Security Recommendations */}
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                  Security Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          RDP Access Detected from Internet
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          RDP access from internet sources detected in production spoke networks. This poses a security risk and should be restricted to management networks only.
                        </p>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleReviewPolicy("RDP Access Policy")}
                            className="text-yellow-700 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-300 dark:border-yellow-600 dark:hover:bg-yellow-900/30"
                          >
                            Review Policy
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleApplyFix("RDP Internet Access")}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            Apply Fix
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          HTTPS Enforcement Active
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          All web traffic is properly secured with HTTPS enforcement policies. SSL/TLS termination is configured correctly across all endpoints.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          DDoS Protection Standard Enabled
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          DDoS Protection Standard is active and providing enhanced protection against volumetric attacks. Consider enabling Always-On traffic monitoring.
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewSettings("DDoS Protection")}
                          className="text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/30"
                        >
                          View Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Firewall Rules Tab */}
          <TabsContent value="firewall">
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
                    <Server className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                    Azure Firewall Rules
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleFilter}
                      className="border-gray-300 dark:border-gray-600"
                    >
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Rule Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Direction</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Priority</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Source</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Destination</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Port</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Protocol</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Action</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Hits</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {firewallRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{rule.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.direction}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.priority}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.source}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.destination}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.destPort}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.protocol}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${getActionColor(rule.action)}`}>
                              {rule.action}
                            </span>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(rule.status)}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.hits}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewRule(rule.name)}
                                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                title="View rule details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditRule(rule.name)}
                                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                title="Edit rule"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteRule(rule.name)}
                                className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Delete rule"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NSG Rules Tab */}
          <TabsContent value="nsg">
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center">
                  <Network className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Network Security Group Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Rule Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Direction</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Priority</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Source</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Destination</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Port</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Protocol</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Action</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {nsgRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{rule.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.direction}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.priority}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.source}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.destination}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.destPort}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{rule.protocol}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${getActionColor(rule.action)}`}>
                              {rule.action}
                            </span>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(rule.status)}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewRule(rule.name)}
                                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                title="View NSG rule details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditRule(rule.name)}
                                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                title="Edit NSG rule"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteRule(rule.name)}
                                className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Delete NSG rule"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-gray-900 dark:text-gray-100">Traffic Analysis</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport()}
                      className="border-gray-300 dark:border-gray-600"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      onClick={() => handleViewRule("Allowed Traffic Analysis")}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Allowed Traffic</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">2.4M packets</span>
                    </div>
                    <div 
                      onClick={() => handleViewRule("Blocked Threats Analysis")}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Blocked Threats</span>
                      <span className="text-red-600 dark:text-red-400 font-bold">156K packets</span>
                    </div>
                    <div 
                      onClick={() => handleViewRule("Geographic Analysis")}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Top Source Country</span>
                      <span className="text-gray-900 dark:text-gray-100 font-bold">United States</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-gray-900 dark:text-gray-100">Security Events</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRefresh}
                      className="border-gray-300 dark:border-gray-600"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      onClick={() => handleViewRule("High Risk Security Events")}
                      className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <span className="text-red-700 dark:text-red-300 font-medium">High Risk Events</span>
                      <span className="text-red-600 dark:text-red-400 font-bold">2</span>
                    </div>
                    <div 
                      onClick={() => handleViewRule("Medium Risk Security Events")}
                      className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                    >
                      <span className="text-yellow-700 dark:text-yellow-300 font-medium">Medium Risk Events</span>
                      <span className="text-yellow-600 dark:text-yellow-400 font-bold">14</span>
                    </div>
                    <div 
                      onClick={() => handleViewRule("Informational Security Events")}
                      className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Informational</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">89</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}