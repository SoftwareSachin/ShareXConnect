import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertProjectSchema } from "@shared/schema";
import { apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";


const createProjectSchema = insertProjectSchema.extend({
  techStackInput: z.string().optional(),
  repositoryStructure: z.string().optional(),
  readmeContent: z.string().optional(),
  licenseType: z.string().optional(),
  contributingGuidelines: z.string().optional(),
  installationInstructions: z.string().optional(),
  apiDocumentation: z.string().optional(),
}).omit({ ownerId: true });

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Web Development",
      visibility: "PRIVATE",
      status: "DRAFT",
      techStack: [],
      githubUrl: "",
      demoUrl: "",
      techStackInput: "",
      repositoryStructure: "",
      readmeContent: "",
      licenseType: "MIT",
      contributingGuidelines: "",
      installationInstructions: "",
      apiDocumentation: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormData) => {
      const { techStackInput, ...projectData } = data;
      
      // Parse tech stack from comma-separated string
      const techStack = techStackInput
        ? techStackInput.split(",").map(tech => tech.trim()).filter(Boolean)
        : [];

      // Prepare enhanced project data with GitHub-like structure
      const enhancedProjectData = {
        ...projectData,
        techStack,
        repositoryStructure: data.repositoryStructure || "",
        readmeContent: data.readmeContent || "",
        licenseType: data.licenseType || "MIT",
        contributingGuidelines: data.contributingGuidelines || "",
        installationInstructions: data.installationInstructions || "",
        apiDocumentation: data.apiDocumentation || "",
      };

      return apiPost("/api/projects", enhancedProjectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-0 m-4">
        {/* Material Design 3 Header */}
        <div className="relative px-8 py-6 border-b border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-normal text-slate-900 dark:text-slate-50">
              Create New Project
            </DialogTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-normal">
              Create and share your academic project
            </p>
          </DialogHeader>
        </div>

        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project Title
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter project title"
                  data-testid="input-title"
                  className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200"
                />
                {errors.title && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </Label>
                <Select onValueChange={(value) => setValue("category", value)} defaultValue="Web Development">
                  <SelectTrigger data-testid="select-category" className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile App">Mobile App</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="AI/Machine Learning">AI/Machine Learning</SelectItem>
                    <SelectItem value="Game Development">Game Development</SelectItem>
                    <SelectItem value="IoT/Hardware">IoT/Hardware</SelectItem>
                    <SelectItem value="Blockchain">Blockchain</SelectItem>
                    <SelectItem value="DevOps/Cloud">DevOps/Cloud</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Project Description
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe your project goals, features, and objectives"
                rows={4}
                data-testid="textarea-description"
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base p-4 font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200 resize-none"
              />
              {errors.description && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Visibility
                </Label>
                <Select onValueChange={(value) => setValue("visibility", value as any)} defaultValue="PRIVATE">
                  <SelectTrigger data-testid="select-visibility" className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="INSTITUTION">Institution</SelectItem>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </Label>
                <Select onValueChange={(value) => setValue("status", value as any)} defaultValue="DRAFT">
                  <SelectTrigger data-testid="select-status" className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicLevel" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Academic Level
                </Label>
                <Select onValueChange={(value) => setValue("licenseType", value)} defaultValue="Undergraduate">
                  <SelectTrigger data-testid="select-academic-level" className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Technologies and Duration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="techStackInput" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Technologies Used
                </Label>
                <Input
                  id="techStackInput"
                  {...register("techStackInput")}
                  placeholder="React, TypeScript, Node.js (comma separated)"
                  data-testid="input-techstack"
                  className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project Duration
                </Label>
                <Input
                  id="duration"
                  {...register("contributingGuidelines")}
                  placeholder="e.g., 3 months, 1 semester"
                  data-testid="input-duration"
                  className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Academic Context */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="course" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Course/Subject
                </Label>
                <Input
                  id="course"
                  {...register("readmeContent")}
                  placeholder="e.g., Computer Science, Software Engineering"
                  data-testid="input-course"
                  className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="advisor" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Faculty Advisor (Optional)
                </Label>
                <Input
                  id="advisor"
                  {...register("installationInstructions")}
                  placeholder="Prof. Name or Department"
                  data-testid="input-advisor"
                  className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Project Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Repository URL (Optional)
                </Label>
                <Input
                  id="githubUrl"
                  type="url"
                  {...register("githubUrl")}
                  placeholder="https://github.com/username/repository"
                  data-testid="input-github"
                  className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="demoUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Live Demo URL (Optional)
                </Label>
                <Input
                  id="demoUrl"
                  type="url"
                  {...register("demoUrl")}
                  placeholder="https://your-project.com"
                  data-testid="input-demo"
                  className="h-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-base px-4 font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                data-testid="button-cancel"
                className="h-10 px-6 bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProjectMutation.isPending}
                data-testid="button-create"
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
