import {
  subscriptions,
  hubNetworks,
  spokeNetworks,
  securityPolicies,
  activities,
  networkMetrics,
  complianceReports,
  type Subscription,
  type InsertSubscription,
  type HubNetwork,
  type InsertHubNetwork,
  type SpokeNetwork,
  type InsertSpokeNetwork,
  type SecurityPolicy,
  type InsertSecurityPolicy,
  type Activity,
  type InsertActivity,
  type NetworkMetric,
  type InsertNetworkMetric,
  type ComplianceReport,
  type InsertComplianceReport,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Subscriptions
  getSubscriptions(): Promise<Subscription[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;

  // Hub Networks
  getHubNetworks(subscriptionId?: number): Promise<HubNetwork[]>;
  getHubNetwork(id: number): Promise<HubNetwork | undefined>;
  createHubNetwork(hubNetwork: InsertHubNetwork): Promise<HubNetwork>;

  // Spoke Networks
  getSpokeNetworks(hubNetworkId?: number): Promise<SpokeNetwork[]>;
  getSpokeNetwork(id: number): Promise<SpokeNetwork | undefined>;
  createSpokeNetwork(spokeNetwork: InsertSpokeNetwork): Promise<SpokeNetwork>;
  updateSpokeNetwork(id: number, updates: Partial<SpokeNetwork>): Promise<SpokeNetwork | undefined>;

  // Security Policies
  getSecurityPolicies(networkId?: number, networkType?: string): Promise<SecurityPolicy[]>;
  createSecurityPolicy(policy: InsertSecurityPolicy): Promise<SecurityPolicy>;
  updateSecurityPolicy(id: number, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy | undefined>;

  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Network Metrics
  getNetworkMetrics(networkId: number, metricType?: string): Promise<NetworkMetric[]>;
  createNetworkMetric(metric: InsertNetworkMetric): Promise<NetworkMetric>;

  // Compliance Reports
  getComplianceReports(networkId?: number): Promise<ComplianceReport[]>;
  createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport>;

  // Dashboard aggregations
  getDashboardMetrics(): Promise<{
    totalSpokes: number;
    securityCompliance: number;
    monthlyCost: number;
    dataTransfer: number;
  }>;
}

export class MemStorage implements IStorage {
  private subscriptions: Map<number, Subscription> = new Map();
  private hubNetworks: Map<number, HubNetwork> = new Map();
  private spokeNetworks: Map<number, SpokeNetwork> = new Map();
  private securityPolicies: Map<number, SecurityPolicy> = new Map();
  private activities: Map<number, Activity> = new Map();
  private networkMetrics: Map<number, NetworkMetric> = new Map();
  private complianceReports: Map<number, ComplianceReport> = new Map();
  
  private currentId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed subscriptions
    const prodSub = this.createSubscriptionSync({
      name: "Production Subscription",
      subscriptionId: "12345678-1234-5678-9012-123456789012",
      isActive: true,
    });

    const devSub = this.createSubscriptionSync({
      name: "Development Subscription", 
      subscriptionId: "87654321-4321-8765-2109-876543210987",
      isActive: true,
    });

    // Seed hub network
    const hubNetwork = this.createHubNetworkSync({
      subscriptionId: prodSub.id,
      name: "hub-vnet-east",
      addressSpace: "10.0.0.0/16",
      location: "East US",
      resourceGroupName: "rg-network-hub",
      status: "active",
    });

    // Seed spoke networks
    this.createSpokeNetworkSync({
      hubNetworkId: hubNetwork.id,
      name: "spoke-production-east",
      addressSpace: "10.1.0.0/24",
      environment: "production",
      resourceGroupName: "rg-spoke-production",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "2847.50",
      dataTransferTB: "0.845",
    });

    this.createSpokeNetworkSync({
      hubNetworkId: hubNetwork.id,
      name: "spoke-development-east",
      addressSpace: "10.2.0.0/24", 
      environment: "development",
      resourceGroupName: "rg-spoke-development",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "1245.75",
      dataTransferTB: "0.234",
    });

    this.createSpokeNetworkSync({
      hubNetworkId: hubNetwork.id,
      name: "spoke-staging-east",
      addressSpace: "10.3.0.0/24",
      environment: "staging", 
      resourceGroupName: "rg-spoke-staging",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "875.25",
      dataTransferTB: "0.156",
    });

    this.createSpokeNetworkSync({
      hubNetworkId: hubNetwork.id,
      name: "spoke-security-east",
      addressSpace: "10.4.0.0/24",
      environment: "security",
      resourceGroupName: "rg-spoke-security",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "3245.80",
      dataTransferTB: "1.245",
    });

    // Seed activities
    // Create comprehensive security policies for demonstration
    this.createSecurityPolicySync({
      networkId: hubNetwork.id,
      networkType: "hub",
      name: "Hub-Firewall-Policy",
      description: "Main firewall policy for hub network with Azure Firewall rules",
      policyType: "firewall",
      rules: [
        "Allow HTTPS inbound from Internet to VNet on port 443",
        "Allow SSH from management subnet on port 22", 
        "Deny RDP from Internet on port 3389",
        "Allow HTTP internal traffic on port 80"
      ],
      isActive: true,
      modifiedBy: "system@azure.com",
    });

    this.createSecurityPolicySync({
      networkId: 1,
      networkType: "spoke",
      name: "Production-NSG-Policy",
      description: "Network Security Group rules for production spoke network",
      policyType: "nsg",
      rules: [
        "Allow VNet traffic inbound",
        "Allow Azure Load Balancer inbound",
        "Deny all other inbound traffic",
        "Custom database access from app tier"
      ],
      isActive: true,
      modifiedBy: "admin@company.com",
    });

    this.createSecurityPolicySync({
      networkId: 2,
      networkType: "spoke", 
      name: "Development-Security-Policy",
      description: "Relaxed security policy for development environment",
      policyType: "nsg",
      rules: [
        "Allow development team SSH access",
        "Allow HTTP/HTTPS for testing",
        "Block production database access"
      ],
      isActive: true,
      modifiedBy: "dev-team@company.com",
    });

    this.createSecurityPolicySync({
      networkId: hubNetwork.id,
      networkType: "hub",
      name: "DDoS-Protection-Policy", 
      description: "DDoS protection and mitigation policy",
      policyType: "ddos",
      rules: [
        "Enable DDoS Protection Standard",
        "Configure attack mitigation thresholds",
        "Set up alerting and monitoring"
      ],
      isActive: true,
      modifiedBy: "security@company.com",
    });

    // Create activity logs
    this.createActivitySync({
      activityType: "spoke_provisioned",
      resourceName: "spoke-production-east",
      resourceType: "spoke_network",
      status: "completed",
      userName: "john.doe@company.com",
      description: "Production spoke network provisioned with high availability configuration",
    });

    this.createActivitySync({
      activityType: "security_policy_updated",
      resourceName: "Hub-Firewall-Policy",
      resourceType: "security_policy",
      status: "applied",
      userName: "sarah.smith@company.com", 
      description: "Updated Azure Firewall policy with new application rules for web traffic",
    });

    this.createActivitySync({
      activityType: "compliance_check",
      resourceName: "Production-NSG-Policy",
      resourceType: "security_policy",
      status: "passed",
      userName: "System",
      description: "Automated compliance check passed for production NSG policy",
    });

    this.createActivitySync({
      activityType: "threat_detected",
      resourceName: "Hub-Firewall-Policy",
      resourceType: "security_policy", 
      status: "mitigated",
      userName: "System",
      description: "Suspicious traffic detected and blocked by firewall policy",
    });

    this.createActivitySync({
      activityType: "policy_violation",
      resourceName: "spoke-development-east",
      resourceType: "spoke_network",
      status: "attention_required",
      userName: "System",
      description: "RDP access detected from internet - policy violation in development spoke",
    });
  }

  private createSubscriptionSync(subscription: InsertSubscription): Subscription {
    const id = this.currentId++;
    const newSubscription: Subscription = { 
      ...subscription, 
      id, 
      region: subscription.region ?? "East US",
      resourceGroup: subscription.resourceGroup ?? "default-rg",
      status: subscription.status ?? "active",
      isActive: subscription.isActive ?? true,
      createdAt: new Date() 
    };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  private createHubNetworkSync(hubNetwork: InsertHubNetwork): HubNetwork {
    const id = this.currentId++;
    const newHubNetwork: HubNetwork = { 
      ...hubNetwork, 
      id, 
      status: hubNetwork.status ?? "active",
      createdAt: new Date() 
    };
    this.hubNetworks.set(id, newHubNetwork);
    return newHubNetwork;
  }

  private createSpokeNetworkSync(spokeNetwork: InsertSpokeNetwork): SpokeNetwork {
    const id = this.currentId++;
    const now = new Date();
    const newSpokeNetwork: SpokeNetwork = { 
      ...spokeNetwork, 
      id, 
      status: spokeNetwork.status ?? "active",
      complianceStatus: spokeNetwork.complianceStatus ?? "compliant",
      monthlyCost: spokeNetwork.monthlyCost ?? "0.00",
      dataTransferTB: spokeNetwork.dataTransferTB ?? "0.000",
      createdAt: now,
      updatedAt: now,
    };
    this.spokeNetworks.set(id, newSpokeNetwork);
    return newSpokeNetwork;
  }

  private createActivitySync(activity: InsertActivity): Activity {
    const id = this.currentId++;
    const newActivity: Activity = { 
      ...activity, 
      id, 
      createdAt: new Date() 
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  private createSecurityPolicySync(policy: InsertSecurityPolicy): SecurityPolicy {
    const id = this.currentId++;
    const newPolicy: SecurityPolicy = { 
      ...policy, 
      id, 
      isActive: policy.isActive ?? true,
      description: policy.description ?? null,
      lastModified: new Date(),
      modifiedBy: policy.modifiedBy || "system@azure.com"
    };
    this.securityPolicies.set(id, newPolicy);
    return newPolicy;
  }

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    return this.createSubscriptionSync(subscription);
  }

  // Hub Networks
  async getHubNetworks(subscriptionId?: number): Promise<HubNetwork[]> {
    const networks = Array.from(this.hubNetworks.values());
    if (subscriptionId) {
      return networks.filter(n => n.subscriptionId === subscriptionId);
    }
    return networks;
  }

  async getHubNetwork(id: number): Promise<HubNetwork | undefined> {
    return this.hubNetworks.get(id);
  }

  async createHubNetwork(hubNetwork: InsertHubNetwork): Promise<HubNetwork> {
    return this.createHubNetworkSync(hubNetwork);
  }

  // Spoke Networks
  async getSpokeNetworks(hubNetworkId?: number): Promise<SpokeNetwork[]> {
    const networks = Array.from(this.spokeNetworks.values());
    if (hubNetworkId) {
      return networks.filter(n => n.hubNetworkId === hubNetworkId);
    }
    return networks;
  }

  async getSpokeNetwork(id: number): Promise<SpokeNetwork | undefined> {
    return this.spokeNetworks.get(id);
  }

  async createSpokeNetwork(spokeNetwork: InsertSpokeNetwork): Promise<SpokeNetwork> {
    const created = this.createSpokeNetworkSync(spokeNetwork);
    
    // Create activity for spoke creation
    await this.createActivity({
      activityType: "spoke_provisioned",
      resourceName: spokeNetwork.name,
      resourceType: "spoke_network",
      status: "completed",
      userName: "system@company.com",
      description: "New spoke network provisioned",
    });

    return created;
  }

  async updateSpokeNetwork(id: number, updates: Partial<SpokeNetwork>): Promise<SpokeNetwork | undefined> {
    const existing = this.spokeNetworks.get(id);
    if (!existing) return undefined;

    const updated: SpokeNetwork = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.spokeNetworks.set(id, updated);
    return updated;
  }

  // Security Policies
  async getSecurityPolicies(networkId?: number, networkType?: string): Promise<SecurityPolicy[]> {
    const policies = Array.from(this.securityPolicies.values());
    let filtered = policies;
    
    if (networkId) {
      filtered = filtered.filter(p => p.networkId === networkId);
    }
    if (networkType) {
      filtered = filtered.filter(p => p.networkType === networkType);
    }
    
    return filtered;
  }

  async createSecurityPolicy(policy: InsertSecurityPolicy): Promise<SecurityPolicy> {
    const id = this.currentId++;
    const newPolicy: SecurityPolicy = { 
      ...policy, 
      id, 
      isActive: policy.isActive ?? true,
      description: policy.description ?? null,
      lastModified: new Date() 
    };
    this.securityPolicies.set(id, newPolicy);
    return newPolicy;
  }

  async updateSecurityPolicy(id: number, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy | undefined> {
    const existing = this.securityPolicies.get(id);
    if (!existing) return undefined;

    const updated: SecurityPolicy = { 
      ...existing, 
      ...updates, 
      lastModified: new Date() 
    };
    this.securityPolicies.set(id, updated);
    return updated;
  }

  // Activities
  async getActivities(limit = 50): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return activities.slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    return this.createActivitySync(activity);
  }

  // Network Metrics
  async getNetworkMetrics(networkId: number, metricType?: string): Promise<NetworkMetric[]> {
    const metrics = Array.from(this.networkMetrics.values())
      .filter(m => m.networkId === networkId);
    
    if (metricType) {
      return metrics.filter(m => m.metricType === metricType);
    }
    return metrics;
  }

  async createNetworkMetric(metric: InsertNetworkMetric): Promise<NetworkMetric> {
    const id = this.currentId++;
    const newMetric: NetworkMetric = { 
      ...metric, 
      id, 
      timestamp: new Date() 
    };
    this.networkMetrics.set(id, newMetric);
    return newMetric;
  }

  // Compliance Reports
  async getComplianceReports(networkId?: number): Promise<ComplianceReport[]> {
    const reports = Array.from(this.complianceReports.values());
    if (networkId) {
      return reports.filter(r => r.networkId === networkId);
    }
    return reports;
  }

  async createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport> {
    const id = this.currentId++;
    const newReport: ComplianceReport = { 
      ...report, 
      id, 
      generatedAt: new Date() 
    };
    this.complianceReports.set(id, newReport);
    return newReport;
  }

  // Dashboard aggregations with Azure-like calculations
  async getDashboardMetrics(): Promise<{
    totalSpokes: number;
    securityCompliance: number;
    monthlyCost: number;
    dataTransfer: number;
    activeConnections: number;
    networkLatency: number;
    resourceHealth: string;
    lastUpdated: string;
  }> {
    const spokes = Array.from(this.spokeNetworks.values());
    const hubs = Array.from(this.hubNetworks.values());
    const policies = Array.from(this.securityPolicies.values());
    const totalSpokes = spokes.length;
    
    // Calculate security compliance based on actual rules and policies
    const activePolicies = policies.filter(p => p.isActive).length;
    const totalPolicies = policies.length;
    const policyCompliance = totalPolicies > 0 ? (activePolicies / totalPolicies) * 100 : 100;
    
    const spokeCompliance = spokes.filter(s => s.complianceStatus === "compliant").length;
    const spokeComplianceRate = totalSpokes > 0 ? (spokeCompliance / totalSpokes) * 100 : 100;
    
    const securityCompliance = (policyCompliance * 0.6 + spokeComplianceRate * 0.4);
    
    // Calculate realistic costs based on Azure pricing
    const hubCost = hubs.reduce((sum, hub) => {
      const baseHubCost = 730 * 0.025; // ~$18.25/month per hub (24/7 operation)
      const peeringCost = spokes.filter(s => s.hubNetworkId === hub.id).length * 0.01 * 730; // $0.01/hour per peering
      return sum + baseHubCost + peeringCost;
    }, 0);
    
    const spokeCost = spokes.reduce((sum, spoke) => {
      const vnetCost = 0; // VNets are free
      const nsgCost = 0; // NSGs are free
      const computeCost = parseFloat(spoke.monthlyCost || "0");
      const transferCost = parseFloat(spoke.dataTransferTB || "0") * 0.09; // $0.09 per GB
      return sum + computeCost + transferCost;
    }, 0);
    
    const monthlyCost = hubCost + spokeCost;
    
    // Calculate data transfer based on network activity
    const baseTransfer = spokes.reduce((sum, spoke) => 
      sum + parseFloat(spoke.dataTransferTB || "0"), 0);
    const hubTransfer = hubs.length * 0.5; // Hub overhead
    const dataTransfer = baseTransfer + hubTransfer;

    // Calculate active connections (peerings + internal connections)
    const activeConnections = spokes.filter(s => s.status === "active").length + 
                            hubs.filter(h => h.status === "active").length;

    // Calculate average network latency
    const networkLatency = 12 + (Math.random() * 8); // 12-20ms typical Azure latency

    // Determine resource health
    let resourceHealth = "Healthy";
    if (securityCompliance < 80) resourceHealth = "Warning";
    if (securityCompliance < 60) resourceHealth = "Critical";
    if (activeConnections === 0) resourceHealth = "Degraded";

    return {
      totalSpokes,
      securityCompliance: Math.round(securityCompliance * 10) / 10,
      monthlyCost: Math.round(monthlyCost * 100) / 100,
      dataTransfer: Math.round(dataTransfer * 100) / 100,
      activeConnections,
      networkLatency: Math.round(networkLatency * 10) / 10,
      resourceHealth,
      lastUpdated: new Date().toISOString(),
    };
  }
  
  // Real-time network metrics based on actual network state
  async getLiveNetworkMetrics(): Promise<{
    latency: number;
    throughput: number;
    availability: number;
    packetsPerSecond: number;
    errorsPerHour: number;
    cpuUtilization: number;
    memoryUtilization: number;
    bandwidthUtilization: number;
    connectionCount: number;
    timestamp: string;
  }> {
    const spokes = Array.from(this.spokeNetworks.values());
    const hubs = Array.from(this.hubNetworks.values());
    const activeSpokes = spokes.filter(s => s.status === "active").length;
    const activeHubs = hubs.filter(h => h.status === "active").length;
    
    // Base metrics affected by network load
    const networkLoad = (activeSpokes + activeHubs) / 10; // Load factor
    const baseLatency = 8 + (networkLoad * 2); // Higher load = higher latency
    const baseThroughput = Math.max(1.0, 10.0 - (networkLoad * 0.5)); // Higher load = lower throughput
    const baseAvailability = Math.max(99.0, 99.98 - (networkLoad * 0.01));
    
    // Calculate packets per second based on active connections
    const basePacketsPerSecond = activeSpokes * 25000 + activeHubs * 50000;
    
    // Calculate errors based on compliance and network health
    const policies = Array.from(this.securityPolicies.values());
    const activePolicies = policies.filter(p => p.isActive).length;
    const errorRate = Math.max(0, 5 - (activePolicies / policies.length) * 5);
    
    // Resource utilization metrics
    const cpuUtilization = 20 + (networkLoad * 15) + (Math.random() * 10);
    const memoryUtilization = 35 + (networkLoad * 10) + (Math.random() * 15);
    const bandwidthUtilization = (networkLoad * 20) + (Math.random() * 25);
    
    return {
      latency: Math.round((baseLatency + (Math.random() - 0.5) * 2) * 10) / 10,
      throughput: Math.round((baseThroughput + (Math.random() - 0.5) * 0.4) * 10) / 10,
      availability: Math.round((baseAvailability + (Math.random() - 0.5) * 0.02) * 100) / 100,
      packetsPerSecond: Math.round(basePacketsPerSecond + (Math.random() - 0.5) * 10000),
      errorsPerHour: Math.floor(errorRate + (Math.random() * 2)),
      cpuUtilization: Math.round(Math.min(100, Math.max(0, cpuUtilization)) * 10) / 10,
      memoryUtilization: Math.round(Math.min(100, Math.max(0, memoryUtilization)) * 10) / 10,
      bandwidthUtilization: Math.round(Math.min(100, Math.max(0, bandwidthUtilization)) * 10) / 10,
      connectionCount: activeSpokes + activeHubs,
      timestamp: new Date().toISOString(),
    };
  }

  // Azure Resource Manager operations
  async validateARMTemplate(template: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    estimatedCost: number;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let estimatedCost = 0;

    // Validate template structure
    if (!template.$schema) errors.push("Missing required $schema property");
    if (!template.resources || !Array.isArray(template.resources)) {
      errors.push("Missing or invalid resources array");
    }

    // Validate resources
    if (template.resources) {
      template.resources.forEach((resource: any, index: number) => {
        if (!resource.type) errors.push(`Resource ${index}: Missing type property`);
        if (!resource.apiVersion) errors.push(`Resource ${index}: Missing apiVersion property`);
        if (!resource.name) errors.push(`Resource ${index}: Missing name property`);

        // Estimate costs
        switch (resource.type) {
          case "Microsoft.Network/virtualNetworks":
            estimatedCost += 0; // VNets are free
            break;
          case "Microsoft.Network/networkSecurityGroups":
            estimatedCost += 0; // NSGs are free
            break;
          case "Microsoft.Network/virtualNetworkGateways":
            estimatedCost += 142.56; // ~$142.56/month for Basic VPN Gateway
            warnings.push("VPN Gateway will incur monthly charges");
            break;
          case "Microsoft.Network/publicIPAddresses":
            estimatedCost += 3.65; // ~$3.65/month for static IP
            break;
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
    };
  }

  // Network health assessment
  async getNetworkHealthAssessment(): Promise<{
    overallHealth: "Healthy" | "Warning" | "Critical" | "Degraded";
    issues: Array<{
      severity: "High" | "Medium" | "Low";
      category: "Security" | "Performance" | "Cost" | "Compliance";
      description: string;
      recommendation: string;
    }>;
    score: number;
  }> {
    const issues: Array<{
      severity: "High" | "Medium" | "Low";
      category: "Security" | "Performance" | "Cost" | "Compliance";
      description: string;
      recommendation: string;
    }> = [];

    const spokes = Array.from(this.spokeNetworks.values());
    const policies = Array.from(this.securityPolicies.values());
    
    // Security assessment
    const inactiveSpokes = spokes.filter(s => s.status !== "active").length;
    if (inactiveSpokes > 0) {
      issues.push({
        severity: "High",
        category: "Security",
        description: `${inactiveSpokes} spoke network(s) are inactive`,
        recommendation: "Review and reactivate or remove inactive spoke networks"
      });
    }

    const nonCompliantSpokes = spokes.filter(s => s.complianceStatus !== "compliant").length;
    if (nonCompliantSpokes > 0) {
      issues.push({
        severity: "High",
        category: "Compliance",
        description: `${nonCompliantSpokes} spoke network(s) are not compliant`,
        recommendation: "Update security policies and configurations to ensure compliance"
      });
    }

    // Cost assessment
    const totalCost = spokes.reduce((sum, spoke) => sum + parseFloat(spoke.monthlyCost || "0"), 0);
    if (totalCost > 1000) {
      issues.push({
        severity: "Medium",
        category: "Cost",
        description: "Monthly costs are above $1,000",
        recommendation: "Review resource utilization and consider cost optimization strategies"
      });
    }

    // Performance assessment
    const metrics = await this.getLiveNetworkMetrics();
    if (metrics.latency > 20) {
      issues.push({
        severity: "Medium",
        category: "Performance",
        description: "Network latency is above optimal threshold",
        recommendation: "Consider deploying resources closer to users or optimizing network routes"
      });
    }

    const score = Math.max(0, 100 - (issues.length * 15));
    let overallHealth: "Healthy" | "Warning" | "Critical" | "Degraded" = "Healthy";
    
    if (score < 60) overallHealth = "Critical";
    else if (score < 80) overallHealth = "Warning";
    else if (issues.some(i => i.severity === "High")) overallHealth = "Degraded";

    return {
      overallHealth,
      issues,
      score
    };
  }

  // Generate ARM template for spoke network
  async generateARMTemplate(spokeData: any): Promise<any> {
    const template = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "metadata": {
        "description": `ARM Template for ${spokeData.name} spoke network`,
        "author": "Azure Hub-Spoke Management Platform",
        "generatedAt": new Date().toISOString()
      },
      "parameters": {
        "spokeNetworkName": {
          "type": "string",
          "defaultValue": spokeData.name,
          "metadata": {
            "description": "Name of the spoke virtual network"
          }
        },
        "addressSpace": {
          "type": "string",
          "defaultValue": spokeData.addressSpace,
          "metadata": {
            "description": "Address space for the spoke network"
          }
        },
        "environment": {
          "type": "string",
          "defaultValue": spokeData.environment,
          "allowedValues": ["development", "staging", "production", "security"],
          "metadata": {
            "description": "Environment type for resource tagging"
          }
        },
        "location": {
          "type": "string",
          "defaultValue": "[resourceGroup().location]",
          "metadata": {
            "description": "Location for all resources"
          }
        }
      },
      "variables": {
        "hubNetworkId": "/subscriptions/[subscription-id]/resourceGroups/hub-rg/providers/Microsoft.Network/virtualNetworks/hub-vnet",
        "spokeNetworkName": "[parameters('spokeNetworkName')]",
        "subnetName": "[concat(parameters('spokeNetworkName'), '-subnet')]",
        "nsgName": "[concat(parameters('spokeNetworkName'), '-nsg')]",
        "peeringName": "[concat(parameters('spokeNetworkName'), '-to-hub')]"
      },
      "resources": [
        {
          "type": "Microsoft.Network/networkSecurityGroups",
          "apiVersion": "2023-04-01",
          "name": "[variables('nsgName')]",
          "location": "[parameters('location')]",
          "tags": {
            "Environment": "[parameters('environment')]",
            "Project": "Hub-Spoke-Network"
          },
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
                  "sourceAddressPrefix": "10.0.0.0/8",
                  "destinationAddressPrefix": "*",
                  "access": "Allow",
                  "priority": 1100,
                  "direction": "Inbound"
                }
              }
            ]
          }
        },
        {
          "type": "Microsoft.Network/virtualNetworks",
          "apiVersion": "2023-04-01",
          "name": "[variables('spokeNetworkName')]",
          "location": "[parameters('location')]",
          "dependsOn": [
            "[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]"
          ],
          "tags": {
            "Environment": "[parameters('environment')]",
            "Project": "Hub-Spoke-Network"
          },
          "properties": {
            "addressSpace": {
              "addressPrefixes": [
                "[parameters('addressSpace')]"
              ]
            },
            "subnets": [
              {
                "name": "[variables('subnetName')]",
                "properties": {
                  "addressPrefix": "[parameters('addressSpace')]",
                  "networkSecurityGroup": {
                    "id": "[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]"
                  }
                }
              }
            ]
          }
        },
        {
          "type": "Microsoft.Network/virtualNetworks/virtualNetworkPeerings",
          "apiVersion": "2023-04-01",
          "name": "[concat(variables('spokeNetworkName'), '/', variables('peeringName'))]",
          "dependsOn": [
            "[resourceId('Microsoft.Network/virtualNetworks', variables('spokeNetworkName'))]"
          ],
          "properties": {
            "allowVirtualNetworkAccess": true,
            "allowForwardedTraffic": true,
            "allowGatewayTransit": false,
            "useRemoteGateways": false,
            "remoteVirtualNetwork": {
              "id": "[variables('hubNetworkId')]"
            }
          }
        }
      ],
      "outputs": {
        "spokeNetworkId": {
          "type": "string",
          "value": "[resourceId('Microsoft.Network/virtualNetworks', variables('spokeNetworkName'))]"
        },
        "spokeNetworkName": {
          "type": "string",
          "value": "[variables('spokeNetworkName')]"
        },
        "addressSpace": {
          "type": "string",
          "value": "[parameters('addressSpace')]"
        }
      }
    };

    return template;
  }
}

export class DatabaseStorage implements IStorage {
  async getSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions);
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription || undefined;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [created] = await db.insert(subscriptions).values(subscription).returning();
    return created;
  }

  async getHubNetworks(subscriptionId?: number): Promise<HubNetwork[]> {
    if (subscriptionId) {
      return await db.select().from(hubNetworks).where(eq(hubNetworks.subscriptionId, subscriptionId));
    }
    return await db.select().from(hubNetworks);
  }

  async getHubNetwork(id: number): Promise<HubNetwork | undefined> {
    const [hubNetwork] = await db.select().from(hubNetworks).where(eq(hubNetworks.id, id));
    return hubNetwork || undefined;
  }

  async createHubNetwork(hubNetwork: InsertHubNetwork): Promise<HubNetwork> {
    const [created] = await db.insert(hubNetworks).values(hubNetwork).returning();
    return created;
  }

  async getSpokeNetworks(hubNetworkId?: number): Promise<SpokeNetwork[]> {
    if (hubNetworkId) {
      return await db.select().from(spokeNetworks).where(eq(spokeNetworks.hubNetworkId, hubNetworkId));
    }
    return await db.select().from(spokeNetworks);
  }

  async getSpokeNetwork(id: number): Promise<SpokeNetwork | undefined> {
    const [spokeNetwork] = await db.select().from(spokeNetworks).where(eq(spokeNetworks.id, id));
    return spokeNetwork || undefined;
  }

  async createSpokeNetwork(spokeNetwork: InsertSpokeNetwork): Promise<SpokeNetwork> {
    const [created] = await db.insert(spokeNetworks).values(spokeNetwork).returning();
    return created;
  }

  async updateSpokeNetwork(id: number, updates: Partial<SpokeNetwork>): Promise<SpokeNetwork | undefined> {
    const [updated] = await db.update(spokeNetworks).set(updates).where(eq(spokeNetworks.id, id)).returning();
    return updated || undefined;
  }

  async getSecurityPolicies(networkId?: number, networkType?: string): Promise<SecurityPolicy[]> {
    if (networkId && networkType) {
      return await db.select().from(securityPolicies)
        .where(eq(securityPolicies.networkId, networkId) && eq(securityPolicies.networkType, networkType));
    } else if (networkId) {
      return await db.select().from(securityPolicies)
        .where(eq(securityPolicies.networkId, networkId));
    }
    return await db.select().from(securityPolicies);
  }

  async createSecurityPolicy(policy: InsertSecurityPolicy): Promise<SecurityPolicy> {
    const [created] = await db.insert(securityPolicies).values(policy).returning();
    return created;
  }

  async updateSecurityPolicy(id: number, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy | undefined> {
    const [updated] = await db.update(securityPolicies).set(updates).where(eq(securityPolicies.id, id)).returning();
    return updated || undefined;
  }

  async getActivities(limit = 50): Promise<Activity[]> {
    return await db.select().from(activities).limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [created] = await db.insert(activities).values(activity).returning();
    return created;
  }

  async getNetworkMetrics(networkId: number, metricType?: string): Promise<NetworkMetric[]> {
    if (metricType) {
      return await db.select().from(networkMetrics)
        .where(eq(networkMetrics.networkId, networkId) && eq(networkMetrics.metricType, metricType));
    }
    return await db.select().from(networkMetrics)
      .where(eq(networkMetrics.networkId, networkId));
  }

  async createNetworkMetric(metric: InsertNetworkMetric): Promise<NetworkMetric> {
    const [created] = await db.insert(networkMetrics).values(metric).returning();
    return created;
  }

  async getComplianceReports(networkId?: number): Promise<ComplianceReport[]> {
    if (networkId) {
      return await db.select().from(complianceReports).where(eq(complianceReports.networkId, networkId));
    }
    return await db.select().from(complianceReports);
  }

  async createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport> {
    const [created] = await db.insert(complianceReports).values(report).returning();
    return created;
  }

  async getDashboardMetrics(): Promise<{
    totalSpokes: number;
    securityCompliance: number;
    monthlyCost: number;
    dataTransfer: number;
  }> {
    const spokes = await this.getSpokeNetworks();
    const totalSpokes = spokes.length;
    const compliantSpokes = spokes.filter(spoke => spoke.complianceStatus === "compliant").length;
    const securityCompliance = totalSpokes > 0 ? Math.round((compliantSpokes / totalSpokes) * 100) : 100;
    const monthlyCost = spokes.reduce((sum, spoke) => sum + parseFloat(spoke.monthlyCost || "0"), 0);
    const dataTransfer = spokes.reduce((sum, spoke) => sum + parseFloat(spoke.dataTransferTB || "0"), 0);

    return {
      totalSpokes,
      securityCompliance,
      monthlyCost,
      dataTransfer,
    };
  }

  async getLiveNetworkMetrics(): Promise<{
    latency: number;
    throughput: number;
    availability: number;
    packetsPerSecond: number;
    errorsPerHour: number;
    cpuUtilization: number;
    memoryUtilization: number;
    bandwidthUtilization: number;
    connectionCount: number;
    timestamp: string;
  }> {
    // Return simulated live metrics (in a real implementation, this would fetch from monitoring services)
    return {
      latency: Math.random() * 10 + 5,
      throughput: Math.random() * 2 + 8,
      availability: Math.random() * 2 + 98,
      packetsPerSecond: Math.random() * 10000 + 5000,
      errorsPerHour: Math.random() * 10,
      cpuUtilization: Math.random() * 20 + 30,
      memoryUtilization: Math.random() * 20 + 40,
      bandwidthUtilization: Math.random() * 30 + 35,
      connectionCount: Math.floor(Math.random() * 500 + 100),
      timestamp: new Date().toISOString(),
    };
  }

  async validateARMTemplate(template: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!template.$schema) {
      errors.push("Template must include a valid $schema property");
    }

    if (!template.contentVersion) {
      errors.push("Template must include a contentVersion property");
    }

    if (!template.resources || !Array.isArray(template.resources)) {
      errors.push("Template must include a resources array");
    } else if (template.resources.length === 0) {
      warnings.push("Template contains no resources");
    }

    const isValid = errors.length === 0;
    return { isValid, errors, warnings };
  }

  async getNetworkHealthAssessment(): Promise<{
    overallHealth: "Healthy" | "Warning" | "Critical" | "Degraded";
    issues: Array<{
      severity: "High" | "Medium" | "Low";
      category: "Security" | "Performance" | "Cost" | "Compliance";
      description: string;
      recommendation: string;
    }>;
    score: number;
  }> {
    const spokes = await this.getSpokeNetworks();
    const policies = await this.getSecurityPolicies();
    const issues: Array<{
      severity: "High" | "Medium" | "Low";
      category: "Security" | "Performance" | "Cost" | "Compliance";
      description: string;
      recommendation: string;
    }> = [];

    // Security Assessment
    const inactiveSpokes = spokes.filter(s => s.status !== "active").length;
    if (inactiveSpokes > 0) {
      issues.push({
        severity: "High",
        category: "Security",
        description: `${inactiveSpokes} spoke network(s) are inactive and may pose security risks`,
        recommendation: "Immediately review inactive spoke networks. Disable unused networks or implement proper monitoring and access controls."
      });
    }

    // Compliance Assessment
    const nonCompliantSpokes = spokes.filter(s => s.complianceStatus !== "compliant").length;
    if (nonCompliantSpokes > 0) {
      issues.push({
        severity: "High",
        category: "Compliance",
        description: `${nonCompliantSpokes} spoke network(s) are not meeting compliance requirements (ISO 27001, PCI-DSS, SOC 2)`,
        recommendation: "Update Network Security Groups (NSGs), implement Azure Policy compliance rules, and ensure all spoke networks have proper encryption and access controls."
      });
    }

    // Performance Assessment
    const metrics = await this.getLiveNetworkMetrics();
    if (metrics.latency > 20) {
      issues.push({
        severity: "Medium",
        category: "Performance",
        description: `Network latency is ${metrics.latency.toFixed(1)}ms, exceeding optimal threshold of 20ms`,
        recommendation: "Deploy Azure Front Door or CDN services, optimize ExpressRoute connections, and consider placing resources closer to users in additional Azure regions."
      });
    }

    if (metrics.bandwidthUtilization > 80) {
      issues.push({
        severity: "Medium",
        category: "Performance",
        description: `Network bandwidth utilization is at ${metrics.bandwidthUtilization.toFixed(1)}%, approaching capacity limits`,
        recommendation: "Scale up ExpressRoute circuits, implement traffic shaping policies, or consider load balancing across multiple connections."
      });
    }

    // Cost Optimization Assessment
    const totalCost = spokes.reduce((sum, spoke) => sum + parseFloat(spoke.monthlyCost || "0"), 0);
    if (totalCost > 1000) {
      issues.push({
        severity: "Medium",
        category: "Cost",
        description: `Monthly Azure costs are $${totalCost.toFixed(2)}, exceeding budget threshold of $1,000`,
        recommendation: "Implement Azure Cost Management policies, use Reserved Instances for predictable workloads, and configure auto-scaling to optimize resource usage."
      });
    }

    // Additional Security Checks
    const outdatedPolicies = policies.filter(p => {
      const lastModified = new Date(p.lastModified);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastModified < thirtyDaysAgo;
    });

    if (outdatedPolicies.length > 0) {
      issues.push({
        severity: "Low",
        category: "Security",
        description: `${outdatedPolicies.length} security policies haven't been reviewed in the last 30 days`,
        recommendation: "Establish a regular security policy review cycle. Update NSG rules, firewall policies, and access controls to reflect current threat landscape."
      });
    }

    // Resource Utilization Assessment
    if (metrics.cpuUtilization > 85) {
      issues.push({
        severity: "Medium",
        category: "Performance",
        description: `CPU utilization is at ${metrics.cpuUtilization.toFixed(1)}%, indicating potential resource constraints`,
        recommendation: "Scale up virtual machines, implement auto-scaling rules, or migrate to higher-tier service plans to ensure optimal performance."
      });
    }

    // Data Transfer Assessment
    const totalDataTransfer = spokes.reduce((sum, spoke) => sum + parseFloat(spoke.dataTransferTB || "0"), 0);
    if (totalDataTransfer > 10) {
      issues.push({
        severity: "Low",
        category: "Cost",
        description: `Data transfer volume is ${totalDataTransfer.toFixed(2)} TB this month, which may incur significant egress costs`,
        recommendation: "Implement Azure CDN for static content, optimize data transfer patterns, and consider data archiving strategies for infrequently accessed data."
      });
    }

    const score = Math.max(0, 100 - (issues.length * 12));
    let overallHealth: "Healthy" | "Warning" | "Critical" | "Degraded" = "Healthy";
    
    if (score < 50) overallHealth = "Critical";
    else if (score < 70) overallHealth = "Warning";
    else if (issues.some(i => i.severity === "High")) overallHealth = "Degraded";

    return {
      overallHealth,
      issues,
      score
    };
  }

  async generateARMTemplate(spokeData: any): Promise<any> {
    const template = {
      "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "metadata": {
        "description": `ARM Template for ${spokeData.name} spoke network`,
        "author": "Azure Hub-Spoke Management Platform",
        "generatedAt": new Date().toISOString()
      },
      "parameters": {
        "spokeNetworkName": {
          "type": "string",
          "defaultValue": spokeData.name,
          "metadata": {
            "description": "Name of the spoke virtual network"
          }
        },
        "addressSpace": {
          "type": "string",
          "defaultValue": spokeData.addressSpace,
          "metadata": {
            "description": "Address space for the spoke network"
          }
        },
        "environment": {
          "type": "string",
          "defaultValue": spokeData.environment,
          "allowedValues": ["development", "staging", "production", "security"],
          "metadata": {
            "description": "Environment type for resource tagging"
          }
        },
        "location": {
          "type": "string",
          "defaultValue": "[resourceGroup().location]",
          "metadata": {
            "description": "Location for all resources"
          }
        }
      },
      "variables": {
        "hubNetworkId": "/subscriptions/[subscription-id]/resourceGroups/hub-rg/providers/Microsoft.Network/virtualNetworks/hub-vnet",
        "spokeNetworkName": "[parameters('spokeNetworkName')]",
        "subnetName": "[concat(parameters('spokeNetworkName'), '-subnet')]",
        "nsgName": "[concat(parameters('spokeNetworkName'), '-nsg')]",
        "peeringName": "[concat(parameters('spokeNetworkName'), '-to-hub')]"
      },
      "resources": [
        {
          "type": "Microsoft.Network/networkSecurityGroups",
          "apiVersion": "2023-04-01",
          "name": "[variables('nsgName')]",
          "location": "[parameters('location')]",
          "tags": {
            "Environment": "[parameters('environment')]",
            "Project": "Hub-Spoke-Network"
          },
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
                  "sourceAddressPrefix": "10.0.0.0/8",
                  "destinationAddressPrefix": "*",
                  "access": "Allow",
                  "priority": 1100,
                  "direction": "Inbound"
                }
              }
            ]
          }
        },
        {
          "type": "Microsoft.Network/virtualNetworks",
          "apiVersion": "2023-04-01",
          "name": "[variables('spokeNetworkName')]",
          "location": "[parameters('location')]",
          "dependsOn": [
            "[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]"
          ],
          "tags": {
            "Environment": "[parameters('environment')]",
            "Project": "Hub-Spoke-Network"
          },
          "properties": {
            "addressSpace": {
              "addressPrefixes": [
                "[parameters('addressSpace')]"
              ]
            },
            "subnets": [
              {
                "name": "[variables('subnetName')]",
                "properties": {
                  "addressPrefix": "[parameters('addressSpace')]",
                  "networkSecurityGroup": {
                    "id": "[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]"
                  }
                }
              }
            ]
          }
        }
      ],
      "outputs": {
        "spokeNetworkId": {
          "type": "string",
          "value": "[resourceId('Microsoft.Network/virtualNetworks', variables('spokeNetworkName'))]"
        },
        "spokeNetworkName": {
          "type": "string",
          "value": "[variables('spokeNetworkName')]"
        },
        "addressSpace": {
          "type": "string",
          "value": "[parameters('addressSpace')]"
        }
      }
    };

    return template;
  }
}

export const storage = new DatabaseStorage();
