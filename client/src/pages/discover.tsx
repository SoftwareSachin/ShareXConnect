import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RoleProtectedComponent, usePermissions } from "@/components/RoleProtectedComponent";
import { apiGet } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Filter, Eye, Search } from "lucide-react";
import type { ProjectWithDetails } from "@shared/schema";

export default function Discover() {
  const { canAccess, isGuest, isStudent, isFaculty, isAdmin } = usePermissions();
  const [, navigate] = useLocation();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTechFilters, setSelectedTechFilters] = useState<string[]>([]);
  const [showAllTech, setShowAllTech] = useState<boolean>(false);

  // Determine available visibility options based on role
  const getVisibilityOptions = () => {
    if (isGuest) {
      return [{ value: "PUBLIC", label: "Public Projects" }];
    } else if (isStudent) {
      return [
        { value: "all", label: "All Visible to Me" },
        { value: "PUBLIC", label: "Public Projects" },
        { value: "INSTITUTION", label: "Institution Projects" },
        { value: "PRIVATE", label: "My Private Projects" }
      ];
    } else if (isFaculty) {
      return [
        { value: "all", label: "All Visible to Me" },
        { value: "PUBLIC", label: "Public Projects" },
        { value: "INSTITUTION", label: "Institution Projects" },
        { value: "PRIVATE", label: "Private Projects I Can Review" }
      ];
    } else if (isAdmin) {
      return [
        { value: "all", label: "All Institution Projects" },
        { value: "PUBLIC", label: "Public Projects" },
        { value: "INSTITUTION", label: "Institution Projects" },
        { value: "PRIVATE", label: "Private Projects" }
      ];
    }
    return [
      { value: "all", label: "All Visible Projects" },
      { value: "PUBLIC", label: "Public Projects" },
      { value: "INSTITUTION", label: "Institution Projects" },
      { value: "PRIVATE", label: "Private Projects" }
    ];
  };

  // Fetch real filter options from database
  const { data: filterOptions } = useQuery<{
    departments: string[];
    technologies: string[];
    categories: string[];
  }>({
    queryKey: ["/api/projects/filter-options"],
    queryFn: () => apiGet("/api/projects/filter-options"),
  });

  const { data: projects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects", { 
      category: categoryFilter !== "all" ? categoryFilter : undefined, 
      visibility: visibilityFilter !== "all" ? visibilityFilter : undefined,
      department: departmentFilter !== "all" ? departmentFilter : undefined,
      search: searchQuery || undefined,
      techStack: selectedTechFilters.length > 0 ? selectedTechFilters.join(',') : undefined
    }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (visibilityFilter !== "all") params.append("visibility", visibilityFilter);
      if (departmentFilter !== "all") params.append("department", departmentFilter);
      if (searchQuery) params.append("search", searchQuery);
      if (selectedTechFilters.length > 0) params.append("techStack", selectedTechFilters.join(','));
      return apiGet(`/api/projects?${params.toString()}`);
    },
  });

  // Use real filter options from database
  const availableTech = filterOptions?.technologies || [];
  const availableDepartments = filterOptions?.departments || [];
  const availableCategories = filterOptions?.categories || [];
  
  const displayedTech = showAllTech ? availableTech : availableTech.slice(0, 6);

  // Frontend filtering is no longer needed since we do server-side filtering
  const filteredProjects = projects;

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
    setDepartmentFilter("all");
    setSelectedTechFilters([]);
    setSearchQuery("");
    setShowAllTech(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Sidebar />
      <div className="pl-80">
        <Header
          title="Discover Projects"
          description={
            isGuest 
              ? "Browse public academic projects" 
              : `Explore projects • ${canAccess('canViewAllProjects') ? 'Full Access' : 'Limited Access'}`
          }
          onSearch={handleSearch}
          showCreateButton={canAccess('canCreateProject')}
          onCreateProject={() => {
            // Navigate to projects page where create modal is handled
            window.location.href = '/projects';
          }}
        />

        {/* Modern Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <main className="relative p-8 space-y-8">
          {/* Modern Filter Bar */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10 relative z-10">
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category:</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48 bg-white/60 dark:bg-slate-800/60 border-white/20 dark:border-slate-700/30 rounded-xl" data-testid="select-category-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl">
                      <SelectItem value="all">All Categories</SelectItem>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category} className="focus:bg-slate-100 dark:focus:bg-slate-800">{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Visibility:</label>
                  <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                    <SelectTrigger className="w-52 bg-white/60 dark:bg-slate-800/60 border-white/20 dark:border-slate-700/30 rounded-xl" data-testid="select-visibility-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl">
                      {getVisibilityOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value} className="focus:bg-slate-100 dark:focus:bg-slate-800">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department:</label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-48 bg-white/60 dark:bg-slate-800/60 border-white/20 dark:border-slate-700/30 rounded-xl" data-testid="select-department-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl">
                      <SelectItem value="all">All Departments</SelectItem>
                      {availableDepartments.map((department) => (
                        <SelectItem key={department} value={department} className="focus:bg-slate-100 dark:focus:bg-slate-800">{department}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/20 dark:border-slate-700/20"
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
              
              {/* Tech Stack Filtering Section */}
              {availableTech.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/20 dark:border-slate-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Technology:</label>
                    {availableTech.length > 6 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllTech(!showAllTech)}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        {showAllTech ? 'Show Less' : `Show All ${availableTech.length}`}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayedTech.map((tech) => (
                      <Button
                        key={tech}
                        variant={selectedTechFilters.includes(tech) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTechFilter(tech)}
                        className={`text-xs rounded-xl transition-all duration-200 ${
                          selectedTechFilters.includes(tech)
                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm scale-105"
                            : "bg-white/60 dark:bg-slate-800/60 border-white/20 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-800/80"
                        }`}
                        data-testid={`button-tech-filter-${tech.toLowerCase()}`}
                      >
                        {tech}
                        {selectedTechFilters.includes(tech) && (
                          <Eye className="ml-1 w-3 h-3" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filters Summary */}
              {(categoryFilter !== "all" || visibilityFilter !== "all" || departmentFilter !== "all" || selectedTechFilters.length > 0 || searchQuery) && (
                <div className="mt-6 pt-6 border-t border-white/20 dark:border-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active filters:</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {filteredProjects?.length || 0} results
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg px-3 py-1">
                        Search: "{searchQuery}"
                      </Badge>
                    )}
                    {categoryFilter !== "all" && (
                      <Badge className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1">
                        Category: {categoryFilter}
                      </Badge>
                    )}
                    {visibilityFilter !== "all" && (
                      <Badge className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1">
                        Visibility: {visibilityFilter}
                      </Badge>
                    )}
                    {departmentFilter !== "all" && (
                      <Badge className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1">
                        Department: {departmentFilter}
                      </Badge>
                    )}
                    {selectedTechFilters.map((tech) => (
                      <Badge key={tech} className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg px-3 py-1 flex items-center gap-1">
                        {tech}
                        <button 
                          onClick={() => toggleTechFilter(tech)}
                          className="ml-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modern Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Projects</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {isLoading ? 'Loading...' : `${filteredProjects?.length || 0} project${filteredProjects?.length !== 1 ? 's' : ''} found`}
                {searchQuery && !isLoading && (
                  <span className="ml-2 text-sm">for "{searchQuery}"</span>
                )}
              </p>
            </div>
            {!isLoading && filteredProjects && filteredProjects.length > 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                <span>Sorted by relevance</span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-8">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/2 mb-6" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-6" />
                    <div className="flex items-center space-x-2 mb-6">
                      <Skeleton className="h-6 w-16 rounded-xl" />
                      <Skeleton className="h-6 w-20 rounded-xl" />
                      <Skeleton className="h-6 w-18 rounded-xl" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onView={(project) => navigate(`/project/${project.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                <Search className="w-16 h-16 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No projects found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">
                Try adjusting your filters or search query to find more projects
              </p>
              <Button 
                onClick={clearFilters} 
                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl px-8 py-3 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear all filters
              </Button>
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
    </div>
  );
}
