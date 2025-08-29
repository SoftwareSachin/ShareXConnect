import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiGet } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { PullRequestModal, PullRequestList, type PullRequestData } from "@/components/modals/pull-request-modal";
import { AutoPRTracker } from "@/components/auto-pr-tracker";
import type { ProjectWithDetails, User, ProjectComment } from "@shared/schema";
import {
  Users, MessageSquare, FileText, Clock, Send, Save, Upload, Download,
  Code2, Eye, Star, CheckCircle, AlertCircle, Calendar, Tag, File,
  Trash2, ExternalLink, Edit, Settings, Globe, Github, FolderOpen,
  BookOpen, Zap, Target, BarChart3, Activity, Bell, Search, Plus,
  ArrowLeft, X, StarOff, UserPlus, Link, Copy
} from 'lucide-react';

interface CollaboratorInterfaceProps {
  project: ProjectWithDetails;
}

interface ProjectFile {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

// Form schema for project editing (same as edit page but for collaborators)
const collaboratorEditSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description is too long"),
  category: z.string().min(1, "Category is required"),
  techStackInput: z.string().optional(),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Invalid demo URL").optional().or(z.literal("")),
  repositoryUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  liveDemoUrl: z.string().url("Invalid live demo URL").optional().or(z.literal("")),
  academicLevel: z.string().optional(),
  department: z.string().optional(), 
  courseSubject: z.string().optional(),
  projectMethodology: z.string().optional(),
  setupInstructions: z.string().optional(),
  repositoryStructure: z.string().optional(),
  readmeContent: z.string().optional(),
  licenseType: z.string().optional(),
  contributingGuidelines: z.string().optional(),
  installationInstructions: z.string().optional(),
  apiDocumentation: z.string().optional(),
});

type CollaboratorEditFormData = z.infer<typeof collaboratorEditSchema>;

const CollaboratorInterface: React.FC<CollaboratorInterfaceProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [changesSinceLastPR, setChangesSinceLastPR] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Check if current user is the project owner
  const isOwner = user?.id === project.owner.id;

  // Track changes for pull request system
  const trackChange = (type: 'details' | 'files' | 'comments', changeData: any) => {
    const change = {
      type,
      timestamp: new Date().toISOString(),
      data: changeData,
      id: `${type}-${Date.now()}`
    };
    
    setPendingChanges(prev => [...prev, change]);
    setChangesSinceLastPR(prev => {
      const newSet = new Set([...prev, type]);
      return Array.from(newSet);
    });
    
    toast({
      title: "Changes Detected",
      description: "Your changes will be prepared for a pull request.",
    });
  };

  // Fetch real project comments from database
  const { data: commentsData, refetch: refetchComments } = useQuery<ProjectComment[]>({
    queryKey: ['/api/projects', project.id, 'comments'],
  });
  const comments = Array.isArray(commentsData) ? commentsData : [];

  // Fetch real collaborators from database
  const { data: collaboratorsData, refetch: refetchCollaborators } = useQuery<User[]>({
    queryKey: ['/api/projects', project.id, 'collaborators'],
  });
  const collaborators = Array.isArray(collaboratorsData) ? collaboratorsData : [];

  // Fetch real project files from database
  const { data: projectFiles = [], refetch: refetchFiles } = useQuery<ProjectFile[]>({
    queryKey: ['/api/projects', project.id, 'files'],
    queryFn: () => apiGet(`/api/projects/${project.id}/files`),
  });

  // Fetch pull requests for this project
  const { data: pullRequests = [], refetch: refetchPRs } = useQuery<any[]>({
    queryKey: [`/api/projects/${project.id}/pull-requests`],
    queryFn: () => apiGet(`/api/projects/${project.id}/pull-requests`),
  });

  // Form for editing project details
  const form = useForm<CollaboratorEditFormData>({
    resolver: zodResolver(collaboratorEditSchema),
    defaultValues: {
      title: project.title || "",
      description: project.description || "",
      category: project.category || "",
      techStackInput: project.techStack ? project.techStack.join(", ") : "",
      githubUrl: project.githubUrl || "",
      demoUrl: project.demoUrl || "",
      repositoryUrl: project.repositoryUrl || "",
      liveDemoUrl: project.liveDemoUrl || "",
      academicLevel: project.academicLevel || "",
      department: project.department || "",
      courseSubject: project.courseSubject || "",
      projectMethodology: project.projectMethodology || "",
      setupInstructions: project.setupInstructions || "",
      repositoryStructure: project.repositoryStructure || "",
      readmeContent: project.readmeContent || "",
      licenseType: project.licenseType || "MIT",
      contributingGuidelines: project.contributingGuidelines || "",
      installationInstructions: project.installationInstructions || "",
      apiDocumentation: project.apiDocumentation || "",
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest('POST', `/api/projects/${project.id}/comments`, { content }),
    onSuccess: () => {
      setNewComment("");
      refetchComments();
      // Track comment change for PR
      trackChange('comments', { content: newComment, action: 'add' });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: CollaboratorEditFormData) => {
      const { techStackInput, ...projectData } = data;
      const techStack = techStackInput
        ? techStackInput.split(",").map(tech => tech.trim()).filter(Boolean)
        : [];

      return await apiRequest('PATCH', `/api/projects/${project.id}`, {
        ...projectData,
        techStack,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
      setIsEditing(false);
      // Track project detail changes for PR
      trackChange('details', { fields: Object.keys(variables), action: 'update' });
      toast({
        title: "Success!",
        description: "Project updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    }
  });

  // File upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    toast({
      title: "Uploading...",
      description: `Uploading ${fileArray.length} file(s)`,
    });

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use authenticated request
        const token = useAuthStore.getState().token;
        const response = await fetch(`/api/projects/${project.id}/files`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          refetchFiles();
          // Track file upload for PR
          trackChange('files', { action: 'upload', fileName: file.name, fileCount: 1 });
        } else {
          // Parse error response to get specific error message
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }
      } catch (error: any) {
        console.error('File upload error:', error);
        
        // Check if it's a pull request required error
        if (error?.message?.includes("pull request") || error?.message?.includes("Collaborators cannot upload")) {
          toast({
            title: "Pull Request Required",
            description: "As a collaborator, you need to create a pull request to propose changes. Upload your files through the Pull Request workflow.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Upload failed",
            description: error?.message || "Failed to upload file. Please try again.",
            variant: "destructive",
          });
        }
      }
    }

    toast({
      title: "Success",
      description: "Files uploaded successfully",
    });
  };

  // Pull request mutations
  const createPRMutation = useMutation({
    mutationFn: async (prData: PullRequestData) => {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', prData.title);
      formData.append('description', prData.description);
      formData.append('branchName', prData.branchName || `pr-${Date.now()}`);
      formData.append('changesPreview', prData.changesPreview || '');
      
      // Add files changed as a JSON array
      formData.append('filesChanged', JSON.stringify(prData.filesChanged));
      
      // Add uploaded files if any
      if (prData.uploadedFiles) {
        Array.from(prData.uploadedFiles).forEach((file, index) => {
          formData.append('files', file);
        });
        console.log(`📁 Uploading ${prData.uploadedFiles.length} files with pull request`);
      }

      // Get authentication token
      const token = useAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/projects/${project.id}/pull-requests`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create pull request');
      }

      return await response.json();
    },
    onSuccess: (response: any) => {
      refetchPRs();
      // Clear tracked changes after successful PR creation
      setPendingChanges([]);
      setChangesSinceLastPR([]);
      toast({
        title: "Pull Request Created",
        description: `Pull request created successfully${response.filesUploaded ? ` with ${response.filesUploaded} file(s)` : ''}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create pull request",
        variant: "destructive",
      });
    }
  });

  const updatePRStatusMutation = useMutation({
    mutationFn: async ({ prId, status }: { prId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/projects/${project.id}/pull-requests/${prId}`, { status });
    },
    onSuccess: () => {
      refetchPRs();
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
      toast({
        title: "Pull Request Updated",
        description: "Pull request status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pull request",
        variant: "destructive",
      });
    }
  });

  // Handle PR creation
  const handleCreatePullRequest = async (prData: PullRequestData) => {
    // Ensure branchName is always present
    const prWithBranch = {
      ...prData,
      branchName: prData.branchName || `pr-${Date.now()}`
    };
    await createPRMutation.mutateAsync(prWithBranch);
  };

  // Handle PR status updates
  const handlePRStatusUpdate = async (prId: string, status: string) => {
    await updatePRStatusMutation.mutateAsync({ prId, status });
  };

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/projects/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete file');
    },
    onSuccess: () => {
      refetchFiles();
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    },
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SUBMITTED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DRAFT': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const onSubmit = (data: CollaboratorEditFormData) => {
    updateProjectMutation.mutate(data);
  };

  // Star project mutation
  const starProjectMutation = useMutation({
    mutationFn: async () => {
      if (project.isStarred) {
        await apiRequest('DELETE', `/api/projects/${project.id}/star`);
      } else {
        await apiRequest('POST', `/api/projects/${project.id}/star`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: project.isStarred ? "Project unstarred" : "Project starred",
        description: project.isStarred ? "Removed from your starred projects" : "Added to your starred projects",
      });
    },
  });

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }}>
      {/* Glassmorphism Header */}
      <div className="sticky top-0 z-50" style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
              }}>
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{project.title}</h1>
                <p className="text-sm text-slate-600">Collaboration Workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(project.status)} border`}>
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                <Users className="w-3 h-3 mr-1" />
                Collaborator
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-8" style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '16px',
                padding: '4px'
              }}>
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-0 rounded-xl transition-all duration-200"
                >
                  <Eye className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="edit" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-0 rounded-xl transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                  Edit Details
                </TabsTrigger>
                <TabsTrigger 
                  value="files" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-0 rounded-xl transition-all duration-200"
                >
                  <FileText className="w-4 h-4" />
                  Files
                </TabsTrigger>
                <TabsTrigger 
                  value="discussion" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-0 rounded-xl transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  Discussion
                </TabsTrigger>
                <TabsTrigger 
                  value="team" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-0 rounded-xl transition-all duration-200"
                >
                  <Users className="w-4 h-4" />
                  Team
                </TabsTrigger>
                <TabsTrigger 
                  value="pull-requests" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-0 rounded-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Pull Requests
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-0" style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">Project Overview</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-white/50 border-slate-200">
                          {project.visibility}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-white/50 border-slate-200">
                          {project.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-slate-700 leading-relaxed">{project.description}</p>
                    
                    {project.techStack && project.techStack.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Technology Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-6 rounded-2xl" style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        <FolderOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-900 mb-1">{projectFiles.length}</p>
                        <p className="text-sm font-medium text-slate-600">Files</p>
                      </div>
                      <div className="text-center p-6 rounded-2xl" style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                      }}>
                        <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-900 mb-1">{comments.length}</p>
                        <p className="text-sm font-medium text-slate-600">Comments</p>
                      </div>
                      <div className="text-center p-6 rounded-2xl" style={{
                        background: 'rgba(147, 51, 234, 0.1)',
                        border: '1px solid rgba(147, 51, 234, 0.2)'
                      }}>
                        <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-900 mb-1">{collaborators.length + 1}</p>
                        <p className="text-sm font-medium text-slate-600">Team Size</p>
                      </div>
                      <div className="text-center p-6 rounded-2xl" style={{
                        background: 'rgba(249, 115, 22, 0.1)',
                        border: '1px solid rgba(249, 115, 22, 0.2)'
                      }}>
                        <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-900 mb-1">
                          {Math.ceil((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </p>
                        <p className="text-sm font-medium text-slate-600">Days Active</p>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {project.githubUrl && (
                        <Button variant="outline" className="justify-start gap-2" asChild>
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4" />
                            GitHub
                          </a>
                        </Button>
                      )}
                      {project.demoUrl && (
                        <Button variant="outline" className="justify-start gap-2" asChild>
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {project.liveDemoUrl && (
                        <Button variant="outline" className="justify-start gap-2" asChild>
                          <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="justify-start gap-2 hover:bg-yellow-50 hover:border-yellow-300"
                        onClick={() => starProjectMutation.mutate()}
                        disabled={starProjectMutation.isPending}
                      >
                        {project.isStarred ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        {starProjectMutation.isPending ? 'Loading...' : (project.isStarred ? 'Unstar Project' : 'Star Project')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Edit Details Tab */}
              <TabsContent value="edit" className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card className="border-0" style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900">Project Details</h3>
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" onClick={() => form.reset()} className="bg-white/50">
                            <X className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={updateProjectMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="title">Project Title</Label>
                          <Input
                            {...form.register("title")}
                            id="title"
                            className="mt-1"
                          />
                          {form.formState.errors.title && (
                            <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Web Development">Web Development</SelectItem>
                              <SelectItem value="Mobile Apps">Mobile Apps</SelectItem>
                              <SelectItem value="Data Science">Data Science</SelectItem>
                              <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                              <SelectItem value="Game Development">Game Development</SelectItem>
                              <SelectItem value="Desktop Applications">Desktop Applications</SelectItem>
                              <SelectItem value="DevOps">DevOps</SelectItem>
                              <SelectItem value="Blockchain">Blockchain</SelectItem>
                              <SelectItem value="IoT">IoT</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          {...form.register("description")}
                          id="description"
                          rows={4}
                          className="mt-1"
                        />
                        {form.formState.errors.description && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="techStackInput">Technology Stack</Label>
                        <Input
                          {...form.register("techStackInput")}
                          id="techStackInput"
                          placeholder="React, Node.js, MongoDB, etc. (comma separated)"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="githubUrl">GitHub URL</Label>
                          <Input
                            {...form.register("githubUrl")}
                            id="githubUrl"
                            placeholder="https://github.com/username/repo"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="demoUrl">Demo URL</Label>
                          <Input
                            {...form.register("demoUrl")}
                            id="demoUrl"
                            placeholder="https://your-demo.com"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="repositoryUrl">Repository URL</Label>
                          <Input
                            {...form.register("repositoryUrl")}
                            id="repositoryUrl"
                            placeholder="https://gitlab.com/username/repo"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="liveDemoUrl">Live Demo URL</Label>
                          <Input
                            {...form.register("liveDemoUrl")}
                            id="liveDemoUrl"
                            placeholder="https://your-live-app.com"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="academicLevel">Academic Level</Label>
                          <Input
                            {...form.register("academicLevel")}
                            id="academicLevel"
                            placeholder="Undergraduate, Graduate, etc."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="department">Department</Label>
                          <Input
                            {...form.register("department")}
                            id="department"
                            placeholder="Computer Science, Engineering, etc."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="courseSubject">Course/Subject</Label>
                          <Input
                            {...form.register("courseSubject")}
                            id="courseSubject"
                            placeholder="CS 101, Data Structures, etc."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="projectMethodology">Methodology</Label>
                          <Input
                            {...form.register("projectMethodology")}
                            id="projectMethodology"
                            placeholder="Agile, Waterfall, Scrum, etc."
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="setupInstructions">Setup Instructions</Label>
                        <Textarea
                          {...form.register("setupInstructions")}
                          id="setupInstructions"
                          rows={3}
                          placeholder="How to set up and run the project..."
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="readmeContent">README Content</Label>
                        <Textarea
                          {...form.register("readmeContent")}
                          id="readmeContent"
                          rows={6}
                          placeholder="Project documentation and README content..."
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="licenseType">License</Label>
                          <Select value={form.watch("licenseType")} onValueChange={(value) => form.setValue("licenseType", value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MIT">MIT</SelectItem>
                              <SelectItem value="Apache 2.0">Apache 2.0</SelectItem>
                              <SelectItem value="GPL v3">GPL v3</SelectItem>
                              <SelectItem value="BSD 3-Clause">BSD 3-Clause</SelectItem>
                              <SelectItem value="Proprietary">Proprietary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="repositoryStructure">Repository Structure</Label>
                          <Input
                            {...form.register("repositoryStructure")}
                            id="repositoryStructure"
                            placeholder="Brief description of project structure"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-6">
                <Card className="border-0" style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">Project Files ({projectFiles.length})</h3>
                      <div>
                        <input
                          type="file"
                          multiple
                          {...({ webkitdirectory: "", directory: "" } as any)}
                          className="hidden"
                          id="file-upload"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          accept="*/*,.zip,.rar,.7z,.tar,.gz,.pdf,.doc,.docx,.txt,.md,.json,.xml,.csv"
                        />
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          id="regular-file-upload"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          accept="*/*,.zip,.rar,.7z,.tar,.gz,.pdf,.doc,.docx,.txt,.md,.json,.xml,.csv,.png,.jpg,.jpeg,.gif,.svg,.webp,.mp4,.mov,.avi,.mp3,.wav"
                        />
                        <div className="flex gap-2">
                          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                            <label htmlFor="regular-file-upload" className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Files
                            </label>
                          </Button>
                          <Button asChild variant="outline" className="bg-white/50">
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <FolderOpen className="w-4 h-4 mr-2" />
                              Upload Folder
                            </label>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {projectFiles.length > 0 ? (
                      <div className="space-y-3">
                        {projectFiles.map((file) => (
                          <div 
                            key={file.id} 
                            className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:shadow-md" 
                            style={{
                              background: 'rgba(248, 250, 252, 0.8)',
                              border: '1px solid rgba(148, 163, 184, 0.2)'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <File className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-slate-900">{file.fileName}</p>
                                <p className="text-xs text-slate-600">
                                  {formatFileSize(file.fileSize)} • {formatDate(file.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-green-50 border-green-200"
                                onClick={() => window.open(`/api/projects/files/${file.id}/download`, '_blank')}
                              >
                                <Download className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-red-50 border-red-200"
                                onClick={() => deleteFileMutation.mutate(file.id)}
                                disabled={deleteFileMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="text-lg font-medium text-slate-900 mb-2">No files yet</h4>
                        <p className="text-slate-600 mb-4">Upload files to share with your team</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discussion Tab */}
              <TabsContent value="discussion" className="space-y-6">
                <Card className="border-0" style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <CardHeader>
                    <h3 className="text-xl font-bold text-slate-900">Team Discussion</h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Share your thoughts, ask questions, or provide feedback..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-24 bg-white/50 border-slate-200 rounded-xl"
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => addCommentMutation.mutate(newComment)}
                          disabled={!newComment.trim() || addCommentMutation.isPending}
                          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="w-4 h-4" />
                          Post Comment
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="max-h-96">
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div 
                            key={comment.id} 
                            className="p-4 rounded-2xl" 
                            style={{
                              background: 'rgba(248, 250, 252, 0.8)',
                              border: '1px solid rgba(148, 163, 184, 0.2)'
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-slate-200 text-slate-700">
                                  {getInitials('A', 'U')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-sm text-slate-900">
                                    Anonymous User
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {formatDate(comment.createdAt.toString())}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {comments.length === 0 && (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                              <MessageSquare className="w-8 h-8 text-slate-400" />
                            </div>
                            <h4 className="text-lg font-medium text-slate-900 mb-2">No comments yet</h4>
                            <p className="text-slate-600">Be the first to start a discussion!</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="space-y-6">
                <Card className="border-0" style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <CardHeader>
                    <h3 className="text-xl font-bold text-slate-900">Team Members ({collaborators.length + 1})</h3>
                    <p className="text-sm text-slate-600">Owner + {collaborators.length} Collaborators</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Project Owner */}
                      <div 
                        className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200" 
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
                          border: '2px solid rgba(59, 130, 246, 0.2)'
                        }}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-600 text-white text-lg font-bold">
                            {getInitials(project.owner.firstName || '', project.owner.lastName || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{project.owner.firstName || ''} {project.owner.lastName || ''}</p>
                          <p className="text-sm text-slate-600">Project Owner • {project.owner.role}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">Owner</Badge>
                      </div>

                      {/* Collaborators */}
                      {collaborators.map((collaborator) => (
                        <div 
                          key={collaborator.id} 
                          className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200" 
                          style={{
                            background: 'rgba(248, 250, 252, 0.8)',
                            border: '1px solid rgba(148, 163, 184, 0.2)'
                          }}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-slate-200 text-slate-700 text-lg font-bold">
                              {getInitials(collaborator.firstName || '', collaborator.lastName || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{collaborator.firstName || ''} {collaborator.lastName || ''}</p>
                            <p className="text-sm text-slate-600">Collaborator • {collaborator.role}</p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">Team Member</Badge>
                        </div>
                      ))}

                      {collaborators.length === 0 && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                          </div>
                          <h4 className="text-lg font-medium text-slate-900 mb-2">Just you and the owner</h4>
                          <p className="text-slate-600">More team members may join later</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pull Requests Tab */}
              <TabsContent value="pull-requests" className="space-y-6">
                <Card className="border-0" style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '16px'
                }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-800">Pull Requests</h3>
                      <PullRequestModal
                        projectId={project.id}
                        onSubmit={handleCreatePullRequest}
                        trigger={
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Pull Request
                          </Button>
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <AutoPRTracker
                        projectId={project.id}
                        isCollaborator={true}
                        onCreatePR={handleCreatePullRequest}
                        pendingChanges={pendingChanges}
                        changesSinceLastPR={changesSinceLastPR}
                      />
                      
                      <PullRequestList
                        projectId={project.id}
                        pullRequests={pullRequests}
                        isOwner={isOwner}
                        onStatusUpdate={handlePRStatusUpdate}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <Card className="border-0" style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <CardHeader className="pb-4">
                <h3 className="font-bold text-slate-900">Project Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Created</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">Files</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{projectFiles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-slate-700">Comments</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-slate-700">Team Size</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{collaborators.length + 1}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0" style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <CardHeader className="pb-4">
                <h3 className="font-bold text-slate-900">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2 bg-white/50 hover:bg-white/70 border-slate-200">
                  <Download className="w-4 h-4 text-green-600" />
                  Download Project
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 bg-white/50 hover:bg-white/70 border-slate-200"
                  onClick={() => starProjectMutation.mutate()}
                  disabled={starProjectMutation.isPending}
                >
                  {project.isStarred ? <StarOff className="w-4 h-4 text-yellow-600" /> : <Star className="w-4 h-4 text-yellow-600" />}
                  {starProjectMutation.isPending ? 'Loading...' : (project.isStarred ? 'Unstar Project' : 'Star Project')}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-white/50 hover:bg-white/70 border-slate-200">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Watch Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorInterface;