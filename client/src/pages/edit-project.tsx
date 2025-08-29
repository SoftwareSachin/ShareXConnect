import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiRequest } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { ArrowLeft, Save, X, Upload, File, Trash2, Download } from "lucide-react";
import type { ProjectWithDetails } from "@shared/schema";

interface EditProjectParams {
  id: string;
}

interface ProjectFile {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

// Form schema for editing projects
const editProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description is too long"),
  category: z.string().min(1, "Category is required"),
  visibility: z.enum(["PRIVATE", "INSTITUTION", "PUBLIC"]),
  status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"]),
  techStackInput: z.string().optional(),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Invalid demo URL").optional().or(z.literal("")),
  // Academic fields
  academicLevel: z.string().optional(),
  department: z.string().optional(), 
  courseSubject: z.string().optional(),
  projectMethodology: z.string().optional(),
  setupInstructions: z.string().optional(),
  repositoryUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  liveDemoUrl: z.string().url("Invalid live demo URL").optional().or(z.literal("")),
  // GitHub-like repository fields
  repositoryStructure: z.string().optional(),
  readmeContent: z.string().optional(),
  licenseType: z.string().optional(),
  contributingGuidelines: z.string().optional(),
  installationInstructions: z.string().optional(),
  apiDocumentation: z.string().optional(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

export default function EditProject() {
  const params = useParams<EditProjectParams>();
  const id = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState({
    sourceCode: null as File | null,
    sourceFolder: [] as File[],
    documentation: [] as File[],
    images: [] as File[],
  });

  // Fetch project data
  const { data: project, isLoading, refetch } = useQuery<ProjectWithDetails>({
    queryKey: ['/api/projects', id],
    queryFn: () => apiGet(`/api/projects/${id}`)
  });

  // Fetch existing project files
  const { data: existingFiles = [], refetch: refetchFiles } = useQuery<ProjectFile[]>({
    queryKey: ['/api/projects', id, 'files'],
    queryFn: () => apiGet(`/api/projects/${id}/files`),
    enabled: !!id
  });

  // Fetch project collaborators to check edit permissions
  const { data: collaborators = [] } = useQuery<Array<{id: string, email: string, isOwner?: boolean}>>({
    queryKey: ['/api/projects', id, 'collaborators'],
    queryFn: () => apiGet(`/api/projects/${id}/collaborators`),
    enabled: !!id
  });

  // File upload handlers
  const handleFileUpload = async (type: keyof typeof uploadedFiles, files: FileList | null) => {
    if (!files) return;
    
    setUploadedFiles(prev => ({
      ...prev,
      [type]: type === 'sourceCode' ? files[0] : Array.from(files)
    }));

    // Upload files immediately and update project
    const fileArray = Array.from(files);
    
    toast({
      title: "Uploading...",
      description: `Uploading ${fileArray.length} file(s)`,
    });

    let successCount = 0;
    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Get auth token from localStorage
        const authData = localStorage.getItem('auth-storage');
        const headers: Record<string, string> = {};
        
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
        
        const response = await fetch(`/api/projects/${id}/files`, {
          method: 'POST',
          headers,
          body: formData,
          credentials: 'include'
        });

        if (response.ok) {
          successCount++;
          console.log('✅ File uploaded immediately:', file.name);
        } else {
          console.error('❌ Failed to upload:', file.name);
        }
      } catch (error) {
        console.error('❌ Upload error for', file.name, ':', error);
      }
    }

    if (successCount > 0) {
      // Refresh file list to show new files immediately
      refetchFiles();
      toast({
        title: "Success!",
        description: `${successCount} file(s) uploaded successfully`,
      });
    }

    if (successCount < fileArray.length) {
      toast({
        title: "Warning",
        description: `${fileArray.length - successCount} file(s) failed to upload`,
        variant: "destructive",
      });
    }
  };

  const getFileDisplayText = (type: keyof typeof uploadedFiles) => {
    const files = uploadedFiles[type];
    if (!files) return null;
    
    if (type === 'sourceCode') {
      return files ? `Selected: ${(files as File).name}` : null;
    } else {
      const fileArray = files as File[];
      return fileArray.length > 0 ? `${fileArray.length} file(s) selected` : null;
    }
  };

  // Initialize form with project data
  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      visibility: "PRIVATE",
      status: "DRAFT",
      techStackInput: "",
      githubUrl: "",
      demoUrl: "",
      academicLevel: "",
      department: "",
      courseSubject: "",
      projectMethodology: "",
      setupInstructions: "",
      repositoryUrl: "",
      liveDemoUrl: "",
      repositoryStructure: "",
      readmeContent: "",
      licenseType: "MIT",
      contributingGuidelines: "",
      installationInstructions: "",
      apiDocumentation: "",
    }
  });

  // Update form when project data loads
  React.useEffect(() => {
    if (project) {
      const techStackString = project.techStack ? project.techStack.join(", ") : "";
      form.reset({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        visibility: project.visibility,
        status: project.status,
        techStackInput: techStackString,
        githubUrl: project.githubUrl || "",
        demoUrl: project.demoUrl || "",
        academicLevel: project.academicLevel || "",
        department: project.department || "",
        courseSubject: project.courseSubject || "",
        projectMethodology: project.projectMethodology || "",
        setupInstructions: project.setupInstructions || "",
        repositoryUrl: project.repositoryUrl || "",
        liveDemoUrl: project.liveDemoUrl || "",
        repositoryStructure: project.repositoryStructure || "",
        readmeContent: project.readmeContent || "",
        licenseType: project.licenseType || "MIT",
        contributingGuidelines: project.contributingGuidelines || "",
        installationInstructions: project.installationInstructions || "",
        apiDocumentation: project.apiDocumentation || "",
      });
    }
  }, [project, form]);

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: EditProjectFormData) => {
      const { techStackInput, ...projectData } = data;
      
      // Parse tech stack from comma-separated string
      const techStack = techStackInput
        ? techStackInput.split(",").map(tech => tech.trim()).filter(Boolean)
        : [];

      const enhancedProjectData = {
        ...projectData,
        techStack,
      };

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedProjectData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const result = await response.json();

      // Files are already uploaded immediately when selected, 
      // so we just need to update the project metadata here

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      refetch();  // Refresh project data
      refetchFiles();  // Refresh file list
      // Clear uploaded files after successful submission
      setUploadedFiles({
        sourceCode: null,
        sourceFolder: [],
        documentation: [],
        images: [],
      });
      toast({
        title: "Success!",
        description: "Project updated successfully",
      });
      setLocation(`/project/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/projects/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
    },
    onSuccess: () => {
      refetchFiles();
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  });

  // Check if user can edit (owner OR collaborator)
  const canEdit = user && project && (
    user.id === project.ownerId || 
    collaborators.some((collab) => collab.id === user.id)
  );

  // Debug logging
  console.log('🔍 Edit Permission Debug:', {
    userId: user?.id,
    projectOwnerId: project?.ownerId,
    isOwner: user?.id === project?.ownerId,
    collaborators: collaborators,
    isCollaborator: collaborators.some((collab) => collab.id === user?.id),
    canEdit: canEdit
  });

  const handleCancel = () => {
    setLocation(`/project/${id}`);
  };

  const onSubmit = (data: EditProjectFormData) => {
    updateProjectMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div>Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div>Project not found</div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div>You don't have permission to edit this project</div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Edit Project
            </h1>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Basic Information</h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project Title *
                </Label>
                <Input
                  {...form.register("title")}
                  id="title"
                  placeholder="Enter your project title"
                  className="mt-1"
                  data-testid="input-title"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description *
                </Label>
                <Textarea
                  {...form.register("description")}
                  id="description"
                  placeholder="Describe your project in detail..."
                  className="mt-1 min-h-[120px]"
                  data-testid="input-description"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category *
                </Label>
                <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                  <SelectTrigger className="mt-1" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Game Development">Game Development</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="techStack" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tech Stack
                </Label>
                <Input
                  {...form.register("techStackInput")}
                  id="techStack"
                  placeholder="React, Node.js, MongoDB..."
                  className="mt-1"
                  data-testid="input-tech-stack"
                />
                <p className="text-xs text-slate-500 mt-1">Separate technologies with commas</p>
              </div>

              <div>
                <Label htmlFor="visibility" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Visibility
                </Label>
                <Select value={form.watch("visibility")} onValueChange={(value: any) => form.setValue("visibility", value)}>
                  <SelectTrigger className="mt-1" data-testid="select-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="INSTITUTION">Institution</SelectItem>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </Label>
                <Select value={form.watch("status")} onValueChange={(value: any) => form.setValue("status", value)}>
                  <SelectTrigger className="mt-1" data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Academic Information</h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="academicLevel" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Academic Level
                </Label>
                <Input
                  {...form.register("academicLevel")}
                  id="academicLevel"
                  placeholder="Undergraduate, Graduate, PhD..."
                  className="mt-1"
                  data-testid="input-academic-level"
                />
              </div>

              <div>
                <Label htmlFor="department" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Department
                </Label>
                <Input
                  {...form.register("department")}
                  id="department"
                  placeholder="Computer Science, Engineering..."
                  className="mt-1"
                  data-testid="input-department"
                />
              </div>

              <div>
                <Label htmlFor="courseSubject" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Course/Subject
                </Label>
                <Input
                  {...form.register("courseSubject")}
                  id="courseSubject"
                  placeholder="CS 101, Data Structures..."
                  className="mt-1"
                  data-testid="input-course-subject"
                />
              </div>

              <div>
                <Label htmlFor="projectMethodology" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project Methodology
                </Label>
                <Input
                  {...form.register("projectMethodology")}
                  id="projectMethodology"
                  placeholder="Agile, Waterfall, Scrum..."
                  className="mt-1"
                  data-testid="input-methodology"
                />
              </div>
            </div>
          </div>

          {/* URLs and Links */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">URLs and Links</h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="githubUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  GitHub URL
                </Label>
                <Input
                  {...form.register("githubUrl")}
                  id="githubUrl"
                  placeholder="https://github.com/username/repository"
                  className="mt-1"
                  data-testid="input-github-url"
                />
                {form.formState.errors.githubUrl && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.githubUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="demoUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Demo URL
                </Label>
                <Input
                  {...form.register("demoUrl")}
                  id="demoUrl"
                  placeholder="https://your-demo-site.com"
                  className="mt-1"
                  data-testid="input-demo-url"
                />
                {form.formState.errors.demoUrl && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.demoUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="repositoryUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Repository URL
                </Label>
                <Input
                  {...form.register("repositoryUrl")}
                  id="repositoryUrl"
                  placeholder="https://gitlab.com/username/repository"
                  className="mt-1"
                  data-testid="input-repository-url"
                />
                {form.formState.errors.repositoryUrl && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.repositoryUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="liveDemoUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Live Demo URL
                </Label>
                <Input
                  {...form.register("liveDemoUrl")}
                  id="liveDemoUrl"
                  placeholder="https://your-live-app.com"
                  className="mt-1"
                  data-testid="input-live-demo-url"
                />
                {form.formState.errors.liveDemoUrl && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.liveDemoUrl.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Current Files */}
          {existingFiles.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Current Files</h3>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
              </div>

              <div className="space-y-3">
                {existingFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
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
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/api/projects/files/${file.id}/download`, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
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
            </div>
          )}

          {/* File Uploads Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add New Files</h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            </div>

            {/* Source Code Upload */}
            <div className="space-y-4 mb-6">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Source Code Repository
              </Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="file"
                    accept=".zip,.rar,.7z,.tar,.gz"
                    multiple={false}
                    className="hidden"
                    id="sourceCode"
                    data-testid="input-source-code"
                    onChange={(e) => handleFileUpload('sourceCode', e.target.files)}
                  />
                  <label 
                    htmlFor="sourceCode"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.5 6v11.5c0 .966-.784 1.75-1.75 1.75H5.25c-.966 0-1.75-.784-1.75-1.75V6H16.5zM14.25 4V2.75c0-.966-.784-1.75-1.75-1.75h-5c-.966 0-1.75.784-1.75 1.75V4H1.5v1.5h17V4h-4.25zM7.25 2.75c0-.138.112-.25.25-.25h5c.138 0 .25.112.25.25V4h-5.5V2.75z"/>
                        </svg>
                      </div>
                      <p className="mb-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {getFileDisplayText('sourceCode') || 'Upload ZIP Archive'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">Complete project folder</p>
                    </div>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    {...({ webkitdirectory: "" } as any)}
                    multiple
                    className="hidden"
                    id="sourceFolder"
                    data-testid="input-source-folder"
                    onChange={(e) => handleFileUpload('sourceFolder', e.target.files)}
                  />
                  <label 
                    htmlFor="sourceFolder"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                        </svg>
                      </div>
                      <p className="mb-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {getFileDisplayText('sourceFolder') || 'Select Folder'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">Choose project directory</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Documentation Upload */}
            <div className="space-y-4 mb-6">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Documentation & Reports
              </Label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  multiple
                  className="hidden"
                  id="documentation"
                  data-testid="input-documentation"
                  onChange={(e) => handleFileUpload('documentation', e.target.files)}
                />
                <label 
                  htmlFor="documentation"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <p className="mb-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {getFileDisplayText('documentation') || 'Upload Documents'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">PDF, DOC, TXT, MD files</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Images & Assets Upload */}
            <div className="space-y-4 mb-6">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Images & Assets
              </Label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.svg,.ico"
                  multiple
                  className="hidden"
                  id="images"
                  data-testid="input-images"
                  onChange={(e) => handleFileUpload('images', e.target.files)}
                />
                <label 
                  htmlFor="images"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <p className="mb-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {getFileDisplayText('images') || 'Upload Images'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Screenshots, diagrams, logos</p>
                  </div>
                </label>
              </div>
            </div>

            {/* File Upload Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Upload Guidelines</h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Organize your project like a GitHub repository with proper folder structure</li>
                <li>• Include README.md, source code, assets, and documentation</li>
                <li>• Maximum file size: 100MB per file, 500MB total</li>
                <li>• Supported formats: ZIP, folders, PDF, DOC, images, and common code files</li>
              </ul>
            </div>
          </div>

          {/* Documentation Fields */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Documentation</h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="setupInstructions" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Setup Instructions
                </Label>
                <Textarea
                  {...form.register("setupInstructions")}
                  id="setupInstructions"
                  placeholder="Explain how to set up and run your project..."
                  className="mt-1 min-h-[100px]"
                  data-testid="input-setup-instructions"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="readmeContent" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    README Content
                  </Label>
                  <Textarea
                    {...form.register("readmeContent")}
                    id="readmeContent"
                    placeholder="Main project README content..."
                    className="mt-1 min-h-[100px]"
                    data-testid="input-readme-content"
                  />
                </div>

                <div>
                  <Label htmlFor="apiDocumentation" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    API Documentation
                  </Label>
                  <Textarea
                    {...form.register("apiDocumentation")}
                    id="apiDocumentation"
                    placeholder="API endpoints and usage..."
                    className="mt-1 min-h-[100px]"
                    data-testid="input-api-documentation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="licenseType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    License Type
                  </Label>
                  <Input
                    {...form.register("licenseType")}
                    id="licenseType"
                    placeholder="MIT, Apache 2.0, GPL..."
                    className="mt-1"
                    data-testid="input-license-type"
                  />
                </div>

                <div>
                  <Label htmlFor="installationInstructions" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Installation Instructions
                  </Label>
                  <Input
                    {...form.register("installationInstructions")}
                    id="installationInstructions"
                    placeholder="npm install, pip install..."
                    className="mt-1"
                    data-testid="input-installation-instructions"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contributingGuidelines" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contributing Guidelines
                </Label>
                <Textarea
                  {...form.register("contributingGuidelines")}
                  id="contributingGuidelines"
                  placeholder="How others can contribute to your project..."
                  className="mt-1 min-h-[100px]"
                  data-testid="input-contributing-guidelines"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              data-testid="button-cancel"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProjectMutation.isPending}
              data-testid="button-save-project"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        {/* Professional Footer Branding */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10 mt-12">
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
  );
}