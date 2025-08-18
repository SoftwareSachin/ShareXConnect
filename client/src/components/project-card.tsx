import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Users, MessageCircle, ExternalLink } from "lucide-react";
import type { ProjectWithDetails } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiDelete } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  project: ProjectWithDetails;
  onView?: (project: ProjectWithDetails) => void;
}

export function ProjectCard({ project, onView }: ProjectCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const starMutation = useMutation({
    mutationFn: async () => {
      if (project.isStarred) {
        await apiDelete(`/api/projects/${project.id}/star`);
      } else {
        await apiPost(`/api/projects/${project.id}/star`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: project.isStarred ? "Project unstarred" : "Project starred",
        description: project.isStarred 
          ? "Removed from your starred projects" 
          : "Added to your starred projects",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update star status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "under_review":
        return "bg-amber-100 text-amber-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-green-100 text-green-800";
      case "institution":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTechStackGradient = (techStack: string[]) => {
    const gradients = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-teal-500 to-teal-600",
    ];
    
    const hash = techStack.join("").split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return gradients[Math.abs(hash) % gradients.length];
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-project-${project.id}`}>
      {/* Project header */}
      <div className={`h-40 bg-gradient-to-br ${getTechStackGradient(project.techStack || [])} rounded-t-lg flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="text-white text-2xl font-bold relative z-10">
          {(project.techStack && project.techStack[0]) || "📁"}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1" data-testid={`text-title-${project.id}`}>
              {project.title}
            </h4>
            <Badge className={getStatusColor(project.status)} variant="secondary">
              {project.status.replace("_", " ")}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => starMutation.mutate()}
            disabled={starMutation.isPending}
            className="text-muted-foreground hover:text-accent"
            data-testid={`button-star-${project.id}`}
          >
            <Star className={`w-5 h-5 ${project.isStarred ? "fill-current text-accent" : ""}`} />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4" data-testid={`text-description-${project.id}`}>
          {project.description}
        </p>

        {/* Author info */}
        <div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">
              {getInitials(project.owner.firstName, project.owner.lastName)}
            </AvatarFallback>
          </Avatar>
          <span>by {project.owner.firstName} {project.owner.lastName}</span>
          <span>•</span>
          <span>{project.owner.institution}</span>
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(project.techStack || []).slice(0, 3).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {(project.techStack && project.techStack.length > 3) && (
            <Badge variant="outline" className="text-xs">
              +{project.techStack.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className={`w-4 h-4 ${project.starCount > 0 ? "text-accent fill-current" : ""}`} />
              <span data-testid={`text-stars-${project.id}`}>{project.starCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span data-testid={`text-collaborators-${project.id}`}>{project.collaborators.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span data-testid={`text-comments-${project.id}`}>{project.commentCount}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getVisibilityColor(project.visibility)} variant="secondary">
              {project.visibility}
            </Badge>
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(project)}
                data-testid={`button-view-${project.id}`}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
