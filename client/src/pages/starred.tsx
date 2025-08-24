import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ProjectCard } from "@/components/project-card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { apiGet } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import type { ProjectWithDetails } from "@shared/schema";

export default function Starred() {
  const [, navigate] = useLocation();
  const { data: starredProjects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects/starred/all"],
    queryFn: () => apiGet("/api/projects/starred/all"),
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-80">
        <Header
          title="Starred Projects"
          description="Projects you've bookmarked for easy access"
          showCreateButton={false}
          showSearch={false}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">Your Starred Projects</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">
                {starredProjects?.length || 0} project{starredProjects?.length !== 1 ? 's' : ''} starred
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <Skeleton className="h-40 w-full rounded-t-lg" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex items-center space-x-2 mb-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-18" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : starredProjects?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {starredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onView={(project) => navigate(`/project/${project.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Star className="w-16 h-16 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No starred projects yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                Star projects you find interesting to bookmark them for easy access later.
              </p>
              <a
                href="/discover"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold inline-block shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-0.5"
                data-testid="button-discover-projects"
              >
                Discover Projects
              </a>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
