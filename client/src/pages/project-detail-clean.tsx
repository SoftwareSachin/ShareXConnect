import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageCircle, Send } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { ProjectWithDetails, ProjectComment } from "@shared/schema";
import { useState } from "react";

interface ProjectDetailParams {
  id: string;
}

export default function ProjectDetail() {
  const params = useParams<ProjectDetailParams>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  
  const { data: project, isLoading, error } = useQuery<ProjectWithDetails>({
    queryKey: [`/api/projects/${params.id}`],
    queryFn: async (): Promise<ProjectWithDetails> => {
      console.log('🔍 Fetching project with ID:', params.id);
      console.log('🔗 API URL:', `/api/projects/${params.id}`);
      try {
        const result = await apiGet<ProjectWithDetails>(`/api/projects/${params.id}`);
        console.log('✅ Project data received:', result);
        return result;
      } catch (err) {
        console.error('❌ Error fetching project:', err);
        throw err;
      }
    }
  });

  // Fetch comments
  const { data: commentsResponse, isLoading: isCommentsLoading } = useQuery({
    queryKey: [`/api/projects/${params.id}/comments`],
    queryFn: async () => {
      const response = await apiGet(`/api/projects/${params.id}/comments`);
      return response as { comments: ProjectComment[]; pagination: any };
    },
    enabled: !!params.id
  });

  // Star mutation
  const starMutation = useMutation({
    mutationFn: async () => {
      if (project?.isStarred) {
        await apiDelete(`/api/projects/${params.id}/star`);
      } else {
        await apiPost(`/api/projects/${params.id}/star`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${params.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: project?.isStarred ? "Project unstarred" : "Project starred",
        description: project?.isStarred 
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

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiPost(`/api/projects/${params.id}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${params.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${params.id}`] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment.trim());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-red-600 dark:text-red-400 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Project Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <button 
            onClick={() => setLocation("/projects")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setLocation("/projects")}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              ← Back to Projects
            </button>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => starMutation.mutate()}
                    disabled={starMutation.isPending}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    data-testid={`button-star-${project?.id}`}
                  >
                    <Star className={`w-4 h-4 mr-2 ${project?.isStarred ? "fill-current text-yellow-500" : ""}`} />
                    {project?.isStarred ? 'Unstar' : 'Star'} ({project?.starCount || 0})
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const commentsSection = document.getElementById('comments-section');
                      commentsSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Comment ({project?.commentCount || 0})
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 mb-8">
          <div className="px-8 py-8">
            {/* Status and Metadata Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Badge 
                  className={`${getStatusColor(project.status)} font-medium px-3 py-1.5 text-sm`}
                >
                  {project.status.replace("_", " ")}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="font-medium px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {project.category}
                </Badge>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {project.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            
            {/* Project Title and Description */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                {project.title}
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
                {project.description}
              </p>
            </div>

            {/* Author Information */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                <span className="text-white font-semibold">
                  {getInitials(project.owner.firstName || '', project.owner.lastName || '')}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {project.owner.firstName} {project.owner.lastName}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {project.owner.institution}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Technology Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Technology Stack
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Tools and frameworks used in this project
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {project.techStack.map((tech: string, index: number) => (
                      <div key={tech} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {tech}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Project Links */}
            {(project.githubUrl || project.demoUrl) && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Project Links
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    External resources and live demonstrations
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              View Repository
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Browse source code and documentation
                            </p>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            GitHub
                          </div>
                        </div>
                      </a>
                    )}
                    {project.demoUrl && (
                      <a 
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              Live Demo
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Try the application in your browser
                            </p>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Demo
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Documentation */}
            {project.readmeContent && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Documentation
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Project guide and setup instructions
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="bg-slate-900 dark:bg-black rounded-lg overflow-hidden border border-slate-700">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-mono text-slate-300">README.md</span>
                      </div>
                      <div className="text-xs text-slate-400">markdown</div>
                    </div>
                    
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <pre className="text-sm font-mono text-green-400 leading-relaxed whitespace-pre-wrap">
                        <code>{project.readmeContent}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Project Info */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Project Info
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Basic project information and metadata
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.status.replace("_", " ")}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Visibility</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.visibility}</dd>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Files */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Project Files
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Source code and project assets
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-mono">ZIP</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">project-source.zip</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Complete source code archive</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* License */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  License
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Project licensing information
                </p>
              </div>
              
              <div className="p-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">MIT License</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Free and open source software license
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Open Source</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Statistics
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Project engagement and activity metrics
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid={`text-stars-${project.id}`}>
                      {project.starCount || 0}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Stars</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid={`text-comments-${project.id}`}>
                      {project.commentCount || 0}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Comments</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid={`text-collaborators-${project.id}`}>
                      {project.collaborators?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Collaborators</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {project.visibility === 'PUBLIC' ? '∞' : '🔒'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Access</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div id="comments-section" className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Comments ({project.commentCount || 0})
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Discussion and feedback from the community
                </p>
              </div>
              
              <div className="p-6">
                {/* Add Comment Form */}
                {user && (
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Share your thoughts about this project..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px] resize-none"
                          data-testid={`textarea-comment-${project.id}`}
                        />
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {newComment.length}/1000 characters
                          </p>
                          <Button
                            onClick={handleCommentSubmit}
                            disabled={!newComment.trim() || commentMutation.isPending}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            data-testid={`button-submit-comment-${project.id}`}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {isCommentsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Loading comments...</p>
                    </div>
                  ) : commentsResponse?.comments && commentsResponse.comments.length > 0 ? (
                    commentsResponse.comments.map((comment) => (
                      <div key={comment.id} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0" data-testid={`comment-${comment.id}`}>
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {comment.author.firstName.charAt(0)}{comment.author.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {comment.author.firstName} {comment.author.lastName}
                              </h4>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {comment.author.institution}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                •
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 mb-2">No comments yet</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        {user ? "Be the first to share your thoughts!" : "Sign in to add a comment"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Author Card */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center border-4 border-slate-200 dark:border-slate-700">
                    <span className="text-white font-bold text-2xl">
                      {getInitials(project.owner.firstName || '', project.owner.lastName || '')}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">
                  {project.owner.firstName} {project.owner.lastName}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                  {project.owner.institution}
                </p>
                <Badge 
                  variant="secondary" 
                  className="font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                >
                  {project.owner.role.toLowerCase()}
                </Badge>
              </CardHeader>
            </Card>

            {/* Project Stats */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6">
              <CardHeader className="pb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  Activity
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Views</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Project visibility</p>
                  </div>
                  <span className="font-bold text-lg text-slate-900 dark:text-slate-100">0</span>
                </div>
                
                <Separator className="bg-slate-200 dark:bg-slate-800" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Stars</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Community love</p>
                  </div>
                  <span className="font-bold text-lg text-slate-900 dark:text-slate-100">0</span>
                </div>
                
                <Separator className="bg-slate-200 dark:bg-slate-800" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Comments</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Feedback & Discussion</p>
                  </div>
                  <span className="font-bold text-lg text-slate-900 dark:text-slate-100">0</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Star this project</span>
                </button>
                
                <button className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Download ZIP</span>
                </button>
                
                <button className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Add comment</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

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