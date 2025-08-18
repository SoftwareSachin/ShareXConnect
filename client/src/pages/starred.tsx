import { useQuery } from "@tanstack/react-query";
import { ProjectCard } from "@/components/project-card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { apiGet } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import type { ProjectWithDetails } from "@shared/schema";

export default function Starred() {
  const { data: starredProjects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects/starred/all"],
    queryFn: () => apiGet("/api/projects/starred/all"),
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Starred Projects"
          description="Projects you've bookmarked for easy access"
          showCreateButton={false}
          showSearch={false}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Your Starred Projects</h3>
              <p className="text-muted-foreground">
                {starredProjects?.length || 0} project{starredProjects?.length !== 1 ? 's' : ''} starred
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {starredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No starred projects yet</h3>
              <p className="text-muted-foreground mb-6">
                Star projects you find interesting to bookmark them for easy access later.
              </p>
              <a
                href="/discover"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
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
