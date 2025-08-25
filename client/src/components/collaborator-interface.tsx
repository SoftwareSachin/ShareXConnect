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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiGet } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { ProjectWithDetails, User, ProjectComment } from "@shared/schema";
import {
  Users, MessageSquare, FileText, Clock, Send, Save, Upload, Download,
  Code2, Eye, Star, CheckCircle, AlertCircle, Calendar, Tag, File,
  Trash2, ExternalLink, Edit, Settings, Globe, Github, FolderOpen,
  BookOpen, Zap, Target, BarChart3, Activity, Bell, Search, Plus,
  ArrowLeft, X
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
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

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
      apiRequest(`/api/projects/${project.id}/comments`, 'POST', { content }),
    onSuccess: () => {
      setNewComment("");
      refetchComments();
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

      return await apiRequest(`/api/projects/${project.id}`, 'PATCH', {
        ...projectData,
        techStack,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
      setIsEditing(false);
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
        
        const response = await fetch(`/api/projects/${project.id}/files`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (response.ok) {
          refetchFiles();
        }
      } catch (error) {
        console.error('File upload error:', error);
      }
    }

    toast({
      title: "Success",
      description: "Files uploaded successfully",
    });
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Modern Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{project.title}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Collaboration Workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(project.status)} border`}>
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Details
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="discussion" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discussion
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Project Overview</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {project.visibility}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {project.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-slate-600 dark:text-slate-400">{project.description}</p>
                    
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
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <FolderOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projectFiles.length}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Files</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <MessageSquare className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{comments.length}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Comments</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{collaborators.length + 1}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Team Members</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {Math.ceil((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Days Active</p>
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
                      <Button variant="outline" className="justify-start gap-2">
                        <Star className="w-4 h-4" />
                        Star Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Edit Details Tab */}
              <TabsContent value="edit" className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Project Details</h3>
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" onClick={() => form.reset()}>
                            <X className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                          <Button type="submit" disabled={updateProjectMutation.isPending}>
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
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Project Files</h3>
                      <div>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          id="file-upload"
                          onChange={(e) => handleFileUpload(e.target.files)}
                        />
                        <Button asChild>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Files
                          </label>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {projectFiles.length > 0 ? (
                      <div className="space-y-3">
                        {projectFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <File className="w-5 h-5 text-slate-500" />
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{file.fileName}</p>
                                <p className="text-sm text-slate-500">
                                  {formatFileSize(file.fileSize)} • {formatDate(file.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/api/projects/files/${file.id}/download`, '_blank')}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteFileMutation.mutate(file.id)}
                                disabled={deleteFileMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No files yet</h4>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">Upload files to share with your team</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discussion Tab */}
              <TabsContent value="discussion" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Team Discussion</h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Share your thoughts, ask questions, or provide feedback..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-24"
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => addCommentMutation.mutate(newComment)}
                          disabled={!newComment.trim() || addCommentMutation.isPending}
                          className="gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Post Comment
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {getInitials('A', 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-sm">
                                  Anonymous User
                                </span>
                                <span className="text-xs text-slate-500">
                                  {formatDate(comment.createdAt.toString())}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No comments yet</h4>
                          <p className="text-slate-600 dark:text-slate-400">Be the first to start a discussion!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Team Members ({collaborators.length + 1})</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Project Owner */}
                      <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Avatar>
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getInitials(project.owner.firstName || '', project.owner.lastName || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{project.owner.firstName || ''} {project.owner.lastName || ''}</p>
                          <p className="text-xs text-slate-500">Project Owner • {project.owner.role}</p>
                        </div>
                        <Badge variant="secondary">Owner</Badge>
                      </div>

                      {/* Collaborators */}
                      {collaborators.map((collaborator) => (
                        <div key={collaborator.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(collaborator.firstName || '', collaborator.lastName || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{collaborator.firstName || ''} {collaborator.lastName || ''}</p>
                            <p className="text-xs text-slate-500">Collaborator • {collaborator.role}</p>
                          </div>
                          <Badge variant="outline">Team Member</Badge>
                        </div>
                      ))}

                      {collaborators.length === 0 && (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Just you and the owner</h4>
                          <p className="text-slate-600 dark:text-slate-400">More team members may join later</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <Card>
              <CardHeader className="pb-4">
                <h3 className="font-semibold">Project Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">Files</span>
                  </div>
                  <span className="text-sm font-medium">{projectFiles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">Comments</span>
                  </div>
                  <span className="text-sm font-medium">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">Team Size</span>
                  </div>
                  <span className="text-sm font-medium">{collaborators.length + 1}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <h3 className="font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Download Project
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Star className="w-4 h-4" />
                  Star Project
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Bell className="w-4 h-4" />
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