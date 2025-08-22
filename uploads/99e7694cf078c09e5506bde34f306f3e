import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FileCheck, Download, Plus, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, RefreshCw, Shield, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ComplianceReport } from "@shared/schema";

// Professional Azure compliance mock data
const complianceReports = [
  {
    id: 1,
    standard: "PCI DSS",
    version: "v4.0",
    score: 96.5,
    status: "Compliant",
    lastAudit: "2024-01-15",
    nextAudit: "2024-04-15",
    findings: [
      { category: "Network Segmentation", status: "Pass", description: "Proper network segmentation implemented with NSGs" },
      { category: "Access Controls", status: "Pass", description: "Multi-factor authentication enforced" }
    ],
    criticalFindings: 0,
    generatedBy: "Azure Security Center",
  },
  {
    id: 2,
    standard: "ISO 27001",
    version: "2013",
    score: 89.2,
    status: "Minor Issues",
    lastAudit: "2024-01-10",
    nextAudit: "2024-04-10",
    findings: [
      { category: "Security Policies", status: "Warning", description: "Security policy documentation needs updates" },
      { category: "Risk Management", status: "Pass", description: "Risk assessment procedures are adequate" },
      { category: "Incident Response", status: "Warning", description: "Incident response plan requires review" }
    ],
    criticalFindings: 1,
    generatedBy: "Microsoft Defender",
  },
  {
    id: 3,
    standard: "SOC 2 Type II",
    version: "2017",
    score: 94.8,
    status: "Compliant",
    lastAudit: "2024-01-05",
    nextAudit: "2024-07-05",
    findings: [
      { category: "Security", status: "Pass", description: "Access controls and encryption meet requirements" },
      { category: "Availability", status: "Pass", description: "System availability targets achieved" },
      { category: "Processing Integrity", status: "Pass", description: "Data processing controls are effective" }
    ],
    criticalFindings: 0,
    generatedBy: "Azure Compliance Manager",
  },
  {
    id: 4,
    standard: "GDPR",
    version: "2018",
    score: 87.3,
    status: "Minor Issues",
    lastAudit: "2023-12-20",
    nextAudit: "2024-06-20",
    findings: [
      { category: "Data Protection", status: "Pass", description: "Personal data encryption implemented" },
      { category: "Consent Management", status: "Warning", description: "Consent tracking mechanisms need improvement" },
      { category: "Data Subject Rights", status: "Pass", description: "Data deletion processes are compliant" }
    ],
    criticalFindings: 0,
    generatedBy: "Azure Policy",
  },
  {
    id: 5,
    standard: "HIPAA",
    version: "2013",
    score: 91.7,
    status: "Compliant",
    lastAudit: "2024-01-08",
    nextAudit: "2024-07-08",
    findings: [
      { category: "Administrative Safeguards", status: "Pass", description: "Access management policies compliant" },
      { category: "Physical Safeguards", status: "Pass", description: "Azure datacenter security verified" },
      { category: "Technical Safeguards", status: "Pass", description: "Encryption and audit logs configured" }
    ],
    criticalFindings: 0,
    generatedBy: "Azure Healthcare Bot",
  },
  {
    id: 6,
    standard: "FedRAMP",
    version: "Rev 5",
    score: 93.1,
    status: "Compliant",
    lastAudit: "2023-12-15",
    nextAudit: "2024-12-15",
    findings: [
      { category: "Access Control", status: "Pass", description: "Government-grade access controls implemented" },
      { category: "Audit and Accountability", status: "Pass", description: "Comprehensive audit logging enabled" }
    ],
    criticalFindings: 0,
    generatedBy: "Azure Government",
  }
];

const auditTrail = [
  {
    id: 1,
    timestamp: "2024-01-15 14:30:00",
    action: "PCI DSS compliance report generated",
    resource: "spoke-production-web",
    user: "azure-compliance@company.com",
    outcome: "Success",
    details: "Automated PCI DSS v4.0 compliance assessment completed. All payment card data protection requirements verified.",
  },
  {
    id: 2,
    timestamp: "2024-01-14 09:15:00",
    action: "Network Security Group policy updated",
    resource: "Hub-NSG-Production",
    user: "security-admin@company.com",
    outcome: "Success", 
    details: "Updated NSG rules to restrict RDP access from internet. Applied Azure Security Center recommendations.",
  },
  {
    id: 3,
    timestamp: "2024-01-13 16:45:00",
    action: "Security compliance violation detected",
    resource: "spoke-development-test",
    user: "Azure Security Center",
    outcome: "Critical",
    details: "Critical security violation: SSH port 22 exposed to internet without proper access controls. Immediate action required.",
  },
  {
    id: 4,
    timestamp: "2024-01-12 11:20:00", 
    action: "ISO 27001 risk assessment completed",
    resource: "Enterprise Security Framework",
    user: "risk-management@company.com",
    outcome: "Warning",
    details: "Annual ISO 27001 risk assessment identified 3 medium-risk areas requiring attention within 30 days.",
  },
  {
    id: 5,
    timestamp: "2024-01-11 08:45:00",
    action: "GDPR data processing audit",
    resource: "Customer Data Lake",
    user: "privacy-officer@company.com", 
    outcome: "Success",
    details: "GDPR compliance verification completed. All personal data processing activities documented and compliant.",
  },
  {
    id: 6,
    timestamp: "2024-01-10 16:30:00",
    action: "Azure Policy compliance evaluation",
    resource: "All Azure Subscriptions",
    user: "Azure Policy Service",
    outcome: "Warning", 
    details: "Policy compliance evaluation found 12 non-compliant resources across 3 subscriptions. Auto-remediation initiated.",
  },
  {
    id: 7,
    timestamp: "2024-01-09 13:15:00",
    action: "SOC 2 Type II audit preparation",
    resource: "Azure Infrastructure",
    user: "external-auditor@compliancefirm.com",
    outcome: "Success",
    details: "SOC 2 Type II audit preparation completed. All required documentation and evidence collected successfully.",
  },
  {
    id: 8,
    timestamp: "2024-01-08 10:00:00",
    action: "HIPAA security rule validation",
    resource: "Healthcare Data Platform", 
    user: "hipaa-compliance@company.com",
    outcome: "Success",
    details: "HIPAA Security Rule validation passed. All PHI encryption, access controls, and audit mechanisms verified.",
  }
];

export default function Compliance() {
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading, refetch } = useQuery<ComplianceReport[]>({
    queryKey: ["/api/compliance-reports"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/compliance-reports", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance-reports"] });
      toast({
        title: "Report Generated Successfully",
        description: "New compliance report has been generated and is available for review.",
      });
      setOpenDialog(false);
    },
    onError: (error: any) => {
      console.error("Report generation error:", error);
      toast({
        title: "Report Generation Failed", 
        description: "Unable to generate compliance report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDownloadReport = async (reportId: number) => {
    try {
      const response = await fetch(`/api/compliance-reports/${reportId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${reportId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download Started",
          description: "Compliance report download has started.",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download compliance report.",
        variant: "destructive",
      });
    }
  };

  const handleViewReport = (report: any) => {
    // Create a formatted findings display
    const findingsCount = Array.isArray(report.findings) ? report.findings.length : 0;
    const reportType = report.standard || report.reportType || 'Unknown';
    const scoreValue = report.score || 'N/A';
    
    toast({
      title: `${reportType} Report Details`,
      description: `Score: ${scoreValue}% | Status: ${report.status || 'Unknown'} | Findings: ${findingsCount}`,
    });
  };

  const handleExportAllReports = async () => {
    try {
      const allReports = reports || complianceReports;
      const exportData = {
        exportDate: new Date().toISOString(),
        totalReports: allReports.length,
        reports: allReports
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-compliance-reports-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "All compliance reports have been exported.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export compliance reports.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Compliant":
      case "compliant":
        return <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 font-medium">Compliant</Badge>;
      case "Minor Issues":
      case "non-compliant":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800 font-medium">Minor Issues</Badge>;
      case "Non-Compliant":
        return <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 font-medium">Non-Compliant</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 font-medium">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800 font-medium">{status}</Badge>;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "Success":
        return <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 font-medium">Success</Badge>;
      case "Warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800 font-medium">Warning</Badge>;
      case "Error":
        return <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 font-medium">Error</Badge>;
      case "Critical":
        return <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 font-medium">Critical</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800 font-medium">{outcome}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600 dark:text-green-400";
    if (score >= 85) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Compliance & Audit</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Compliance & Audit Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Comprehensive compliance monitoring for Azure infrastructure with PCI DSS, ISO 27001, SOC 2, GDPR, HIPAA, and FedRAMP standards
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={handleExportAllReports}
              >
                <Download className="h-4 w-4" />
                Export All Reports
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
                onClick={() => {
                  generateReportMutation.mutate({
                    networkId: 1,
                    reportType: "PCI-DSS",
                    status: "compliant",
                    score: Math.floor(Math.random() * 10 + 90).toString(),
                    findings: [
                      {
                        category: "Network Security",
                        status: "Pass",
                        description: "Network segmentation properly implemented"
                      },
                      {
                        category: "Access Control",
                        status: "Pass", 
                        description: "Strong authentication mechanisms in place"
                      }
                    ],
                    generatedBy: "Azure Security Center"
                  });
                }}
                disabled={generateReportMutation.isPending}
              >
                <Plus className="h-4 w-4" />
                {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="reports" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/20">
              <FileCheck className="h-4 w-4" />
              <span>Compliance Reports</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/20">
              <TrendingUp className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/20">
              <Clock className="h-4 w-4" />
              <span>Audit Trail</span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/20">
              <Shield className="h-4 w-4" />
              <span>Policies</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800">
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Compliance Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Standard</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Score</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Last Audit</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Next Audit</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Findings</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Generated By</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reports || complianceReports).map((report) => {
                        // Handle both database and local data structures
                        const displayReport = {
                          id: report.id,
                          standard: report.standard || report.reportType || 'Unknown',
                          version: report.version || 'N/A',
                          score: parseFloat(report.score || 0),
                          status: report.status || 'Unknown',
                          lastAudit: report.lastAudit || (report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : 'N/A'),
                          nextAudit: report.nextAudit || 'N/A',
                          findings: report.findings || [],
                          criticalFindings: report.criticalFindings || 0,
                          generatedBy: report.generatedBy || 'System'
                        };
                        
                        return (
                          <tr key={displayReport.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-4 px-6">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{displayReport.standard}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{displayReport.version}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`text-lg font-bold ${getScoreColor(displayReport.score)}`}>
                                {displayReport.score}%
                              </span>
                            </td>
                            <td className="py-4 px-6">{getStatusBadge(displayReport.status)}</td>
                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{displayReport.lastAudit}</td>
                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{displayReport.nextAudit}</td>
                            <td className="py-4 px-6">
                              <div className="text-sm">
                                <div className="text-gray-600 dark:text-gray-400">
                                  {Array.isArray(displayReport.findings) ? displayReport.findings.length : 0} total
                                </div>
                                {displayReport.criticalFindings > 0 && (
                                  <div className="text-red-600 dark:text-red-400 font-medium">{displayReport.criticalFindings} critical</div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{displayReport.generatedBy}</td>
                            <td className="py-4 px-6">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDownloadReport(displayReport.id)}
                                  title="Download Report"
                                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewReport(displayReport)}
                                  title="View Report"
                                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-950/20 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">93.5%</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Overall Compliance Score</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-950/20 rounded-lg">
                      <FileCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">+12%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">6</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Standards</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-950/20 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">-2</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">13</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Open Findings</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-fluent-neutral-10 rounded-lg">
                    <div className="text-center">
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-4">
                        <path d="M10 60L20 50L30 55L40 40L50 45L60 30L70 35" stroke="var(--azure-blue)" strokeWidth="3" fill="none"/>
                        <circle cx="10" cy="60" r="3" fill="var(--azure-blue)"/>
                        <circle cx="20" cy="50" r="3" fill="var(--azure-blue)"/>
                        <circle cx="30" cy="55" r="3" fill="var(--azure-blue)"/>
                        <circle cx="40" cy="40" r="3" fill="var(--azure-blue)"/>
                        <circle cx="50" cy="45" r="3" fill="var(--azure-blue)"/>
                        <circle cx="60" cy="30" r="3" fill="var(--azure-blue)"/>
                        <circle cx="70" cy="35" r="3" fill="var(--azure-blue)"/>
                      </svg>
                      <p className="text-fluent-neutral-90 font-medium">Compliance score trending upward</p>
                      <p className="text-sm text-fluent-neutral-60">+5.2% improvement over last quarter</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Audits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">PCI DSS Renewal</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">April 15, 2024</div>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 font-medium">
                        90 days
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">ISO 27001 Review</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">April 10, 2024</div>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800 font-medium">
                        85 days
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">SOC 2 Assessment</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">July 5, 2024</div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 font-medium">
                        171 days
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800">
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Audit Trail</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Timestamp</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Action</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Resource</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">User</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Outcome</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditTrail.map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 font-mono">{entry.timestamp}</td>
                          <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{entry.action}</td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{entry.resource}</td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{entry.user}</td>
                          <td className="py-4 px-6">{getOutcomeBadge(entry.outcome)}</td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{entry.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800">
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Compliance Policies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Azure Policy Assignments</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Enable Azure Security Center</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Subscription level</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                          Compliant
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Require encryption for storage accounts</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Resource group level</div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800">
                          Partial
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Network Security Groups on subnets</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Spoke networks</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                          Compliant
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Regulatory Compliance</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">PCI DSS v4.0</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Payment card industry</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600 dark:text-green-400">96.5%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Compliance</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">ISO 27001:2013</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Information security</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-yellow-600 dark:text-yellow-400">89.2%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Compliance</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">GDPR</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Data protection</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-yellow-600 dark:text-yellow-400">87.3%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Compliance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
