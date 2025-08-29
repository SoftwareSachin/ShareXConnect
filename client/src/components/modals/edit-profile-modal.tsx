import { useState } from "react";
import React from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { User, Github, Linkedin, Twitter, Globe, MapPin, FileText } from "lucide-react";
import type { User as UserType } from "@shared/schema";

// Profile update schema
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  location: z.string().max(100, "Location too long").optional(),
  department: z.string().max(100, "Department too long").optional(),
  techExpertise: z.string().optional(),
  profileImageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current user profile
  const { data: currentUser, isLoading } = useQuery<UserType>({
    queryKey: ['/api/profile'],
    enabled: open,
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      bio: currentUser?.bio || "",
      location: currentUser?.location || "",
      department: currentUser?.department || "",
      techExpertise: currentUser?.techExpertise || "",
      profileImageUrl: currentUser?.profileImageUrl || "",
      githubUrl: currentUser?.githubUrl || "",
      linkedinUrl: currentUser?.linkedinUrl || "",
      twitterUrl: currentUser?.twitterUrl || "",
      websiteUrl: currentUser?.websiteUrl || "",
    },
  });

  // Update form when user data changes
  React.useEffect(() => {
    if (currentUser) {
      reset({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        department: currentUser.department || "",
        techExpertise: currentUser.techExpertise || "",
        profileImageUrl: currentUser.profileImageUrl || "",
        githubUrl: currentUser.githubUrl || "",
        linkedinUrl: currentUser.linkedinUrl || "",
        twitterUrl: currentUser.twitterUrl || "",
        websiteUrl: currentUser.websiteUrl || "",
      });
    }
  }, [currentUser, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      return await response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl">
        {/* Modern Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
        </div>

        <DialogHeader className="relative space-y-4 pb-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-base font-medium">
            Update your profile information and social links. All fields are optional except name.
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-y-auto max-h-[calc(95vh-200px)] pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-6">
            {/* Basic Information */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
              <div className="p-8 space-y-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Basic Information
                </h3>
            
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      First Name *
                    </Label>
                    <div className="relative">
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        placeholder="Enter your first name"
                        className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                        data-testid="input-first-name"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-2 font-medium">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Last Name *
                    </Label>
                    <div className="relative">
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        placeholder="Enter your last name"
                        className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                        data-testid="input-last-name"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-2 font-medium">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="profileImageUrl" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Profile Image URL
                  </Label>
                  <Input
                    id="profileImageUrl"
                    {...register("profileImageUrl")}
                    placeholder="https://example.com/your-photo.jpg"
                    className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                    data-testid="input-profile-image"
                  />
                  {errors.profileImageUrl && (
                    <p className="text-sm text-red-500 mt-2 font-medium">{errors.profileImageUrl.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg resize-none"
                    data-testid="input-bio"
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500 mt-2 font-medium">{errors.bio.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="City, Country"
                      className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-red-400 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                      data-testid="input-location"
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500 mt-2 font-medium">{errors.location.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="department" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Department
                    </Label>
                    <Input
                      id="department"
                      {...register("department")}
                      placeholder="Computer Science, Engineering, etc."
                      className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                      data-testid="input-department"
                    />
                    {errors.department && (
                      <p className="text-sm text-red-500 mt-2 font-medium">{errors.department.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="techExpertise" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    Technical Expertise
                  </Label>
                  <Textarea
                    id="techExpertise"
                    {...register("techExpertise")}
                    placeholder="JavaScript, Python, React, Node.js, etc."
                    rows={2}
                    className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-orange-400 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg resize-none"
                    data-testid="input-tech-expertise"
                  />
                  {errors.techExpertise && (
                    <p className="text-sm text-red-500 mt-2 font-medium">{errors.techExpertise.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
              <div className="p-8 space-y-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  Social Links
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="githubUrl" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <Github className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                      GitHub Profile
                    </Label>
                    <Input
                      id="githubUrl"
                      {...register("githubUrl")}
                      placeholder="https://github.com/username"
                      className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-gray-400 dark:focus:border-gray-500 focus:ring-2 focus:ring-gray-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                      data-testid="input-github-url"
                    />
                    {errors.githubUrl && (
                      <p className="text-sm text-red-500 mt-2 font-medium">{errors.githubUrl.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="linkedinUrl" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedinUrl"
                      {...register("linkedinUrl")}
                      placeholder="https://linkedin.com/in/username"
                      className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                      data-testid="input-linkedin-url"
                    />
                    {errors.linkedinUrl && (
                      <p className="text-sm text-red-500 mt-2 font-medium">{errors.linkedinUrl.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="twitterUrl" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <Twitter className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      Twitter Profile
                    </Label>
                    <Input
                      id="twitterUrl"
                      {...register("twitterUrl")}
                      placeholder="https://twitter.com/username"
                      className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                      data-testid="input-twitter-url"
                    />
                    {errors.twitterUrl && (
                      <p className="text-sm text-red-500 mt-2 font-medium">{errors.twitterUrl.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="websiteUrl" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Personal Website
                    </Label>
                    <Input
                      id="websiteUrl"
                      {...register("websiteUrl")}
                      placeholder="https://yourwebsite.com"
                      className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                      data-testid="input-website-url"
                    />
                    {errors.websiteUrl && (
                      <p className="text-sm text-red-500 mt-2 font-medium">{errors.websiteUrl.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl px-8 py-3 text-base font-semibold transition-all duration-300 hover:scale-105"
                data-testid="button-cancel-profile"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 text-base"
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving Changes...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}