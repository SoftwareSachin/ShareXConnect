import { db } from "./db";
import { 
  subscriptions, 
  hubNetworks, 
  spokeNetworks, 
  securityPolicies, 
  activities,
  networkMetrics,
  complianceReports 
} from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  // Clear existing data (optional - remove if you want to preserve data)
  await db.delete(complianceReports);
  await db.delete(networkMetrics);
  await db.delete(activities);
  await db.delete(securityPolicies);
  await db.delete(spokeNetworks);
  await db.delete(hubNetworks);
  await db.delete(subscriptions);

  // Seed subscriptions
  const [prodSub, devSub] = await db.insert(subscriptions).values([
    {
      name: "Production Subscription",
      subscriptionId: "12345678-1234-5678-9012-123456789012",
      isActive: true,
    },
    {
      name: "Development Subscription", 
      subscriptionId: "87654321-4321-8765-2109-876543210987",
      isActive: true,
    }
  ]).returning();

  // Seed hub networks
  const [hubNetwork] = await db.insert(hubNetworks).values({
    subscriptionId: prodSub.id,
    name: "hub-vnet-east",
    addressSpace: "10.0.0.0/16",
    location: "East US",
    resourceGroupName: "hub-network-rg",
    status: "active",
  }).returning();

  // Seed spoke networks
  const spokeNetworksData = [
    {
      hubNetworkId: hubNetwork.id,
      name: "spoke-production-web",
      addressSpace: "10.1.0.0/24",
      environment: "production",
      resourceGroupName: "spoke-prod-web-rg",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "425.50",
      dataTransferTB: "2.150",
    },
    {
      hubNetworkId: hubNetwork.id,
      name: "spoke-production-api",
      addressSpace: "10.1.1.0/24",
      environment: "production",
      resourceGroupName: "spoke-prod-api-rg",
      status: "active",
      complianceStatus: "compliant",
      monthlyCost: "320.75",
      dataTransferTB: "1.840",
    },
    {
      hubNetworkId: hubNetwork.id,
      name: "spoke-development-test",
      addressSpace: "10.2.0.0/24",
      environment: "development",
      resourceGroupName: "spoke-dev-test-rg",
      status: "active",
      complianceStatus: "non-compliant",
      monthlyCost: "125.25",
      dataTransferTB: "0.450",
    },
    {
      hubNetworkId: hubNetwork.id,
      name: "spoke-staging-preview",
      addressSpace: "10.2.1.0/24",
      environment: "staging",
      resourceGroupName: "spoke-staging-rg",
      status: "inactive",
      complianceStatus: "compliant",
      monthlyCost: "89.50",
      dataTransferTB: "0.220",
    }
  ];

  const createdSpokes = await db.insert(spokeNetworks).values(spokeNetworksData).returning();

  // Seed security policies
  await db.insert(securityPolicies).values([
    {
      networkId: hubNetwork.id,
      networkType: "hub",
      policyType: "firewall",
      name: "Hub-Firewall-Policy",
      rules: [
        {
          name: "AllowHTTPS",
          action: "Allow",
          protocol: "TCP",
          sourceAddresses: ["*"],
          destinationPorts: ["443"],
          priority: 100
        },
        {
          name: "AllowSSH",
          action: "Allow", 
          protocol: "TCP",
          sourceAddresses: ["10.0.0.0/8"],
          destinationPorts: ["22"],
          priority: 200
        }
      ],
      isActive: true,
      modifiedBy: "system@azure.com",
    },
    {
      networkId: createdSpokes[0].id,
      networkType: "spoke",
      policyType: "nsg",
      name: "Production-Web-NSG",
      rules: [
        {
          name: "AllowHTTP",
          action: "Allow",
          protocol: "TCP",
          sourceAddresses: ["*"],
          destinationPorts: ["80", "443"],
          priority: 100
        }
      ],
      isActive: true,
      modifiedBy: "admin@company.com",
    }
  ]);

  // Seed activities
  await db.insert(activities).values([
    {
      activityType: "spoke_provisioned",
      resourceName: "spoke-production-web",
      resourceType: "Virtual Network",
      status: "completed",
      userName: "admin@company.com",
      description: "Successfully provisioned production web spoke network",
    },
    {
      activityType: "policy_updated",
      resourceName: "Hub-Firewall-Policy",
      resourceType: "Security Policy",
      status: "completed",
      userName: "security@company.com",
      description: "Updated firewall policy to include new SSH access rules",
    },
    {
      activityType: "compliance_check",
      resourceName: "spoke-development-test",
      resourceType: "Virtual Network",
      status: "failed",
      userName: "compliance@company.com",
      description: "Compliance check failed - missing required security policies",
    },
    {
      activityType: "network_peering",
      resourceName: "spoke-production-api",
      resourceType: "Virtual Network",
      status: "completed",
      userName: "network@company.com",
      description: "Established network peering with hub network",
    }
  ]);

  // Seed compliance reports
  await db.insert(complianceReports).values([
    {
      networkId: createdSpokes[0].id,
      reportType: "PCI-DSS",
      status: "compliant",
      score: "95.5",
      findings: [
        {
          category: "Network Segmentation",
          status: "Pass",
          description: "Proper network segmentation implemented"
        },
        {
          category: "Access Controls",
          status: "Pass",
          description: "Strong access controls in place"
        }
      ],
      generatedBy: "compliance@company.com",
    },
    {
      networkId: createdSpokes[2].id,
      reportType: "ISO-27001",
      status: "non-compliant",
      score: "67.8",
      findings: [
        {
          category: "Security Policies",
          status: "Fail",
          description: "Missing required security policies"
        },
        {
          category: "Monitoring",
          status: "Warning",
          description: "Limited monitoring capabilities"
        }
      ],
      generatedBy: "compliance@company.com",
    }
  ]);

  console.log("Database seeding completed successfully!");
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("Seeding finished!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });

export { seedDatabase };