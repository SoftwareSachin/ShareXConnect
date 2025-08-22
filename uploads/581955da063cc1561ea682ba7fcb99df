import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subscriptionId: text("subscription_id").notNull().unique(),
  region: text("region").notNull().default("East US"),
  resourceGroup: text("resource_group").notNull().default("default-rg"),
  status: text("status").notNull().default("active"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hubNetworks = pgTable("hub_networks", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull(),
  name: text("name").notNull(),
  addressSpace: text("address_space").notNull(),
  location: text("location").notNull(),
  resourceGroupName: text("resource_group_name").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const spokeNetworks = pgTable("spoke_networks", {
  id: serial("id").primaryKey(),
  hubNetworkId: integer("hub_network_id").notNull(),
  name: text("name").notNull(),
  addressSpace: text("address_space").notNull(),
  environment: text("environment").notNull(), // production, development, staging, etc.
  resourceGroupName: text("resource_group_name").notNull(),
  status: text("status").notNull().default("active"),
  complianceStatus: text("compliance_status").notNull().default("compliant"),
  monthlyCost: decimal("monthly_cost", { precision: 10, scale: 2 }).default("0.00"),
  dataTransferTB: decimal("data_transfer_tb", { precision: 8, scale: 3 }).default("0.000"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const securityPolicies = pgTable("security_policies", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  networkType: text("network_type").notNull(), // hub or spoke
  policyType: text("policy_type").notNull(), // firewall, nsg, route
  name: text("name").notNull(),
  description: text("description"),
  rules: json("rules").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastModified: timestamp("last_modified").notNull().defaultNow(),
  modifiedBy: text("modified_by").notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  activityType: text("activity_type").notNull(),
  resourceName: text("resource_name").notNull(),
  resourceType: text("resource_type").notNull(),
  status: text("status").notNull(),
  userName: text("user_name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const networkMetrics = pgTable("network_metrics", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  networkType: text("network_type").notNull(),
  metricType: text("metric_type").notNull(), // bandwidth, latency, availability, etc.
  value: decimal("value", { precision: 12, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const complianceReports = pgTable("compliance_reports", {
  id: serial("id").primaryKey(),
  networkId: integer("network_id").notNull(),
  reportType: text("report_type").notNull(), // PCI, ISO, SOC, etc.
  status: text("status").notNull(), // compliant, non-compliant, pending
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  findings: json("findings").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  generatedBy: text("generated_by").notNull(),
});

// Insert schemas
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertHubNetworkSchema = createInsertSchema(hubNetworks).omit({
  id: true,
  createdAt: true,
});

export const insertSpokeNetworkSchema = createInsertSchema(spokeNetworks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSecurityPolicySchema = createInsertSchema(securityPolicies).omit({
  id: true,
  lastModified: true,
}).extend({
  description: z.string().optional(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertNetworkMetricSchema = createInsertSchema(networkMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertComplianceReportSchema = createInsertSchema(complianceReports).omit({
  id: true,
  generatedAt: true,
});

// Types
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type HubNetwork = typeof hubNetworks.$inferSelect;
export type InsertHubNetwork = z.infer<typeof insertHubNetworkSchema>;

export type SpokeNetwork = typeof spokeNetworks.$inferSelect;
export type InsertSpokeNetwork = z.infer<typeof insertSpokeNetworkSchema>;

export type SecurityPolicy = typeof securityPolicies.$inferSelect;
export type InsertSecurityPolicy = z.infer<typeof insertSecurityPolicySchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type NetworkMetric = typeof networkMetrics.$inferSelect;
export type InsertNetworkMetric = z.infer<typeof insertNetworkMetricSchema>;

export type ComplianceReport = typeof complianceReports.$inferSelect;
export type InsertComplianceReport = z.infer<typeof insertComplianceReportSchema>;

// Relations
export const subscriptionsRelations = relations(subscriptions, ({ many }) => ({
  hubNetworks: many(hubNetworks),
}));

export const hubNetworksRelations = relations(hubNetworks, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [hubNetworks.subscriptionId],
    references: [subscriptions.id],
  }),
  spokeNetworks: many(spokeNetworks),
}));

export const spokeNetworksRelations = relations(spokeNetworks, ({ one }) => ({
  hubNetwork: one(hubNetworks, {
    fields: [spokeNetworks.hubNetworkId],
    references: [hubNetworks.id],
  }),
}));
