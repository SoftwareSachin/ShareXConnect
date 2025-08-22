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
import { AssignFacultyModal } from "@/components/modals/assign-faculty-modal";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  const { data: recentProjects, isLoading: projectsLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects", { my: "true", limit: 3 }],
    queryFn: () => apiGet("/api/projects?my=true"),
    enabled: !!user,
  });

  // Also fetch all projects for activity feed
  const { data: projects } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects"],
    queryFn: () => apiGet("/api/projects"),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Sidebar />
      <div className="pl-80">
        <Header
          title="Dashboard"
          description="Welcome back! Here's your project overview."
          onCreateProject={() => setShowCreateModal(true)}
          showSearch={false}
        />

        {/* Modern Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <main className="relative p-8 space-y-10">
          {/* Ultra-Modern Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {statCards.map((card, index) => (
              <div 
                key={index}
                className={`
                  relative group overflow-hidden
                  bg-white/80 dark:bg-slate-900/80 
                  backdrop-blur-2xl 
                  border border-white/20 dark:border-slate-700/30
                  rounded-3xl p-8
                  hover:bg-white/90 dark:hover:bg-slate-900/90
                  hover:border-white/40 dark:hover:border-slate-600/50
                  transition-all duration-500 ease-out
                  hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/20
                  hover:-translate-y-2 hover:scale-[1.02]
                  ${card.primary ? 'ring-1 ring-slate-200/50 dark:ring-slate-700/50' : ''}
                `}
                data-testid={`card-stat-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {/* Modern Floating Icon */}
                <div className="mb-6">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center
                    ${card.primary 
                      ? 'bg-slate-900/90 dark:bg-slate-100/90 shadow-lg shadow-slate-900/20' 
                      : 'bg-slate-100/90 dark:bg-slate-800/90'
                    }
                    backdrop-blur-sm border border-white/20 dark:border-slate-700/30
                    transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                  `}>
                    <div className={`
                      w-8 h-8 rounded-lg
                      ${card.primary 
                        ? 'bg-white dark:bg-slate-900' 
                        : 'bg-slate-500 dark:bg-slate-400'
                      }
                    `}></div>
                  </div>
                </div>
                
                {/* Statistics Content */}
                <div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3" data-testid={`text-stat-value-${index}`}>
                    {statsLoading ? (
                      <div className="h-10 w-20 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl animate-pulse"></div>
                    ) : (
                      <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                        {card.value}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {card.title}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {card.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ultra-Modern Projects Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Recent Projects */}
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                <div className="p-8 border-b border-white/10 dark:border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Recent Projects</h2>
                      <p className="text-slate-500 dark:text-slate-400">Your latest academic work and collaborations</p>
                    </div>
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      New Project
                    </Button>
                  </div>
                </div>
                <div className="p-8">
                  {projectsLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/20">
                          <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-slate-200/50 dark:bg-slate-700/50 rounded-2xl animate-pulse"></div>
                            <div className="flex-1 space-y-3">
                              <div className="h-5 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse"></div>
                              <div className="h-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-3/4"></div>
                              <div className="h-3 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentProjects?.length ? (
                    <div className="space-y-6">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="group p-6 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/20 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:border-white/40 dark:hover:border-slate-600/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                          <div className="flex items-start space-x-6">
                            <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                              <span className="text-white dark:text-slate-900 text-lg font-bold">
                                {project.techStack?.[0]?.slice(0, 2) || "PR"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate mb-2">{project.title}</h4>
                              <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                              <div className="flex items-center gap-4">
                                <div className={`
                                  px-3 py-1.5 text-xs font-semibold rounded-xl
                                  ${project.status === "APPROVED" 
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" 
                                    : project.status === "UNDER_REVIEW"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  }
                                `}>
                                  {project.status.replace("_", " ")}
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                  {new Date(project.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <div className="w-5 h-5 bg-slate-400 rounded"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-slate-100/80 dark:bg-slate-800/80 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-xl"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No projects yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Create your first project to get started with collaboration</p>
                      <Button 
                        onClick={() => setShowCreateModal(true)} 
                        className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl px-8 py-3 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        Create your first project
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ultra-Modern Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                <div className="p-8 border-b border-white/10 dark:border-slate-700/30">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Quick Actions</h2>
                  <p className="text-slate-500 dark:text-slate-400">Common tasks and shortcuts</p>
                </div>
                <div className="p-8 space-y-4">
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
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-12 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30 rounded-xl transition-all duration-300"
                        onClick={() => {
                          if (recentProjects && recentProjects.length > 0) {
                            setSelectedProject(recentProjects[0]);
                            setShowAssignModal(true);
                          }
                        }}
                        disabled={!recentProjects || recentProjects.length === 0}
                        data-testid="button-assign-to-faculty"
                      >
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-emerald-600 dark:bg-emerald-400 rounded"></div>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Assign to Faculty</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Get your project reviewed</div>
                        </div>
                      </Button>
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
              
              {/* Modern Activity Feed */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                <div className="p-8 border-b border-white/10 dark:border-slate-700/30">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Recent Activity</h2>
                  <p className="text-slate-500 dark:text-slate-400">Latest platform updates and projects</p>
                </div>
                <div className="p-8">
                  {projects?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-slate-100/80 dark:bg-slate-800/80 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-xl"></div>
                      </div>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">No activity yet</p>
                      <p className="text-slate-500 dark:text-slate-400">Create your first project to start seeing activity here</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {projects?.slice(0, 3).map((project: any) => (
                        <div key={project.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/20 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{project.title}</p>
                            <p className="text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">{project.description}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
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
      <AssignFacultyModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        project={selectedProject}
      />
    </div>
  );
}
