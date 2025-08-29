import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import type { ProjectWithDetails } from "@shared/schema";
import CollaboratorInterface from "@/components/collaborator-interface";
import { Loader2, AlertCircle } from "lucide-react";

interface ProjectCollaborateParams {
  id: string;
}

export default function ProjectCollaborate() {
  const params = useParams<ProjectCollaborateParams>();
  const { user } = useAuthStore();

  // Fetch project data
  const { data: project, isLoading, error } = useQuery<ProjectWithDetails>({
    queryKey: ['/api/projects', params.id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading collaboration workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Project Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400">The project you're trying to access doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  // Both owners and collaborators can access the collaboration interface
  // Owners can manage pull requests and see collaboration activity
  // Collaborators can work on the project and create pull requests
  
  return <CollaboratorInterface project={project} />;
}