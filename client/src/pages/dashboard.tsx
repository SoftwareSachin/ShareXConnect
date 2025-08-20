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
  FolderOpen, 
  Clock, 
  CheckCircle2, 
  Users2, 
  Plus, 
  TrendingUp, 
  Activity,
  Calendar,
  Target,
  BookOpen,
  Award,
  ArrowUpRight
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
    if (user?.role === "STUDENT") {
      return [
        {
          title: "Active Projects",
          value: stats?.totalProjects || 0,
          icon: FolderOpen,
          trend: "+12%",
          description: "Projects in development",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
          title: "Under Review",
          value: stats?.inReview || 0,
          icon: Clock,
          trend: "+3",
          description: "Awaiting faculty feedback",
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          borderColor: "border-amber-200 dark:border-amber-800",
        },
        {
          title: "Completed",
          value: stats?.approved || 0,
          icon: CheckCircle2,
          trend: "+5",
          description: "Successfully approved",
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
          borderColor: "border-emerald-200 dark:border-emerald-800",
        },
        {
          title: "Collaborations",
          value: stats?.collaborators || 0,
          icon: Users2,
          trend: "+2",
          description: "Team partnerships",
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-50 dark:bg-purple-950/20",
          borderColor: "border-purple-200 dark:border-purple-800",
        },
      ];
    } else if (user?.role === "FACULTY") {
      return [
        {
          title: "Total Reviews",
          value: stats?.totalProjects || 0,
          icon: Activity,
          trend: "+8%",
          description: "Projects reviewed",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
          title: "Pending Reviews",
          value: stats?.inReview || 0,
          icon: Clock,
          trend: "5 new",
          description: "Awaiting review",
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          borderColor: "border-amber-200 dark:border-amber-800",
        },
        {
          title: "Approved",
          value: stats?.approved || 0,
          icon: Award,
          trend: "+12",
          description: "Projects approved",
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
          borderColor: "border-emerald-200 dark:border-emerald-800",
        },
        {
          title: "Mentoring",
          value: stats?.collaborators || 0,
          icon: BookOpen,
          trend: "+3",
          description: "Students guided",
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-50 dark:bg-purple-950/20",
          borderColor: "border-purple-200 dark:border-purple-800",
        },
      ];
    } else {
      return [
        {
          title: "Total Projects",
          value: stats?.totalProjects || 0,
          icon: FolderOpen,
          trend: "+15%",
          description: "Platform projects",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
          title: "Under Review",
          value: stats?.inReview || 0,
          icon: Clock,
          trend: "8 new",
          description: "Pending approval",
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          borderColor: "border-amber-200 dark:border-amber-800",
        },
        {
          title: "Approved",
          value: stats?.approved || 0,
          icon: CheckCircle2,
          trend: "+20",
          description: "Successful projects",
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
          borderColor: "border-emerald-200 dark:border-emerald-800",
        },
        {
          title: "Active Users",
          value: stats?.collaborators || 0,
          icon: Users2,
          trend: "+7",
          description: "Platform members",
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-50 dark:bg-purple-950/20",
          borderColor: "border-purple-200 dark:border-purple-800",
        },
      ];
    }
  };

  const statCards = getStatCards();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard"
          description="Welcome back! Here's your project overview."
          onCreateProject={() => setShowCreateModal(true)}
          showSearch={false}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card 
                  key={index} 
                  className={`${card.borderColor} border-l-4 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-900`}
                  data-testid={`card-stat-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 ${card.bgColor} rounded-xl flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10`}>
                            <Icon className={`w-5 h-5 ${card.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{card.description}</p>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid={`text-stat-value-${index}`}>
                            {statsLoading ? (
                              <Skeleton className="h-8 w-12" />
                            ) : (
                              card.value
                            )}
                          </p>
                          <div className="flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{card.trend}</span>
                          </div>
                        </div>
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
              <Card className="shadow-sm border-0 bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                        <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Projects</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      View All
                    </Button>
                  </div>
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
                    <div className="space-y-3">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="group flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {project.techStack?.[0]?.slice(0, 2) || "PR"}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{project.title}</h4>
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={
                                  project.status === "APPROVED" 
                                    ? "bg-green-100 text-green-800" 
                                    : project.status === "UNDER_REVIEW"
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
                              <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span className="text-sm text-muted-foreground">{project.starCount}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No projects yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first project to get started with collaboration</p>
                      <Button 
                        onClick={() => setShowCreateModal(true)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first project
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="shadow-sm border-0 bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="w-full justify-start h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm"
                    data-testid="button-create-project"
                  >
                    <Plus className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Create New Project</div>
                      <div className="text-xs text-blue-100">Start your next idea</div>
                    </div>
                  </Button>
                  
                  {user?.role === "STUDENT" && (
                    <>
                      <Button variant="outline" className="w-full justify-start h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Users2 className="mr-3 h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-gray-100">Find Collaborators</div>
                          <div className="text-xs text-gray-500">Connect with peers</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Activity className="mr-3 h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-gray-100">View Progress</div>
                          <div className="text-xs text-gray-500">Track your work</div>
                        </div>
                      </Button>
                    </>
                  )}
                  
                  {user?.role === "FACULTY" && (
                    <>
                      <Button variant="outline" className="w-full justify-start h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <CheckCircle2 className="mr-3 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-gray-100">Review Projects</div>
                          <div className="text-xs text-gray-500">Evaluate student work</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <BookOpen className="mr-3 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-gray-100">Manage Students</div>
                          <div className="text-xs text-gray-500">Guide and mentor</div>
                        </div>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
              
              {/* Activity Feed */}
              <Card className="shadow-sm border-0 bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10 mt-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-50 dark:bg-purple-950/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Welcome to ShareXConnect!</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Start by creating your first project to collaborate with peers and faculty.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Just now</p>
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
