import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectCard } from "@/components/project-card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { RoleProtectedComponent, usePermissions } from "@/components/RoleProtectedComponent";
import { useAuthStore } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";
import type { ProjectWithDetails } from "@shared/schema";

export default function Projects() {
  const { canAccess, isStudent } = usePermissions();
  const [, navigate] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // For debugging - let's see what's happening with permissions
  console.log('User permissions check:', {
    canCreateProject: canAccess('canCreateProject'),
    isStudent: isStudent,
    userRole: useAuthStore.getState().user?.role
  });

  // Students should be able to access the projects page
  // Only block if user is Guest or has no project permissions at all
  if (!canAccess('canViewAllProjects') && !canAccess('canViewPublicProjects')) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-80">
          <Header title="Access Restricted" description="Only authenticated users can view projects." />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                You need to be logged in to view projects.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const { data: projects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects", { my: "true", status: statusFilter !== "all" ? statusFilter : undefined, search: searchQuery || undefined }],
    queryFn: () => {
      const params = new URLSearchParams({ my: "true" });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      return apiGet(`/api/projects?${params.toString()}`);
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Sidebar />
      <div className="pl-80">
        <Header
          title="My Projects"
          description="Create, manage and collaborate on your academic projects"
          onCreateProject={() => setShowCreateModal(true)}
          onSearch={handleSearch}
          showCreateButton={canAccess('canCreateProject')}
        />

        {/* Modern Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <main className="relative p-8 space-y-8">
          {/* Modern Filter Bar */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Your Projects</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">
                    {projects?.length || 0} project{projects?.length !== 1 ? 's' : ''} • Full project management access
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <RoleProtectedComponent permissions={['canCreateProject']}>
                    <Button 
                      onClick={() => setShowCreateModal(true)} 
                      className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Project</span>
                    </Button>
                  </RoleProtectedComponent>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 bg-white/60 dark:bg-slate-800/60 border-white/20 dark:border-slate-700/30 rounded-xl" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-8">
                    <Skeleton className="h-7 w-3/4 mb-3" />
                    <Skeleton className="h-5 w-1/2 mb-6" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-6" />
                    <div className="flex items-center space-x-3 mb-6">
                      <Skeleton className="h-7 w-20 rounded-xl" />
                      <Skeleton className="h-7 w-24 rounded-xl" />
                      <Skeleton className="h-7 w-16 rounded-xl" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-5 w-10" />
                        <Skeleton className="h-5 w-10" />
                        <Skeleton className="h-5 w-10" />
                      </div>
                      <Skeleton className="h-7 w-24 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="group">
                  <ProjectCard 
                    project={project} 
                    onView={(project) => navigate(`/project/${project.id}`)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                <Plus className="w-16 h-16 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No projects found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your filters or search query to find more projects"
                  : "Get started by creating your first academic project"
                }
              </p>
              {!searchQuery && statusFilter === "all" && (
                <RoleProtectedComponent permissions={['canCreateProject']}>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl px-8 py-3 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    data-testid="button-create-first-project"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Project
                  </Button>
                </RoleProtectedComponent>
              )}
            </div>
          )}
        </main>

        {/* Professional Footer Branding */}
        <div className="relative py-8 mt-12">
          <div className="max-w-7xl mx-auto px-8">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
              <div className="p-8 text-center space-y-2">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  © 2025 ShareXConnect. All rights reserved.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Designed and developed by{" "}
                  <a 
                    href="https://aptivonsolin.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline-offset-2 hover:underline"
                  >
                    Aptivon Solution
                  </a>
                  <span className="italic text-slate-400 dark:text-slate-500 ml-1">
                    (Building Trust...)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateProjectModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
}
