import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { apiGet } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectWithDetails } from "@shared/schema";

export default function Discover() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTechFilters, setSelectedTechFilters] = useState<string[]>([]);

  const { data: projects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects", { 
      category: categoryFilter !== "all" ? categoryFilter : undefined, 
      visibility: visibilityFilter !== "all" ? visibilityFilter : undefined,
      search: searchQuery || undefined 
    }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (visibilityFilter !== "all") params.append("visibility", visibilityFilter);
      if (searchQuery) params.append("search", searchQuery);
      return apiGet(`/api/projects?${params.toString()}`);
    },
  });

  // Get unique tech stacks from projects for filtering
  const availableTech = Array.from(
    new Set(projects?.flatMap(p => p.techStack) || [])
  ).slice(0, 10);

  const filteredProjects = projects?.filter(project => {
    if (selectedTechFilters.length === 0) return true;
    return selectedTechFilters.some(tech => project.techStack.includes(tech));
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleTechFilter = (tech: string) => {
    setSelectedTechFilters(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const clearFilters = () => {
    setCategoryFilter("all");
    setVisibilityFilter("all");
    setSelectedTechFilters([]);
    setSearchQuery("");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Discover Projects"
          description="Explore projects from your institution and beyond"
          onSearch={handleSearch}
          showCreateButton={false}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Filter Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Category:</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48" data-testid="select-category-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Mobile App">Mobile Apps</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="AI/Machine Learning">AI/ML</SelectItem>
                      <SelectItem value="Game Development">Game Development</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Visibility:</label>
                  <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                    <SelectTrigger className="w-32" data-testid="select-visibility-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="institution">Institution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {availableTech.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Tech Stack:</label>
                    <div className="flex items-center space-x-2">
                      {availableTech.slice(0, 4).map((tech) => (
                        <Button
                          key={tech}
                          variant={selectedTechFilters.includes(tech) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTechFilter(tech)}
                          className="text-xs"
                          data-testid={`button-tech-filter-${tech.toLowerCase()}`}
                        >
                          {tech}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-primary"
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </div>

              {/* Active Filters */}
              {(categoryFilter !== "all" || visibilityFilter !== "all" || selectedTechFilters.length > 0) && (
                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {categoryFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Category: {categoryFilter}
                    </Badge>
                  )}
                  {visibilityFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Visibility: {visibilityFilter}
                    </Badge>
                  )}
                  {selectedTechFilters.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      Tech: {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Projects</h3>
              <p className="text-muted-foreground">
                {filteredProjects?.length || 0} project{filteredProjects?.length !== 1 ? 's' : ''} found
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
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query to find more projects
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
