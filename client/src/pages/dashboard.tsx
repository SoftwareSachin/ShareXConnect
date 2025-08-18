import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/store/auth-store";
import { apiGet } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Folder, 
  Clock, 
  CheckCircle, 
  Users, 
  Plus, 
  UserPlus, 
  ClipboardCheck 
} from "lucide-react";
import type { DashboardStats, ProjectWithDetails } from "@shared/schema";
import { useState } from "react";
import { CreateProjectModal } from "@/components/modals/create-project-modal";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  const { data: recentProjects, isLoading: projectsLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects", { my: "true", limit: 3 }],
    queryFn: () => apiGet("/api/projects?my=true"),
    enabled: !!user,
  });

  const getStatCards = () => {
    if (user?.role === "student") {
      return [
        {
          title: "Total Projects",
          value: stats?.totalProjects || 0,
          icon: Folder,
          color: "text-primary",
          bgColor: "bg-blue-100",
        },
        {
          title: "In Review",
          value: stats?.inReview || 0,
          icon: Clock,
          color: "text-accent",
          bgColor: "bg-amber-100",
        },
        {
          title: "Approved",
          value: stats?.approved || 0,
          icon: CheckCircle,
          color: "text-secondary",
          bgColor: "bg-green-100",
        },
        {
          title: "Collaborators",
          value: stats?.collaborators || 0,
          icon: Users,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ];
    } else if (user?.role === "faculty") {
      return [
        {
          title: "Total Reviews",
          value: stats?.totalProjects || 0,
          icon: Folder,
          color: "text-primary",
          bgColor: "bg-blue-100",
        },
        {
          title: "Pending Review",
          value: stats?.inReview || 0,
          icon: Clock,
          color: "text-accent",
          bgColor: "bg-amber-100",
        },
        {
          title: "Completed",
          value: stats?.approved || 0,
          icon: CheckCircle,
          color: "text-secondary",
          bgColor: "bg-green-100",
        },
        {
          title: "Students",
          value: stats?.collaborators || 0,
          icon: Users,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ];
    } else {
      return [
        {
          title: "Total Projects",
          value: stats?.totalProjects || 0,
          icon: Folder,
          color: "text-primary",
          bgColor: "bg-blue-100",
        },
        {
          title: "Under Review",
          value: stats?.inReview || 0,
          icon: Clock,
          color: "text-accent",
          bgColor: "bg-amber-100",
        },
        {
          title: "Approved",
          value: stats?.approved || 0,
          icon: CheckCircle,
          color: "text-secondary",
          bgColor: "bg-green-100",
        },
        {
          title: "Total Users",
          value: stats?.collaborators || 0,
          icon: Users,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ];
    }
  };

  const statCards = getStatCards();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard"
          description="Welcome back! Here's your project overview."
          onCreateProject={() => setShowCreateModal(true)}
          showSearch={false}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} data-testid={`card-stat-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900" data-testid={`text-stat-value-${index}`}>
                          {statsLoading ? (
                            <Skeleton className="h-8 w-12" />
                          ) : (
                            card.value
                          )}
                        </p>
                      </div>
                      <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Projects */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                            <div>
                              <Skeleton className="h-5 w-32 mb-2" />
                              <Skeleton className="h-4 w-48 mb-1" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                          <Skeleton className="w-8 h-8" />
                        </div>
                      ))}
                    </div>
                  ) : recentProjects?.length ? (
                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {project.techStack[0]?.slice(0, 2) || "📁"}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{project.title}</h4>
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={
                                  project.status === "approved" 
                                    ? "bg-green-100 text-green-800" 
                                    : project.status === "under_review"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100 text-gray-800"
                                }>
                                  {project.status.replace("_", " ")}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(project.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-accent" />
                              <span className="text-sm text-muted-foreground">{project.starCount}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No projects yet</p>
                      <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                        Create your first project
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Notifications */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => setShowCreateModal(true)}
                    data-testid="button-quick-create-project"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-gray-900">Create New Project</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto"
                    data-testid="button-invite-collaborator"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <UserPlus className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="font-medium text-gray-900">Invite Collaborator</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto"
                    data-testid="button-request-review"
                  >
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                      <ClipboardCheck className="w-4 h-4 text-accent" />
                    </div>
                    <span className="font-medium text-gray-900">Request Review</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Welcome to ShareX!</p>
                        <p className="text-sm text-muted-foreground">Start by creating your first project</p>
                        <p className="text-xs text-muted-foreground mt-1">Just now</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <CreateProjectModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
}
