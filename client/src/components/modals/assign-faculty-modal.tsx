import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, ProjectWithDetails } from "@shared/schema";

interface AssignFacultyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectWithDetails | null;
}

export function AssignFacultyModal({ open, onOpenChange, project }: AssignFacultyModalProps) {
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [searchDepartment, setSearchDepartment] = useState<string>("");
  const [searchTechExpertise, setSearchTechExpertise] = useState<string>("");
  const [useProjectFilters, setUseProjectFilters] = useState<boolean>(true);
  const [debouncedDepartment, setDebouncedDepartment] = useState<string>("");
  const [debouncedTechExpertise, setDebouncedTechExpertise] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounce search inputs to prevent excessive API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDepartment(searchDepartment);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDepartment]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTechExpertise(searchTechExpertise);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTechExpertise]);

  // Reset selection when modal closes or project changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedFacultyId("");
      setSearchDepartment("");
      setSearchTechExpertise("");
      setUseProjectFilters(true);
    }
    onOpenChange(newOpen);
  };

  // Auto-populate filters based on project data when modal opens
  React.useEffect(() => {
    if (open && project && useProjectFilters) {
      setSearchDepartment(project.department || "");
      if (project.techStack && project.techStack.length > 0) {
        setSearchTechExpertise(project.techStack.join(", "));
      }
    }
  }, [open, project, useProjectFilters]);

  // Fetch faculty members from the same college domain, with debounced search filters
  const { data: facultyMembers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/faculty", debouncedDepartment, debouncedTechExpertise],
    queryFn: async () => {
      console.log('🔍 Fetching faculty with filters:', { debouncedDepartment, debouncedTechExpertise });
      const params = new URLSearchParams();
      if (debouncedDepartment?.trim()) {
        params.append('department', debouncedDepartment.trim());
      }
      if (debouncedTechExpertise?.trim()) {
        params.append('techExpertise', debouncedTechExpertise.trim());
      }
      
      const response = await fetch(`/api/users/faculty?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch faculty members');
      }
      
      const data = await response.json();
      console.log('✅ Faculty data received:', data);
      return data;
    },
    enabled: open,
    staleTime: 10000, // Reduced cache time for testing
  });

  const assignMutation = useMutation({
    mutationFn: async ({ projectId, facultyId }: { projectId: string; facultyId: string }) => {
      console.log('🎯 Assigning project:', projectId, 'to faculty:', facultyId);
      
      // Get auth token from localStorage
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        try {
          const { state } = JSON.parse(authData);
          if (state?.token) {
            headers["Authorization"] = `Bearer ${state.token}`;
          }
        } catch (e) {
          console.warn('Failed to parse auth data:', e);
        }
      }
      
      const response = await fetch(`/api/projects/${projectId}/assign-faculty`, {
        method: "POST",
        headers,
        body: JSON.stringify({ facultyId }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}: Failed to assign project to faculty`);
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      console.log('✅ Assignment successful:', result);
      toast({
        title: "Project Assigned Successfully",
        description: "Your project has been assigned to the selected faculty member for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      handleOpenChange(false);
    },
    onError: (error: any) => {
      console.error('❌ Assignment failed:', error);
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: error.message || "Failed to assign project to faculty. Please try again.",
      });
    },
  });

  const handleAssign = () => {
    if (!selectedFacultyId || !project) {
      toast({
        variant: "destructive",
        title: "Please select a faculty member",
        description: "You must choose a faculty member to assign your project to.",
      });
      return;
    }

    assignMutation.mutate({
      projectId: project.id,
      facultyId: selectedFacultyId,
    });
  };

  console.log('🔍 AssignFacultyModal state:', {
    open,
    project: project?.title,
    facultyCount: facultyMembers?.length,
    selectedFacultyId,
    isLoading
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Assign Project to Faculty
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
            Select a faculty member to review and grade your project: <strong className="text-slate-900 dark:text-slate-100">{project?.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Project-based Auto-filter Toggle */}
          {project && (project.department || (project.techStack && project.techStack.length > 0)) && (
            <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <input
                type="checkbox"
                id="use-project-filters"
                checked={useProjectFilters}
                onChange={(e) => setUseProjectFilters(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="use-project-filters" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Auto-filter faculty based on project requirements
                <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                  ({project.department && `Dept: ${project.department}`}{project.department && project.techStack && project.techStack.length > 0 ? ', ' : ''}{project.techStack && project.techStack.length > 0 && `Tech: ${project.techStack.join(', ')}`})
                </span>
              </label>
            </div>
          )}
          
          {/* Search Filters */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Filter Faculty Members</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="space-y-2">
                <Label htmlFor="search-department" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Filter by Department
                </Label>
                <Input
                  id="search-department"
                  placeholder="e.g., Computer, Electrical..."
                  value={searchDepartment}
                  onChange={(e) => setSearchDepartment(e.target.value)}
                  className="h-10 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-expertise" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Filter by Tech Expertise
                </Label>
                <Input
                  id="search-expertise"
                  placeholder="e.g., React, Machine Learning..."
                  value={searchTechExpertise}
                  onChange={(e) => setSearchTechExpertise(e.target.value)}
                  className="h-10 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Select Faculty Member
              </label>
              {(debouncedDepartment || debouncedTechExpertise) && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-normal px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">
                  Filtered results ({facultyMembers?.length || 0})
                </span>
              )}
            </div>
            {isLoading ? (
              <div className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>
            ) : (
              <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                <SelectTrigger 
                  className="h-12 text-base border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                  data-testid="select-faculty"
                >
                  <SelectValue 
                    placeholder="Choose a faculty member..." 
                    className="text-slate-600 dark:text-slate-400"
                  />
                </SelectTrigger>
                <SelectContent 
                  className="max-h-80 border-slate-200 dark:border-slate-700 rounded-lg shadow-xl bg-white dark:bg-slate-900"
                  position="popper"
                  sideOffset={8}
                >
                  {facultyMembers?.map((faculty) => (
                    <SelectItem 
                      key={faculty.id} 
                      value={faculty.id}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-b-0 min-h-[80px] items-start"
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                              {faculty.firstName && faculty.lastName ? 
                                `${faculty.firstName} ${faculty.lastName}` : 
                                faculty.email?.split('@')[0] || 'Faculty Member'
                              }
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {faculty.institution || 'Institution not specified'}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                              Verified
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {faculty.department && faculty.department !== "Not specified" && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                              Dept: {faculty.department}
                            </span>
                          )}
                          {faculty.techExpertise && faculty.techExpertise !== "Not specified" && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded">
                              Tech: {faculty.techExpertise}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  {facultyMembers?.length === 0 && (
                    <SelectItem 
                      value="no-faculty" 
                      disabled 
                      className="text-slate-500 dark:text-slate-400 py-4 px-4 rounded-md mx-1 my-0.5"
                    >
                      <div className="text-center py-8">
                        <div className="text-slate-400 text-sm">
                          {(searchDepartment || searchTechExpertise)
                            ? "No faculty found matching your search criteria. Try adjusting your filters."
                            : "No verified faculty members found in your institution."}
                        </div>
                        {(debouncedDepartment || debouncedTechExpertise) && (
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSearchDepartment("");
                                setSearchTechExpertise("");
                                setDebouncedDepartment("");
                                setDebouncedTechExpertise("");
                              }}
                              className="text-xs"
                            >
                              Clear Filters
                            </Button>
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {project && (
            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-lg">Project Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Category:</span>
                    <p className="text-slate-900 dark:text-slate-100 mt-1">{project.category}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Department:</span>
                    <p className="text-slate-900 dark:text-slate-100 mt-1">{project.department || "Not specified"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Course:</span>
                    <p className="text-slate-900 dark:text-slate-100 mt-1">{project.courseSubject || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Status:</span>
                    <div className="mt-1">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === "APPROVED" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                          : project.status === "UNDER_REVIEW"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {project.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            data-testid="button-cancel-assign"
            className="px-6 py-2 font-medium"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedFacultyId || assignMutation.isPending}
            data-testid="button-assign-faculty"
            className="px-6 py-2 font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            {assignMutation.isPending ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Assigning...
              </span>
            ) : (
              "Assign to Faculty"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}