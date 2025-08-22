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
      return apiRequest(`/api/projects/${projectId}/assign-faculty`, "POST", { facultyId });
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg">
        <DialogHeader>
          <DialogTitle>Assign Project to Faculty</DialogTitle>
          <DialogDescription>
            Select a faculty member to review and grade your project: <strong>{project?.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label htmlFor="faculty-select" className="text-sm font-medium">
              Select Faculty Member
            </label>
            {isLoading ? (
              <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md"></div>
            ) : (
              <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                <SelectTrigger data-testid="select-faculty">
                  <SelectValue placeholder="Choose a faculty member..." />
                </SelectTrigger>
                <SelectContent>
                  {facultyMembers?.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.firstName} {faculty.lastName} - {faculty.institution}
                    </SelectItem>
                  ))}
                  {facultyMembers?.length === 0 && (
                    <SelectItem value="no-faculty" disabled>
                      No faculty members found in your institution
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {project && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Project Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Category:</span> {project.category}</p>
                <p><span className="font-medium">Department:</span> {project.department || "Not specified"}</p>
                <p><span className="font-medium">Course:</span> {project.courseSubject || "Not specified"}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                    project.status === "APPROVED" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : project.status === "UNDER_REVIEW"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}>
                    {project.status.replace("_", " ")}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            data-testid="button-cancel-assign"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedFacultyId || assignMutation.isPending}
            data-testid="button-assign-faculty"
          >
            {assignMutation.isPending ? "Assigning..." : "Assign to Faculty"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}