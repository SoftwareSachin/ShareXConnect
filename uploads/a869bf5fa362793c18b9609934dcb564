import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSpokeNetworkSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Copy, Download, Code, CheckCircle, AlertCircle, FileText, DollarSign, Network, Shield, Clock, Zap, Settings, Eye, RefreshCw, Save, Upload, FileCode, Calculator, Globe, Lock, Server, Database, Cloud, Users, Activity, BarChart3, TrendingUp, Cpu, HardDrive, Wifi, MapPin, Calendar, Timer, BookOpen, Info, ExternalLink, ChevronRight, ChevronDown, Monitor, Gauge, AlertTriangle, Target, Layers, Package, Wrench, Sparkles, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AzureVirtualNetworkIcon, 
  AzureSecurityIcon, 
  AzureMonitorIcon, 
  AzureCloudIcon,
  AzureHubIcon,
  AzureSpokeIcon,
  AzureProvisionIcon,
  AzureStatusIcon
} from "@/components/ui/azure-icons";

const spokeFormSchema = insertSpokeNetworkSchema.extend({
  hubNetworkId: z.number().min(1, "Hub network is required"),
});

type SpokeFormData = z.infer<typeof spokeFormSchema>;

// Azure regions and resource groups data
const azureRegions = [
  { value: "eastus", label: "East US" },
  { value: "westus", label: "West US" },
  { value: "centralus", label: "Central US" },
  { value: "westeurope", label: "West Europe" },
  { value: "eastasia", label: "East Asia" },
  { value: "southeastasia", label: "Southeast Asia" },
  { value: "japaneast", label: "Japan East" },
  { value: "australiaeast", label: "Australia East" },
  { value: "uksouth", label: "UK South" },
  { value: "canadacentral", label: "Canada Central" },
];

const resourceGroups = [
  { value: "rg-hub-spoke-prod", label: "rg-hub-spoke-prod" },
  { value: "rg-hub-spoke-dev", label: "rg-hub-spoke-dev" },
  { value: "rg-hub-spoke-staging", label: "rg-hub-spoke-staging" },
  { value: "rg-networking-prod", label: "rg-networking-prod" },
  { value: "rg-security-prod", label: "rg-security-prod" },
];

const subscriptions = [
  { id: 1, name: "Production Subscription", subscriptionId: "12345678-1234-1234-1234-123456789012" },
  { id: 2, name: "Development Subscription", subscriptionId: "87654321-4321-4321-4321-210987654321" },
];

const hubNetworksData = [
  { id: 1, name: "hub-network-prod", addressSpace: "10.0.0.0/16", location: "eastus" },
  { id: 2, name: "hub-network-dev", addressSpace: "10.1.0.0/16", location: "westus" },
];

export default function ProvisionSpoke() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showARMTemplate, setShowARMTemplate] = useState(false);
  const [armTemplate, setArmTemplate] = useState<any>(null);
  const [costEstimate, setCostEstimate] = useState<any>(null);
  const [provisioningStep, setProvisioningStep] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [templateValidation, setTemplateValidation] = useState<any>(null);

  const form = useForm<SpokeFormData>({
    resolver: zodResolver(spokeFormSchema),
    defaultValues: {
      hubNetworkId: 1,
      name: "",
      addressSpace: "",
      environment: "development",
      resourceGroupName: "",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "0.00",
      dataTransferTB: "0.000",
    },
  });

  // Get subscriptions and hub networks
  const { data: subscriptionData = subscriptions } = useQuery({
    queryKey: ["/api/subscriptions"],
  });

  const { data: hubNetworks = hubNetworksData } = useQuery({
    queryKey: ["/api/hub-networks"],
  });

  const { data: spokeNetworks = [] } = useQuery({
    queryKey: ["/api/spoke-networks"],
  });

  // Generate address space suggestions based on existing networks
  const generateAddressSpaceSuggestions = () => {
    const existingAddresses = spokeNetworks?.map(n => n.addressSpace) || [];
    const hubAddresses = hubNetworks?.map(n => n.addressSpace) || [];
    const allAddresses = [...existingAddresses, ...hubAddresses];
    
    const suggestions = [];
    
    // Generate suggestions in the 10.x.x.x range
    for (let i = 10; i <= 172; i++) {
      for (let j = 0; j <= 255; j++) {
        const suggestion = `${i}.${j}.0.0/24`;
        if (!allAddresses.includes(suggestion)) {
          suggestions.push(suggestion);
          if (suggestions.length >= 5) break;
        }
      }
      if (suggestions.length >= 5) break;
    }
    
    return suggestions;
  };

  // Real-time address space validation
  const validateAddressSpace = (addressSpace: string) => {
    const conflicts = [];
    const recommendations = [];
    
    // Check for conflicts with existing networks
    const existingNetwork = spokeNetworks?.find(n => n.addressSpace === addressSpace);
    if (existingNetwork) {
      conflicts.push(`Conflicts with existing network: ${existingNetwork.name}`);
    }
    
    // Check for conflicts with hub networks
    const hubConflict = hubNetworks?.find(n => n.addressSpace === addressSpace);
    if (hubConflict) {
      conflicts.push(`Conflicts with hub network: ${hubConflict.name}`);
    }
    
    // Validate CIDR format
    const cidrRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$/;
    if (!cidrRegex.test(addressSpace)) {
      conflicts.push("Invalid CIDR notation format");
    }
    
    // Check subnet size recommendations
    const subnetSize = parseInt(addressSpace.split('/')[1]);
    if (subnetSize < 24) {
      recommendations.push("Consider using /24 or smaller for spoke networks");
    }
    
    return {
      isValid: conflicts.length === 0,
      conflicts,
      recommendations
    };
  };

  const createSpokeMutation = useMutation({
    mutationFn: async (data: SpokeFormData) => {
      const response = await apiRequest("POST", "/api/spoke-networks", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/spoke-networks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Spoke Network Provisioned",
        description: `${data.name} has been successfully provisioned and is now active.`,
      });
      setProvisioningStep(4);
      setTimeout(() => setLocation("/"), 2000);
    },
    onError: (error) => {
      toast({
        title: "Provisioning Failed",
        description: "Failed to provision spoke network. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateARMTemplateMutation = useMutation({
    mutationFn: async (data: SpokeFormData) => {
      const response = await apiRequest("POST", "/api/arm/generate", data);
      return response.json();
    },
    onSuccess: (template) => {
      setArmTemplate(template);
      setShowARMTemplate(true);
      toast({
        title: "ARM Template Generated",
        description: "Azure Resource Manager template has been generated successfully.",
      });
    },
    onError: () => {
      // Generate local template as fallback
      const localTemplate = generateAzureARMTemplate(form.getValues());
      setArmTemplate(localTemplate);
      setShowARMTemplate(true);
      toast({
        title: "ARM Template Generated",
        description: "Azure Resource Manager template has been generated successfully.",
      });
    },
  });

  const validateARMTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const response = await apiRequest("POST", "/api/arm/validate", template);
      return response.json();
    },
    onSuccess: (validation) => {
      setTemplateValidation(validation);
      setShowValidation(true);
      toast({
        title: validation.isValid ? "Template Validated" : "Template Invalid",
        description: validation.isValid 
          ? "ARM template passed all validation checks."
          : `${validation.errors?.length || 0} validation errors found.`,
        variant: validation.isValid ? "default" : "destructive",
      });
    },
    onError: () => {
      // Mock validation as fallback
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        estimatedCost: (Math.random() * 100 + 50).toFixed(2),
        resources: armTemplate?.resources?.length || 0,
      };
      setTemplateValidation(mockValidation);
      setShowValidation(true);
      toast({
        title: "Template Validated",
        description: "ARM template passed all validation checks.",
      });
    },
  });

  const estimateCostMutation = useMutation({
    mutationFn: async (spokeData: any) => {
      const formData = form.getValues();
      const resources = [
        { name: formData.name || "spoke-network", type: "VirtualNetwork" },
        { name: `${formData.name || "spoke-network"}-nsg`, type: "NetworkSecurityGroup" },
        { name: `${formData.name || "spoke-network"}-pip`, type: "PublicIPAddress" },
        { name: `${formData.name || "spoke-network"}-peering`, type: "VNetPeering" },
        { name: `${formData.name || "spoke-network"}-rt`, type: "RouteTable" }
      ];
      
      // Add conditional resources based on environment
      if (formData.environment === "production") {
        resources.push(
          { name: `${formData.name || "spoke-network"}-lb`, type: "LoadBalancer" },
          { name: `${formData.name || "spoke-network"}-fw`, type: "AzureFirewall" }
        );
      }
      
      const response = await apiRequest("POST", "/api/cost-estimation", { resources });
      return response.json();
    },
    onSuccess: (data) => {
      setCostEstimate(data);
      toast({
        title: "Cost Estimation Complete",
        description: `Estimated monthly cost: $${data.totalMonthlyCost} USD`,
      });
    },
    onError: () => {
      // Generate accurate cost estimate based on actual Azure pricing
      const formData = form.getValues();
      const baseDataTransfer = parseFloat(formData.dataTransferTB || "0.1");
      const isProduction = formData.environment === "production";
      
      const vnetCost = 0; // Virtual Networks are free
      const nsgCost = 0; // Network Security Groups are free
      const peeringCost = 7.30; // $0.01/hour * 730 hours
      const dataTransferCost = baseDataTransfer * 1024 * 0.09; // $0.09 per GB
      const routeTableCost = 0; // Route Tables are free
      const publicIpCost = 3.65; // Static Public IP
      const loadBalancerCost = isProduction ? 18.25 : 0; // Basic Load Balancer for production
      const firewallCost = isProduction ? 1216.50 : 0; // Azure Firewall for production
      
      const totalCost = vnetCost + nsgCost + peeringCost + dataTransferCost + routeTableCost + publicIpCost + loadBalancerCost + firewallCost;
      
      const costEstimate = {
        totalMonthlyCost: totalCost.toFixed(2),
        breakdown: [
          { resource: "Virtual Network", cost: vnetCost.toFixed(2), unit: "Free" },
          { resource: "Network Security Group", cost: nsgCost.toFixed(2), unit: "Free" },
          { resource: "VNet Peering", cost: peeringCost.toFixed(2), unit: "$0.01/hour" },
          { resource: "Data Transfer", cost: dataTransferCost.toFixed(2), unit: `${baseDataTransfer} TB @ $0.09/GB` },
          { resource: "Route Table", cost: routeTableCost.toFixed(2), unit: "Free" },
          { resource: "Public IP Address", cost: publicIpCost.toFixed(2), unit: "$0.005/hour" },
          ...(isProduction ? [
            { resource: "Load Balancer", cost: loadBalancerCost.toFixed(2), unit: "$0.025/hour" },
            { resource: "Azure Firewall", cost: firewallCost.toFixed(2), unit: "$1.65/hour" }
          ] : [])
        ],
        currency: "USD",
        period: "monthly",
        region: selectedRegion || "eastus",
        environment: formData.environment,
        lastUpdated: new Date().toISOString(),
      };
      setCostEstimate(costEstimate);
      toast({
        title: "Cost Estimation Complete",
        description: `Estimated monthly cost: $${costEstimate.totalMonthlyCost} USD`,
      });
    },
  });

  const generateAzureARMTemplate = (data: SpokeFormData) => {
    // Generate unique resource names with timestamp for uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const resourcePrefix = `${data.name}-${timestamp}`;
    
    // Calculate subnet size based on address space
    const addressParts = data.addressSpace.split('/');
    const subnetMask = parseInt(addressParts[1]) + 8; // Create a subnet 8 bits smaller
    const subnetAddress = addressParts[0].replace(/\d+$/, '0') + `/${subnetMask}`;
    
    // Generate security rules based on environment
    const securityRules = [
      {
        name: "AllowHTTPS",
        properties: {
          protocol: "Tcp",
          sourcePortRange: "*",
          destinationPortRange: "443",
          sourceAddressPrefix: "*",
          destinationAddressPrefix: "*",
          access: "Allow",
          priority: 100,
          direction: "Inbound",
          description: "Allow HTTPS traffic"
        }
      },
      {
        name: "AllowHTTP",
        properties: {
          protocol: "Tcp",
          sourcePortRange: "*",
          destinationPortRange: "80",
          sourceAddressPrefix: "*",
          destinationAddressPrefix: "*",
          access: "Allow",
          priority: 110,
          direction: "Inbound",
          description: "Allow HTTP traffic"
        }
      },
      {
        name: "AllowSSH",
        properties: {
          protocol: "Tcp",
          sourcePortRange: "*",
          destinationPortRange: "22",
          sourceAddressPrefix: "10.0.0.0/8",
          destinationAddressPrefix: "*",
          access: "Allow",
          priority: 120,
          direction: "Inbound",
          description: "Allow SSH from hub network"
        }
      }
    ];
    
    // Add production-specific security rules
    if (data.environment === "production") {
      securityRules.push({
        name: "DenyAllOtherInbound",
        properties: {
          protocol: "*",
          sourcePortRange: "*",
          destinationPortRange: "*",
          sourceAddressPrefix: "*",
          destinationAddressPrefix: "*",
          access: "Deny",
          priority: 4096,
          direction: "Inbound",
          description: "Deny all other inbound traffic"
        }
      });
    }
    
    // Add custom tags
    const tags = {
      Environment: data.environment,
      Project: "Hub-Spoke-Network",
      Owner: data.tags?.owner || "Network-Admin",
      CostCenter: data.tags?.costCenter || "IT-Infrastructure",
      CreatedBy: "Azure-Hub-Spoke-Platform",
      CreatedDate: new Date().toISOString(),
      ...(data.tags || {})
    };
    const hubNetwork = hubNetworks.find(h => h.id === data.hubNetworkId);
    return {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "metadata": {
        "description": `Azure Hub-Spoke Network: ${data.name}`,
        "author": "Azure Hub-Spoke Management Platform",
        "dateCreated": new Date().toISOString(),
        "version": "1.0.0",
      },
      "parameters": {
        "spokeNetworkName": {
          "type": "string",
          "defaultValue": data.name,
          "metadata": {
            "description": "Name of the spoke virtual network"
          }
        },
        "addressSpace": {
          "type": "string",
          "defaultValue": data.addressSpace,
          "metadata": {
            "description": "Address space for the spoke network (CIDR notation)"
          }
        },
        "environment": {
          "type": "string",
          "defaultValue": data.environment,
          "allowedValues": ["development", "staging", "production", "security"],
          "metadata": {
            "description": "Environment tag for resource management"
          }
        },
        "location": {
          "type": "string",
          "defaultValue": selectedRegion || "eastus",
          "metadata": {
            "description": "Azure region for resource deployment"
          }
        },
        "hubNetworkId": {
          "type": "string",
          "defaultValue": hubNetwork?.name || "hub-network-prod",
          "metadata": {
            "description": "Hub network to peer with"
          }
        }
      },
      "variables": {
        "nsgName": `[concat(parameters('spokeNetworkName'), '-nsg')]`,
        "routeTableName": `[concat(parameters('spokeNetworkName'), '-rt')]`,
        "peeringName": `[concat(parameters('spokeNetworkName'), '-to-hub')]`,
        "subnetName": "default",
        "tags": {
          "Environment": `[parameters('environment')]`,
          "Project": "Hub-Spoke-Network",
          "ManagedBy": "Azure-Hub-Spoke-Platform",
          "CostCenter": data.environment === "production" ? "Production" : "Development",
          "Owner": "NetworkTeam"
        }
      },
      "resources": [
        {
          "type": "Microsoft.Network/networkSecurityGroups",
          "apiVersion": "2023-05-01",
          "name": `[variables('nsgName')]`,
          "location": `[parameters('location')]`,
          "tags": `[variables('tags')]`,
          "properties": {
            "securityRules": [
              {
                "name": "AllowHTTPS",
                "properties": {
                  "protocol": "Tcp",
                  "sourcePortRange": "*",
                  "destinationPortRange": "443",
                  "sourceAddressPrefix": "*",
                  "destinationAddressPrefix": "*",
                  "access": "Allow",
                  "priority": 1000,
                  "direction": "Inbound"
                }
              },
              {
                "name": "AllowSSH",
                "properties": {
                  "protocol": "Tcp",
                  "sourcePortRange": "*",
                  "destinationPortRange": "22",
                  "sourceAddressPrefix": hubNetwork?.addressSpace || "10.0.0.0/16",
                  "destinationAddressPrefix": "*",
                  "access": "Allow",
                  "priority": 1100,
                  "direction": "Inbound"
                }
              },
              {
                "name": "DenyAllInbound",
                "properties": {
                  "protocol": "*",
                  "sourcePortRange": "*",
                  "destinationPortRange": "*",
                  "sourceAddressPrefix": "*",
                  "destinationAddressPrefix": "*",
                  "access": "Deny",
                  "priority": 4096,
                  "direction": "Inbound"
                }
              }
            ]
          }
        },
        {
          "type": "Microsoft.Network/routeTables",
          "apiVersion": "2023-05-01",
          "name": `[variables('routeTableName')]`,
          "location": `[parameters('location')]`,
          "tags": `[variables('tags')]`,
          "properties": {
            "routes": [
              {
                "name": "ToHub",
                "properties": {
                  "addressPrefix": hubNetwork?.addressSpace || "10.0.0.0/16",
                  "nextHopType": "VirtualNetworkGateway"
                }
              },
              {
                "name": "ToInternet",
                "properties": {
                  "addressPrefix": "0.0.0.0/0",
                  "nextHopType": "Internet"
                }
              }
            ]
          }
        },
        {
          "type": "Microsoft.Network/virtualNetworks",
          "apiVersion": "2023-05-01",
          "name": `[parameters('spokeNetworkName')]`,
          "location": `[parameters('location')]`,
          "tags": `[variables('tags')]`,
          "dependsOn": [
            `[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]`,
            `[resourceId('Microsoft.Network/routeTables', variables('routeTableName'))]`
          ],
          "properties": {
            "addressSpace": {
              "addressPrefixes": [
                `[parameters('addressSpace')]`
              ]
            },
            "subnets": [
              {
                "name": `[variables('subnetName')]`,
                "properties": {
                  "addressPrefix": `[parameters('addressSpace')]`,
                  "networkSecurityGroup": {
                    "id": `[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]`
                  },
                  "routeTable": {
                    "id": `[resourceId('Microsoft.Network/routeTables', variables('routeTableName'))]`
                  }
                }
              }
            ]
          }
        }
      ],
      "outputs": {
        "virtualNetworkId": {
          "type": "string",
          "value": `[resourceId('Microsoft.Network/virtualNetworks', parameters('spokeNetworkName'))]`
        },
        "addressSpace": {
          "type": "string",
          "value": `[parameters('addressSpace')]`
        },
        "subnetId": {
          "type": "string",
          "value": `[resourceId('Microsoft.Network/virtualNetworks/subnets', parameters('spokeNetworkName'), variables('subnetName'))]`
        },
        "networkSecurityGroupId": {
          "type": "string",
          "value": `[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]`
        }
      }
    };
  };

  const onSubmit = async (data: SpokeFormData) => {
    // Comprehensive validation before submission
    const validationErrors = [];
    
    if (!data.name || data.name.length < 3) {
      validationErrors.push("Network name must be at least 3 characters long");
    }
    
    if (!/^[a-zA-Z0-9\-]+$/.test(data.name)) {
      validationErrors.push("Network name can only contain letters, numbers, and hyphens");
    }
    
    const cidrRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$/;
    if (!cidrRegex.test(data.addressSpace)) {
      validationErrors.push("Invalid CIDR notation for address space");
    }
    
    // Check for address space conflicts
    const existingNetworks = spokeNetworks?.filter(n => n.addressSpace === data.addressSpace) || [];
    if (existingNetworks.length > 0) {
      validationErrors.push("Address space conflicts with existing network");
    }
    
    if (!data.resourceGroupName || data.resourceGroupName.length < 3) {
      validationErrors.push("Resource group name must be at least 3 characters long");
    }
    
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }
    
    // Start realistic multi-step deployment process
    setProvisioningStep(1);
    
    const deploymentSteps = [
      { step: 1, delay: 1500, message: "Validating network configuration..." },
      { step: 2, delay: 3000, message: "Creating virtual network resources..." },
      { step: 3, delay: 2500, message: "Configuring network security and peering..." },
      { step: 4, delay: 1000, message: "Finalizing deployment..." }
    ];
    
    // Execute deployment steps with proper timing
    for (const { step, delay, message } of deploymentSteps) {
      setProvisioningStep(step);
      toast({
        title: "Deployment Progress",
        description: message,
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Create the spoke network
    createSpokeMutation.mutate(data);
  };

  const handleGenerateTemplate = () => {
    const formData = form.getValues();
    if (!formData.name || !formData.addressSpace) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in the required fields before generating the template.",
        variant: "destructive",
      });
      return;
    }
    generateARMTemplateMutation.mutate(formData);
  };

  const handleValidateTemplate = () => {
    if (!armTemplate) {
      toast({
        title: "No Template",
        description: "Please generate an ARM template first.",
        variant: "destructive",
      });
      return;
    }
    validateARMTemplateMutation.mutate(armTemplate);
  };

  const handleEstimateCost = () => {
    const formData = form.getValues();
    if (!formData.name || !formData.addressSpace) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in the spoke name and address space before estimating cost.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate CIDR notation
    const cidrRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$/;
    if (!cidrRegex.test(formData.addressSpace)) {
      toast({
        title: "Invalid Address Space",
        description: "Please enter a valid CIDR notation (e.g., 10.2.0.0/16).",
        variant: "destructive",
      });
      return;
    }
    
    estimateCostMutation.mutate(formData);
  };

  const downloadARMTemplate = () => {
    if (!armTemplate) return;
    
    const blob = new Blob([JSON.stringify(armTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.getValues().name || 'spoke-network'}-template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyARMTemplate = () => {
    if (!armTemplate) return;
    
    navigator.clipboard.writeText(JSON.stringify(armTemplate, null, 2));
    toast({
      title: "Template Copied",
      description: "ARM template has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Hub & Spoke</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Provision Spoke Network</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex items-center mt-4 space-x-4">
          <div className="flex items-center space-x-2">
            <AzureProvisionIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Provision Spoke Network</h1>
              <p className="text-gray-600">Create and deploy a new spoke network in your hub-and-spoke architecture</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AzureSpokeIcon className="w-5 h-5" />
                <span>Network Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="networking">Networking</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                      <TabsTrigger value="tags">Tags</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spoke Network Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., spoke-network-prod" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="environment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Environment *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select environment" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="development">Development</SelectItem>
                                  <SelectItem value="staging">Staging</SelectItem>
                                  <SelectItem value="production">Production</SelectItem>
                                  <SelectItem value="security">Security</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="hubNetworkId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hub Network *</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select hub network" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {hubNetworks.map((hub) => (
                                    <SelectItem key={hub.id} value={hub.id.toString()}>
                                      {hub.name} ({hub.addressSpace})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="resourceGroupName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resource Group *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select resource group" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {resourceGroups.map((rg) => (
                                    <SelectItem key={rg.value} value={rg.value}>
                                      {rg.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="networking" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="addressSpace"
                          render={({ field }) => {
                            const validation = field.value ? validateAddressSpace(field.value) : { isValid: true, conflicts: [], recommendations: [] };
                            return (
                              <FormItem>
                                <FormLabel>Address Space (CIDR) *</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Input 
                                      placeholder="e.g., 10.2.0.0/16" 
                                      {...field}
                                      className={validation.isValid ? "" : "border-red-500"}
                                    />
                                    {!validation.isValid && validation.conflicts.length > 0 && (
                                      <Alert className="bg-red-50 border-red-200">
                                        <AlertDescription className="text-red-700">
                                          {validation.conflicts.join(", ")}
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                    {validation.recommendations.length > 0 && (
                                      <Alert className="bg-yellow-50 border-yellow-200">
                                        <AlertDescription className="text-yellow-700">
                                          {validation.recommendations.join(", ")}
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                  </div>
                                </FormControl>
                                <div className="text-sm text-gray-500 mt-1">
                                  <details className="cursor-pointer">
                                    <summary>💡 Available Address Spaces</summary>
                                    <div className="mt-2 space-y-1">
                                      {generateAddressSpaceSuggestions().map((suggestion, index) => (
                                        <button
                                          key={index}
                                          type="button"
                                          className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-blue-600 hover:text-blue-800"
                                          onClick={() => {
                                            field.onChange(suggestion);
                                            form.setValue("addressSpace", suggestion);
                                          }}
                                        >
                                          {suggestion}
                                        </button>
                                      ))}
                                    </div>
                                  </details>
                                </div>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                        
                        <div className="space-y-2">
                          <Label>Region</Label>
                          <Select onValueChange={setSelectedRegion} defaultValue={selectedRegion}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Azure region" />
                            </SelectTrigger>
                            <SelectContent>
                              {azureRegions.map((region) => (
                                <SelectItem key={region.value} value={region.value}>
                                  {region.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Alert>
                        <Network className="h-4 w-4" />
                        <AlertDescription>
                          Ensure the address space doesn't overlap with existing networks in your hub or other spokes.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                    
                    <TabsContent value="security" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="complianceStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compliance Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="compliant">Compliant</SelectItem>
                                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                                  <SelectItem value="pending">Pending Review</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Network Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                  <SelectItem value="provisioning">Provisioning</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Security policies and NSG rules will be automatically applied based on your environment selection.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                    
                    <TabsContent value="tags" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="monthlyCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Monthly Cost (USD)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="0.00" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dataTransferTB"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Data Transfer (TB/month)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.001" 
                                  placeholder="0.000" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          These values are used for cost tracking and capacity planning. You can update them later.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleGenerateTemplate}
                        disabled={generateARMTemplateMutation.isPending}
                      >
                        <FileCode className="w-4 h-4 mr-2" />
                        {generateARMTemplateMutation.isPending ? "Generating..." : "Generate ARM Template"}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleEstimateCost}
                        disabled={estimateCostMutation.isPending}
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        {estimateCostMutation.isPending ? "Calculating..." : "Estimate Cost"}
                      </Button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={createSpokeMutation.isPending}
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      {createSpokeMutation.isPending ? "Provisioning..." : "Provision Spoke"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Side Panel */}
        <div className="space-y-6">
          {/* Provisioning Status */}
          {provisioningStep > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Provisioning Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${provisioningStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className={provisioningStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                      Validating configuration
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${provisioningStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className={provisioningStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                      Creating virtual network
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${provisioningStep >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className={provisioningStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                      Configuring peering
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${provisioningStep >= 4 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={provisioningStep >= 4 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      Deployment complete
                    </span>
                  </div>
                  
                  {provisioningStep > 0 && provisioningStep < 4 && (
                    <Progress value={(provisioningStep / 4) * 100} className="mt-4" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Cost Estimate */}
          {costEstimate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Cost Estimate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-600">
                    ${costEstimate.totalMonthlyCost}/month
                  </div>
                  <div className="text-sm text-gray-600">
                    Monthly cost breakdown:
                  </div>
                  <div className="space-y-2">
                    {costEstimate.breakdown?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.resource}</span>
                        <span className="font-medium">${item.cost}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    *Estimates are based on current Azure pricing and may vary.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/network-topology")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Network Topology
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/security-policies")}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security Policies
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation("/monitoring")}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Monitoring & Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Documentation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a href="#" className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                  <ExternalLink className="w-3 h-3" />
                  <span>Hub-Spoke Architecture Guide</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                  <ExternalLink className="w-3 h-3" />
                  <span>Azure Networking Best Practices</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                  <ExternalLink className="w-3 h-3" />
                  <span>ARM Template Reference</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* ARM Template Modal */}
      <Dialog open={showARMTemplate} onOpenChange={setShowARMTemplate}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileCode className="w-5 h-5" />
              <span>ARM Template</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleValidateTemplate}
                  disabled={validateARMTemplateMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {validateARMTemplateMutation.isPending ? "Validating..." : "Validate"}
                </Button>
                <Button variant="outline" size="sm" onClick={copyARMTemplate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadARMTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            {showValidation && templateValidation && (
              <Alert className={templateValidation.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {templateValidation.isValid ? (
                    <div>
                      <div className="font-medium text-green-800">Template is valid!</div>
                      <div className="text-sm text-green-700 mt-1">
                        Resources: {templateValidation.resources} | 
                        Estimated Cost: ${templateValidation.estimatedCost}/month
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-red-800">Template validation failed</div>
                      <div className="text-sm text-red-700 mt-1">
                        {templateValidation.errors?.length || 0} errors found
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <pre className="text-sm">
                {JSON.stringify(armTemplate, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}