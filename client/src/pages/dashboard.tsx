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
          description: "Projects in development",
          primary: true,
        },
        {
          title: "Under Review",
          value: stats?.inReview || 0,
          description: "Awaiting faculty feedback",
          primary: false,
        },
        {
          title: "Completed",
          value: stats?.approved || 0,
          description: "Successfully approved",
          primary: false,
        },
        {
          title: "Collaborations",
          value: stats?.collaborators || 0,
          description: "Team partnerships",
          primary: false,
        },
      ];
    } else if (user?.role === "FACULTY") {
      return [
        {
          title: "Total Reviews",
          value: stats?.totalProjects || 0,
          description: "Projects reviewed",
          primary: true,
        },
        {
          title: "Pending Reviews",
          value: stats?.inReview || 0,
          description: "Awaiting review",
          primary: false,
        },
        {
          title: "Approved",
          value: stats?.approved || 0,
          description: "Projects approved",
          primary: false,
        },
        {
          title: "Mentoring",
          value: stats?.collaborators || 0,
          description: "Students guided",
          primary: false,
        },
      ];
    } else {
      return [
        {
          title: "Total Projects",
          value: stats?.totalProjects || 0,
          description: "Platform projects",
          primary: true,
        },
        {
          title: "Under Review",
          value: stats?.inReview || 0,
          description: "Pending approval",
          primary: false,
        },
        {
          title: "Approved",
          value: stats?.approved || 0,
          description: "Successful projects",
          primary: false,
        },
        {
          title: "Active Users",
          value: stats?.collaborators || 0,
          description: "Platform members",
          primary: false,
        },
      ];
    }
  };

  const statCards = getStatCards();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="pl-80">
        <Header
          title="Dashboard"
          description="Welcome back! Here's your project overview."
          onCreateProject={() => setShowCreateModal(true)}
          showSearch={false}
        />

        {/* Background Elements for Modern Look */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl dark:bg-blue-400/10"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl dark:bg-purple-400/10"></div>
        </div>

        <main className="relative p-6 lg:p-8 space-y-8">
          {/* Modern Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div 
                key={index}
                className={`
                  relative group
                  ${card.primary 
                    ? 'bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50' 
                    : 'bg-white/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-700/30'
                  }
                  backdrop-blur-xl rounded-2xl p-6
                  hover:bg-white/80 dark:hover:bg-slate-900/80
                  hover:border-slate-200/70 dark:hover:border-slate-700/70
                  transition-all duration-300 ease-out
                  hover:shadow-lg hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20
                  hover:-translate-y-1
                `}
                data-testid={`card-stat-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {/* Subtle Border Glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      ${card.primary 
                        ? 'bg-slate-100 dark:bg-slate-800' 
                        : 'bg-slate-50 dark:bg-slate-800/50'
                      }
                      border border-slate-200/50 dark:border-slate-700/50
                    `}>
                      <div className={`w-6 h-6 rounded ${card.primary ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                    </div>
                    <div className={`
                      px-2 py-1 text-xs font-medium rounded-md
                      ${card.primary 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' 
                        : 'bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400'
                      }
                    `}>
                      {card.primary ? 'Primary' : 'Metric'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight" data-testid={`text-stat-value-${index}`}>
                      {statsLoading ? (
                        <div className="h-9 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                      ) : (
                        card.value
                      )}
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {card.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {card.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modern Projects Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Recent Projects */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Projects</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your latest academic work</p>
                    </div>
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      New Project
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  {projectsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/30 dark:border-slate-700/30">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3"></div>
                              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentProjects?.length ? (
                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="group p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/30 dark:border-slate-700/30 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:border-slate-200/60 dark:hover:border-slate-700/60 transition-all duration-200 hover:shadow-sm">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-white dark:text-slate-900 text-sm font-bold">
                                {project.techStack?.[0]?.slice(0, 2) || "PR"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{project.title}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                              <div className="flex items-center gap-3 mt-3">
                                <div className={`
                                  px-2 py-1 text-xs font-medium rounded-md
                                  ${project.status === "APPROVED" 
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" 
                                    : project.status === "UNDER_REVIEW"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                                    : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                  }
                                `}>
                                  {project.status.replace("_", " ")}
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {new Date(project.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                <div className="w-4 h-4 bg-slate-400 rounded"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No projects yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first project to get started with collaboration</p>
                      <Button 
                        onClick={() => setShowCreateModal(true)} 
                        className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl px-6 py-2"
                      >
                        Create your first project
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modern Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Common tasks and shortcuts</p>
                </div>
                <div className="p-6 space-y-3">
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="w-full justify-start h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl shadow-sm"
                    data-testid="button-create-project"
                  >
                    <div className="w-8 h-8 bg-white/20 dark:bg-slate-900/20 rounded-lg flex items-center justify-center mr-3">
                      <div className="w-4 h-4 bg-white dark:bg-slate-900 rounded"></div>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Create New Project</div>
                      <div className="text-xs opacity-80">Start your next idea</div>
                    </div>
                  </Button>
                  
                  {user?.role === "STUDENT" && (
                    <>
                      <Button variant="outline" className="w-full justify-start h-12 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Find Collaborators</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Connect with peers</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-amber-500 rounded"></div>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-slate-900 dark:text-slate-100">View Progress</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Track your work</div>
                        </div>
                      </Button>
                    </>
                  )}
                  
                  {user?.role === "FACULTY" && (
                    <>
                      <Button variant="outline" className="w-full justify-start h-12 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Review Projects</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Evaluate student work</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Manage Students</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Guide and mentor</div>
                        </div>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Activity Feed */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Latest platform updates</p>
                </div>
                <div className="p-6">
                  {projects?.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">No activity yet</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Create your first project to start seeing activity here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects?.slice(0, 3).map((project: any) => (
                        <div key={project.id} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{project.title}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{project.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


        </main>
      </div>

      <CreateProjectModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
}
