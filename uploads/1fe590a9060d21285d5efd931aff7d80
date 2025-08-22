import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSpokeNetworkSchema, insertSecurityPolicySchema, insertActivitySchema, insertSubscriptionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Subscriptions
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData);
      
      // Create activity log for subscription creation
      await storage.createActivity({
        activityType: "subscription_created",
        resourceType: "subscription",
        resourceId: subscription.id.toString(),
        description: `Azure subscription "${subscription.name}" has been added`,
        details: { subscriptionId: subscription.subscriptionId, region: subscription.region }
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create subscription" });
      }
    }
  });

  app.patch("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      // Note: In a real implementation, you would update the subscription
      // For now, we'll just return the existing subscription
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      // Create activity log for subscription deletion
      await storage.createActivity({
        activityType: "subscription_deleted",
        resourceType: "subscription", 
        resourceId: id.toString(),
        description: `Azure subscription "${subscription.name}" has been removed`,
        details: { subscriptionId: subscription.subscriptionId }
      });
      
      res.json({ message: "Subscription removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove subscription" });
    }
  });

  // Hub Networks
  app.get("/api/hub-networks", async (req, res) => {
    try {
      const subscriptionId = req.query.subscriptionId ? parseInt(req.query.subscriptionId as string) : undefined;
      const hubNetworks = await storage.getHubNetworks(subscriptionId);
      res.json(hubNetworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hub networks" });
    }
  });

  app.get("/api/hub-networks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hubNetwork = await storage.getHubNetwork(id);
      if (!hubNetwork) {
        return res.status(404).json({ message: "Hub network not found" });
      }
      res.json(hubNetwork);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hub network" });
    }
  });

  // Spoke Networks
  app.get("/api/spoke-networks", async (req, res) => {
    try {
      const hubNetworkId = req.query.hubNetworkId ? parseInt(req.query.hubNetworkId as string) : undefined;
      const spokeNetworks = await storage.getSpokeNetworks(hubNetworkId);
      res.json(spokeNetworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spoke networks" });
    }
  });

  app.get("/api/spoke-networks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const spokeNetwork = await storage.getSpokeNetwork(id);
      if (!spokeNetwork) {
        return res.status(404).json({ message: "Spoke network not found" });
      }
      res.json(spokeNetwork);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spoke network" });
    }
  });

  app.post("/api/spoke-networks", async (req, res) => {
    try {
      const validatedData = insertSpokeNetworkSchema.parse(req.body);
      const spokeNetwork = await storage.createSpokeNetwork(validatedData);
      res.status(201).json(spokeNetwork);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create spoke network" });
      }
    }
  });

  app.patch("/api/spoke-networks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const spokeNetwork = await storage.updateSpokeNetwork(id, req.body);
      if (!spokeNetwork) {
        return res.status(404).json({ message: "Spoke network not found" });
      }
      res.json(spokeNetwork);
    } catch (error) {
      res.status(500).json({ message: "Failed to update spoke network" });
    }
  });

  // Security Policies
  app.get("/api/security-policies", async (req, res) => {
    try {
      const networkId = req.query.networkId ? parseInt(req.query.networkId as string) : undefined;
      const networkType = req.query.networkType as string;
      const policies = await storage.getSecurityPolicies(networkId, networkType);
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security policies" });
    }
  });

  app.post("/api/security-policies", async (req, res) => {
    try {
      const validatedData = insertSecurityPolicySchema.parse(req.body);
      const policy = await storage.createSecurityPolicy(validatedData);
      res.status(201).json(policy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create security policy" });
      }
    }
  });

  app.patch("/api/security-policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const policy = await storage.updateSecurityPolicy(id, req.body);
      if (!policy) {
        return res.status(404).json({ message: "Security policy not found" });
      }
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to update security policy" });
    }
  });

  app.post("/api/security-policies/:id/enforce", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const policy = await storage.updateSecurityPolicy(id, { isActive: true });
      if (!policy) {
        return res.status(404).json({ message: "Security policy not found" });
      }
      
      // Create activity log for policy enforcement
      await storage.createActivity({
        activityType: "policy_enforced",
        resourceType: "security_policy",
        resourceId: id.toString(),
        description: `Security policy "${policy.name}" has been enforced`,
        details: { policyId: id, policyName: policy.name }
      });

      res.json({ success: true, message: "Policy enforced successfully", policy });
    } catch (error) {
      res.status(500).json({ message: "Failed to enforce security policy" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create activity" });
      }
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Live network metrics
  app.get("/api/live/network-metrics", async (req, res) => {
    try {
      const metrics = await storage.getLiveNetworkMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch live network metrics" });
    }
  });

  // ARM template validation
  app.post("/api/arm/validate", async (req, res) => {
    try {
      const validation = await storage.validateARMTemplate(req.body);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ message: "Failed to validate ARM template" });
    }
  });

  // ARM template generation
  app.post("/api/arm/generate", async (req, res) => {
    try {
      const template = await storage.generateARMTemplate(req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate ARM template" });
    }
  });

  // Network health assessment
  app.get("/api/network/health", async (req, res) => {
    try {
      const health = await storage.getNetworkHealthAssessment();
      res.json(health);
    } catch (error) {
      res.status(500).json({ message: "Failed to get network health assessment" });
    }
  });

  // Azure resource costs estimation
  app.post("/api/cost-estimation", async (req, res) => {
    try {
      const { resources } = req.body;
      let totalCost = 0;
      const breakdown: Array<{name: string, type: string, monthlyCost: number}> = [];

      resources.forEach((resource: any) => {
        let cost = 0;
        switch (resource.type) {
          case "VirtualNetwork":
            cost = 0; // VNets are free
            break;
          case "NetworkSecurityGroup":
            cost = 0; // NSGs are free
            break;
          case "VirtualNetworkGateway":
            cost = 142.56; // Basic VPN Gateway
            break;
          case "PublicIPAddress":
            cost = 3.65; // Static IP
            break;
          case "LoadBalancer":
            cost = 18.25; // Basic Load Balancer
            break;
          default:
            cost = 0;
        }
        
        totalCost += cost;
        breakdown.push({
          name: resource.name,
          type: resource.type,
          monthlyCost: cost
        });
      });

      res.json({
        totalMonthlyCost: Math.round(totalCost * 100) / 100,
        breakdown,
        currency: "USD",
        region: "East US",
        estimatedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to estimate costs" });
    }
  });

  // Network metrics
  app.get("/api/network-metrics/:networkId", async (req, res) => {
    try {
      const networkId = parseInt(req.params.networkId);
      const metricType = req.query.metricType as string;
      const metrics = await storage.getNetworkMetrics(networkId, metricType);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network metrics" });
    }
  });

  // Compliance reports
  app.get("/api/compliance-reports", async (req, res) => {
    try {
      const networkId = req.query.networkId ? parseInt(req.query.networkId as string) : undefined;
      const reports = await storage.getComplianceReports(networkId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch compliance reports" });
    }
  });

  app.post("/api/compliance-reports", async (req, res) => {
    try {
      const report = await storage.createComplianceReport(req.body);
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to create compliance report" });
    }
  });

  app.get("/api/compliance-reports/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reports = await storage.getComplianceReports();
      const report = reports.find(r => r.id === id);
      
      if (!report) {
        return res.status(404).json({ message: "Compliance report not found" });
      }

      const reportData = {
        reportId: report.id,
        networkId: report.networkId,
        complianceFramework: report.complianceFramework,
        generatedAt: report.generatedAt,
        findings: report.findings || [],
        score: report.score,
        status: report.status,
        recommendations: report.recommendations || []
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="compliance-report-${id}.json"`);
      res.json(reportData);
    } catch (error) {
      res.status(500).json({ message: "Failed to download compliance report" });
    }
  });

  // ARM Template generation endpoint
  app.post("/api/arm-template/spoke", async (req, res) => {
    try {
      const { spokeName, addressSpace, environment, resourceGroupName } = req.body;
      
      const armTemplate = {
        "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
        "contentVersion": "1.0.0.0",
        "parameters": {
          "spokeName": {
            "type": "string",
            "defaultValue": spokeName
          },
          "addressSpace": {
            "type": "string", 
            "defaultValue": addressSpace
          },
          "environment": {
            "type": "string",
            "defaultValue": environment
          }
        },
        "variables": {
          "resourceGroupName": resourceGroupName,
          "hubVnetId": "/subscriptions/{subscription-id}/resourceGroups/rg-network-hub/providers/Microsoft.Network/virtualNetworks/hub-vnet-east"
        },
        "resources": [
          {
            "type": "Microsoft.Network/virtualNetworks",
            "apiVersion": "2021-02-01",
            "name": "[parameters('spokeName')]",
            "location": "East US",
            "tags": {
              "Environment": "[parameters('environment')]"
            },
            "properties": {
              "addressSpace": {
                "addressPrefixes": [
                  "[parameters('addressSpace')]"
                ]
              },
              "subnets": [
                {
                  "name": "default",
                  "properties": {
                    "addressPrefix": "[parameters('addressSpace')]"
                  }
                }
              ]
            }
          },
          {
            "type": "Microsoft.Network/virtualNetworks/virtualNetworkPeerings",
            "apiVersion": "2021-02-01",
            "name": "[concat(parameters('spokeName'), '/to-hub')]",
            "dependsOn": [
              "[resourceId('Microsoft.Network/virtualNetworks', parameters('spokeName'))]"
            ],
            "properties": {
              "allowVirtualNetworkAccess": true,
              "allowForwardedTraffic": true,
              "allowGatewayTransit": false,
              "useRemoteGateways": true,
              "remoteVirtualNetwork": {
                "id": "[variables('hubVnetId')]"
              }
            }
          }
        ],
        "outputs": {
          "spokeVnetId": {
            "type": "string",
            "value": "[resourceId('Microsoft.Network/virtualNetworks', parameters('spokeName'))]"
          }
        }
      };

      res.json(armTemplate);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate ARM template" });
    }
  });



  // Network topology data with enhanced details
  app.get("/api/network/topology", async (req, res) => {
    try {
      const hubNetworks = await storage.getHubNetworks();
      const spokeNetworks = await storage.getSpokeNetworks();
      
      const topology = {
        hubs: hubNetworks,
        spokes: spokeNetworks,
        connections: spokeNetworks.map(spoke => ({
          from: spoke.hubNetworkId,
          to: spoke.id,
          type: "peering",
          status: "active",
          bandwidth: "1 Gbps",
          latency: Math.random() * 20 + 5
        }))
      };
      
      res.json(topology);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network topology" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
