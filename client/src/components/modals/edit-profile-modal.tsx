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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information and social links. All fields are optional except name.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="Enter your first name"
                  data-testid="input-first-name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Enter your last name"
                  data-testid="input-last-name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="profileImageUrl" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile Image URL
              </Label>
              <Input
                id="profileImageUrl"
                {...register("profileImageUrl")}
                placeholder="https://example.com/your-photo.jpg"
                data-testid="input-profile-image"
              />
              {errors.profileImageUrl && (
                <p className="text-sm text-red-500 mt-1">{errors.profileImageUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bio
              </Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Tell us about yourself..."
                rows={3}
                data-testid="input-bio"
              />
              {errors.bio && (
                <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="City, Country"
                data-testid="input-location"
              />
              {errors.location && (
                <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...register("department")}
                placeholder="Computer Science, Engineering, etc."
                data-testid="input-department"
              />
              {errors.department && (
                <p className="text-sm text-red-500 mt-1">{errors.department.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="techExpertise">Technical Expertise</Label>
              <Textarea
                id="techExpertise"
                {...register("techExpertise")}
                placeholder="JavaScript, Python, React, Node.js, etc."
                rows={2}
                data-testid="input-tech-expertise"
              />
              {errors.techExpertise && (
                <p className="text-sm text-red-500 mt-1">{errors.techExpertise.message}</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Links</h3>
            
            <div>
              <Label htmlFor="githubUrl" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Profile
              </Label>
              <Input
                id="githubUrl"
                {...register("githubUrl")}
                placeholder="https://github.com/username"
                data-testid="input-github-url"
              />
              {errors.githubUrl && (
                <p className="text-sm text-red-500 mt-1">{errors.githubUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn Profile
              </Label>
              <Input
                id="linkedinUrl"
                {...register("linkedinUrl")}
                placeholder="https://linkedin.com/in/username"
                data-testid="input-linkedin-url"
              />
              {errors.linkedinUrl && (
                <p className="text-sm text-red-500 mt-1">{errors.linkedinUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="twitterUrl" className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter Profile
              </Label>
              <Input
                id="twitterUrl"
                {...register("twitterUrl")}
                placeholder="https://twitter.com/username"
                data-testid="input-twitter-url"
              />
              {errors.twitterUrl && (
                <p className="text-sm text-red-500 mt-1">{errors.twitterUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="websiteUrl" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Personal Website
              </Label>
              <Input
                id="websiteUrl"
                {...register("websiteUrl")}
                placeholder="https://yourwebsite.com"
                data-testid="input-website-url"
              />
              {errors.websiteUrl && (
                <p className="text-sm text-red-500 mt-1">{errors.websiteUrl.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-profile"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}