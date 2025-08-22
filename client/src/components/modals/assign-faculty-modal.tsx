import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset selection when modal closes or project changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedFacultyId("");
    }
    onOpenChange(newOpen);
  };

  // Fetch faculty members from the same institution
  const { data: facultyMembers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/faculty"],
    enabled: open,
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

        <div className="space-y-8 py-2">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
              Select Faculty Member
            </label>
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
                <SelectContent className="max-h-60 border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                  {facultyMembers?.map((faculty) => (
                    <SelectItem 
                      key={faculty.id} 
                      value={faculty.id}
                      className="py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {faculty.firstName} {faculty.lastName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {faculty.institution}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {facultyMembers?.length === 0 && (
                    <SelectItem value="no-faculty" disabled className="text-slate-500 dark:text-slate-400">
                      No faculty members found in your institution
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