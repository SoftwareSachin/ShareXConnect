import React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, X } from "lucide-react";
import type { ProjectWithDetails } from "@shared/schema";

interface EditProjectParams {
  id: string;
}

// Form schema for editing projects
const editProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description is too long"),
  category: z.string().min(1, "Category is required"),
  visibility: z.enum(["PRIVATE", "INSTITUTION", "PUBLIC"]),
  status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"]),
  techStack: z.array(z.string()).default([]),
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
  sourceCodeRepository: z.string().optional(),
  documentationReports: z.string().optional(),
  imagesAssets: z.string().optional(),
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
  
  // Debug logging
  console.log('EditProject component loaded');
  console.log('params:', params);
  console.log('id:', id);
  console.log('Current location:', window.location.pathname);

  // Fetch project data
  const { data: project, isLoading } = useQuery<ProjectWithDetails>({
    queryKey: ['/api/projects', id],
    queryFn: () => apiGet(`/api/projects/${id}`)
  });

  // Initialize form with project data
  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      visibility: "PRIVATE",
      status: "DRAFT",
      techStack: [],
      githubUrl: "",
      demoUrl: "",
      academicLevel: "",
      department: "",
      courseSubject: "",
      projectMethodology: "",
      setupInstructions: "",
      repositoryUrl: "",
      liveDemoUrl: "",
      sourceCodeRepository: "",
      documentationReports: "",
      imagesAssets: "",
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
      form.reset({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        visibility: project.visibility,
        status: project.status,
        techStack: project.techStack || [],
        githubUrl: project.githubUrl || "",
        demoUrl: project.demoUrl || "",
        academicLevel: project.academicLevel || "",
        department: project.department || "",
        courseSubject: project.courseSubject || "",
        projectMethodology: project.projectMethodology || "",
        setupInstructions: project.setupInstructions || "",
        repositoryUrl: project.repositoryUrl || "",
        liveDemoUrl: project.liveDemoUrl || "",
        sourceCodeRepository: project.sourceCodeRepository || "",
        documentationReports: project.documentationReports || "",
        imagesAssets: project.imagesAssets || "",
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
    mutationFn: (data: EditProjectFormData) => 
      apiRequest(`/api/projects/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
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

  // Check if user can edit
  const canEdit = user && project && (
    user.id === project.ownerId || 
    project.collaborators?.some(collaborator => collaborator.id === user.id)
  );

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              data-testid="button-cancel"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter project title"
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe your project"
                          rows={4}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., Web Development"
                            data-testid="input-category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-visibility">
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PRIVATE">Private</SelectItem>
                            <SelectItem value="INSTITUTION">Institution Only</SelectItem>
                            <SelectItem value="PUBLIC">Public</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="SUBMITTED">Submitted</SelectItem>
                            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="academicLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Level</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., Undergraduate, Graduate"
                            data-testid="input-academic-level"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., Computer Science"
                            data-testid="input-department"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="courseSubject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course/Subject</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Software Engineering, Web Development"
                          data-testid="input-course-subject"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectMethodology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Methodology</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe the methodology used for this project"
                          rows={3}
                          data-testid="textarea-methodology"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* URLs and Links */}
            <Card>
              <CardHeader>
                <CardTitle>URLs and Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://github.com/..."
                            data-testid="input-github-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="demoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Demo URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://..."
                            data-testid="input-demo-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="repositoryUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repository URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://..."
                            data-testid="input-repository-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="liveDemoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Live Demo URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://..."
                            data-testid="input-live-demo-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documentation */}
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="setupInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setup Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="How to set up and run the project"
                          rows={3}
                          data-testid="textarea-setup-instructions"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="installationInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Installation Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Step-by-step installation guide"
                          rows={3}
                          data-testid="textarea-installation-instructions"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="readmeContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>README Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="README content for the project"
                          rows={4}
                          data-testid="textarea-readme-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiDocumentation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Documentation</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="API documentation and endpoints"
                          rows={3}
                          data-testid="textarea-api-documentation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                data-testid="button-cancel-form"
              >
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
        </Form>
      </div>
    </div>
  );
}