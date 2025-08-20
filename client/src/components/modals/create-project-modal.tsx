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
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormData) => {
      const { techStackInput, ...projectData } = data;
      
      // Parse tech stack from comma-separated string
      const techStack = techStackInput
        ? techStackInput.split(",").map(tech => tech.trim()).filter(Boolean)
        : [];

      return apiPost("/api/projects", { ...projectData, techStack });
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
      <DialogContent className="max-w-5xl max-h-[98vh] overflow-y-auto bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl border-0 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] p-0">
        {/* Modern Header with Gradient Border */}
        <div className="relative p-10 pb-8 border-b border-slate-200/20 dark:border-slate-700/20">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 opacity-60"></div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50 text-center leading-tight">
              Create New Project
            </DialogTitle>
            <p className="text-xl text-slate-600 dark:text-slate-300 text-center mt-3 font-medium">
              Build something extraordinary together
            </p>
          </DialogHeader>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Enhanced Title and Category Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label htmlFor="title" className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Project Title
                </Label>
                <div className="relative group">
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter your project name"
                    data-testid="input-title"
                    className="h-16 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200/40 dark:border-slate-700/40 rounded-3xl backdrop-blur-xl text-xl px-6 font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500/60 transition-all duration-500 group-hover:border-slate-300/60 dark:group-hover:border-slate-600/60"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-slate-100/20 dark:bg-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                {errors.title && (
                  <p className="text-sm text-red-500 mt-3 font-medium">{errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="category" className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Category
                </Label>
                <Select onValueChange={(value) => setValue("category", value)} defaultValue="Web Development">
                  <SelectTrigger data-testid="select-category" className="h-16 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200/40 dark:border-slate-700/40 rounded-3xl backdrop-blur-xl text-xl px-6 font-medium text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500/60 transition-all duration-500 hover:border-slate-300/60 dark:hover:border-slate-600/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-2 border-slate-200/30 dark:border-slate-700/30 rounded-3xl shadow-2xl">
                    <SelectItem value="Web Development" className="text-lg py-4 px-6 rounded-2xl">Web Development</SelectItem>
                    <SelectItem value="Mobile App" className="text-lg py-4 px-6 rounded-2xl">Mobile App</SelectItem>
                    <SelectItem value="Data Science" className="text-lg py-4 px-6 rounded-2xl">Data Science</SelectItem>
                    <SelectItem value="AI/Machine Learning" className="text-lg py-4 px-6 rounded-2xl">AI/Machine Learning</SelectItem>
                    <SelectItem value="Game Development" className="text-lg py-4 px-6 rounded-2xl">Game Development</SelectItem>
                    <SelectItem value="Other" className="text-lg py-4 px-6 rounded-2xl">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Enhanced Description Section */}
            <div className="space-y-4">
              <Label htmlFor="description" className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Project Description
              </Label>
              <div className="relative group">
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your project vision, goals, key features, and expected impact on the academic community..."
                  rows={6}
                  data-testid="textarea-description"
                  className="bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200/40 dark:border-slate-700/40 rounded-3xl backdrop-blur-xl text-lg p-6 font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500/60 transition-all duration-500 resize-none leading-relaxed group-hover:border-slate-300/60 dark:group-hover:border-slate-600/60"
                />
                <div className="absolute inset-0 rounded-3xl bg-slate-100/20 dark:bg-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              {errors.description && (
                <p className="text-sm text-red-500 mt-3 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Enhanced Visibility and Status Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label htmlFor="visibility" className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Project Visibility
                </Label>
                <Select onValueChange={(value) => setValue("visibility", value as any)} defaultValue="PRIVATE">
                  <SelectTrigger data-testid="select-visibility" className="h-16 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200/40 dark:border-slate-700/40 rounded-3xl backdrop-blur-xl text-xl px-6 font-medium text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500/60 transition-all duration-500 hover:border-slate-300/60 dark:hover:border-slate-600/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-2 border-slate-200/30 dark:border-slate-700/30 rounded-3xl shadow-2xl">
                    <SelectItem value="PRIVATE" className="text-lg py-4 px-6 rounded-2xl">Private</SelectItem>
                    <SelectItem value="INSTITUTION" className="text-lg py-4 px-6 rounded-2xl">Institution</SelectItem>
                    <SelectItem value="PUBLIC" className="text-lg py-4 px-6 rounded-2xl">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="status" className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Project Status
                </Label>
                <Select onValueChange={(value) => setValue("status", value as any)} defaultValue="DRAFT">
                  <SelectTrigger data-testid="select-status" className="h-16 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200/40 dark:border-slate-700/40 rounded-3xl backdrop-blur-xl text-xl px-6 font-medium text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500/60 transition-all duration-500 hover:border-slate-300/60 dark:hover:border-slate-600/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-2 border-slate-200/30 dark:border-slate-700/30 rounded-3xl shadow-2xl">
                    <SelectItem value="DRAFT" className="text-lg py-4 px-6 rounded-2xl">Draft</SelectItem>
                    <SelectItem value="SUBMITTED" className="text-lg py-4 px-6 rounded-2xl">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Enhanced Technologies Section */}
            <div className="space-y-4">
              <Label htmlFor="techStackInput" className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Technologies & Stack
              </Label>
              <div className="relative group">
                <Input
                  id="techStackInput"
                  {...register("techStackInput")}
                  placeholder="React, TypeScript, Node.js, PostgreSQL, Docker (comma separated)"
                  data-testid="input-techstack"
                  className="h-16 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200/40 dark:border-slate-700/40 rounded-3xl backdrop-blur-xl text-xl px-6 font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500/60 transition-all duration-500 group-hover:border-slate-300/60 dark:group-hover:border-slate-600/60"
                />
                <div className="absolute inset-0 rounded-3xl bg-slate-100/20 dark:bg-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Enhanced Repository and Demo Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label htmlFor="githubUrl" className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  GitHub Repository
                </Label>
                <div className="relative group">
                  <Input
                    id="githubUrl"
                    type="url"
                    {...register("githubUrl")}
                    placeholder="https://github.com/username/repository"
                    data-testid="input-github"
                    className="h-16 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200/40 dark:border-slate-700/40 rounded-3xl backdrop-blur-xl text-xl px-6 font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500/60 transition-all duration-500 group-hover:border-slate-300/60 dark:group-hover:border-slate-600/60"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-slate-100/20 dark:bg-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="demoUrl" className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Live Demo URL
                </Label>
                <div className="relative group">
                  <Input
                    id="demoUrl"
                    type="url"
                    {...register("demoUrl")}
                    placeholder="https://your-amazing-project.com"
                    data-testid="input-demo"
                    className="h-16 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200/40 dark:border-slate-700/40 rounded-3xl backdrop-blur-xl text-xl px-6 font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500/60 transition-all duration-500 group-hover:border-slate-300/60 dark:group-hover:border-slate-600/60"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-slate-100/20 dark:bg-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Enhanced File Upload Section */}
            <div className="space-y-4">
              <Label className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Project Assets & Documentation
              </Label>
              <div className="relative group">
                <div className="border-3 border-dashed border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-12 text-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-slate-800/60 hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-all duration-500 cursor-pointer">
                  <div className="w-20 h-20 bg-slate-100/90 dark:bg-slate-800/90 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <div className="w-10 h-10 bg-slate-400 dark:bg-slate-500 rounded-2xl"></div>
                  </div>
                  <p className="text-2xl text-slate-700 dark:text-slate-200 mb-4 font-bold">
                    Drop files here or{" "}
                    <button type="button" className="text-slate-900 dark:text-slate-100 hover:underline font-black">
                      browse files
                    </button>
                  </p>
                  <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                    PDF, ZIP, Images, Documentation • Up to 10MB each
                  </p>
                </div>
                <div className="absolute inset-0 rounded-3xl bg-slate-100/20 dark:bg-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center justify-between pt-10 border-t border-slate-200/30 dark:border-slate-700/30">
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                All fields are saved automatically as you type
              </div>
              <div className="flex items-center space-x-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  data-testid="button-cancel"
                  className="h-16 px-10 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-3xl backdrop-blur-xl text-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:border-slate-300/70 dark:hover:border-slate-600/70 transition-all duration-500 hover:scale-105"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProjectMutation.isPending}
                  data-testid="button-create"
                  className="h-16 px-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-3xl text-xl font-black tracking-tight transition-all duration-500 hover:scale-110 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {createProjectMutation.isPending ? "Creating Project..." : "Create Project"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
