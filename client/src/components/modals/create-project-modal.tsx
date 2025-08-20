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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl shadow-2xl">
        <DialogHeader className="pb-8">
          <DialogTitle className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-center">Create New Project</DialogTitle>
          <p className="text-slate-500 dark:text-slate-400 text-center mt-2">Start your next academic collaboration</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Project Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="My Awesome Project"
                data-testid="input-title"
                className="h-14 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm text-lg focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/50 transition-all duration-300"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-2">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="category" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Category</Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue="Web Development">
                <SelectTrigger data-testid="select-category" className="h-14 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-2xl">
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Mobile App">Mobile App</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="AI/Machine Learning">AI/Machine Learning</SelectItem>
                  <SelectItem value="Game Development">Game Development</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your project goals, features, and impact..."
              rows={5}
              data-testid="textarea-description"
              className="bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm text-lg p-4 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/50 transition-all duration-300 resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-2">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="visibility" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Visibility</Label>
              <Select onValueChange={(value) => setValue("visibility", value as any)} defaultValue="PRIVATE">
                <SelectTrigger data-testid="select-visibility" className="h-14 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-2xl">
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="INSTITUTION">Institution</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="status" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Status</Label>
              <Select onValueChange={(value) => setValue("status", value as any)} defaultValue="DRAFT">
                <SelectTrigger data-testid="select-status" className="h-14 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-2xl">
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="techStackInput" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Technologies Used</Label>
            <Input
              id="techStackInput"
              {...register("techStackInput")}
              placeholder="React, Node.js, MongoDB (comma separated)"
              data-testid="input-techstack"
              className="h-14 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm text-lg focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/50 transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="githubUrl" className="text-lg font-semibold text-slate-900 dark:text-slate-100">GitHub Repository</Label>
              <Input
                id="githubUrl"
                type="url"
                {...register("githubUrl")}
                placeholder="https://github.com/username/repo"
                data-testid="input-github"
                className="h-14 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm text-lg focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/50 transition-all duration-300"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="demoUrl" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Live Demo URL</Label>
              <Input
                id="demoUrl"
                type="url"
                {...register("demoUrl")}
                placeholder="https://myproject.com"
                data-testid="input-demo"
                className="h-14 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm text-lg focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/50 transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-lg font-semibold text-slate-900 dark:text-slate-100">Project Files</Label>
            <div className="border-2 border-dashed border-white/30 dark:border-slate-700/30 rounded-2xl p-8 text-center bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-300">
              <div className="w-16 h-16 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <div className="w-8 h-8 bg-slate-400 dark:bg-slate-500 rounded-lg"></div>
              </div>
              <p className="text-lg text-slate-700 dark:text-slate-300 mb-3 font-medium">
                Drag and drop files here, or{" "}
                <button type="button" className="text-slate-900 dark:text-slate-100 hover:underline font-semibold">
                  browse
                </button>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Support for PDF, ZIP, images up to 10MB
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-6 pt-8 border-t border-white/20 dark:border-slate-700/30">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              data-testid="button-cancel"
              className="h-14 px-8 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm text-lg font-semibold hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createProjectMutation.isPending}
              data-testid="button-create"
              className="h-14 px-8 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createProjectMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
