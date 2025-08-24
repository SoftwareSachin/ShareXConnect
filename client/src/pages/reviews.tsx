import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/store/auth-store";
import { apiGet } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Clock, 
  Calendar, 
  Paperclip, 
  Github, 
  ExternalLink,
  MoreHorizontal,
  CheckCircle,
  Star
} from "lucide-react";
import type { ProjectReview, ProjectWithDetails } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";

type AssignmentWithProject = ProjectReview & { project: ProjectWithDetails };

export default function Reviews() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: assignments, isLoading } = useQuery<AssignmentWithProject[]>({
    queryKey: ["/api/faculty/assignments"],
    enabled: user?.role === "FACULTY",
  });

  const filteredAssignments = assignments?.filter(assignment => {
    if (statusFilter === "all") return true;
    return assignment.status.toLowerCase() === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeDisplay = (grade: number | null) => {
    if (!grade) return null;
    return (
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 text-accent fill-current" />
        <span className="font-medium">Grade: {grade}</span>
      </div>
    );
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (user?.role !== "FACULTY") {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center ml-80">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-muted-foreground">This page is only available to faculty members.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-80">
        <Header
          title="Faculty Reviews"
          description="Review and grade assigned student projects"
          showCreateButton={false}
          showSearch={false}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Review Assignments</h3>
              <p className="text-muted-foreground">
                {filteredAssignments?.length || 0} assignment{filteredAssignments?.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" data-testid="select-assignment-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignments</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Skeleton className="h-6 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-18" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAssignments?.length ? (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} data-testid={`card-assignment-${assignment.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900" data-testid={`text-project-title-${assignment.id}`}>
                            {assignment.project.title}
                          </h4>
                          <Badge className={getStatusColor(assignment.status)} variant="secondary">
                            {assignment.status === "PENDING" ? "Pending Review" : "Completed"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {assignment.project.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span data-testid={`text-student-name-${assignment.id}`}>
                              {assignment.project.owner.firstName} {assignment.project.owner.lastName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Assigned {formatDate(assignment.createdAt)}</span>
                          </div>
                          {assignment.status === "COMPLETED" && assignment.updatedAt && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>Reviewed {formatDate(assignment.updatedAt)}</span>
                            </div>
                          )}
                          {assignment.grade && getGradeDisplay(assignment.grade)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Link href={`/project/${assignment.project.id}`}>
                          <Button
                            variant={assignment.status === "PENDING" ? "default" : "outline"}
                            data-testid={`button-review-${assignment.id}`}
                          >
                            {assignment.status === "PENDING" ? "Review Project" : "View Review"}
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Tech Stack */}
                    {assignment.project.techStack && assignment.project.techStack.length > 0 && (
                      <div className="flex items-center space-x-2 mb-4">
                        {assignment.project.techStack.slice(0, 4).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {assignment.project.techStack.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{assignment.project.techStack.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Files and Links */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Paperclip className="w-4 h-4" />
                          <span>Project files available</span>
                        </div>
                        {assignment.project.githubUrl && (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Github className="w-4 h-4" />
                            <a 
                              href={assignment.project.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Repository
                            </a>
                          </div>
                        )}
                        {assignment.project.demoUrl && (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <ExternalLink className="w-4 h-4" />
                            <a 
                              href={assignment.project.demoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Live Demo
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Review Feedback (if completed) */}
                    {assignment.status === "COMPLETED" && assignment.feedback && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800 font-medium mb-1">Review Summary</p>
                          <p className="text-sm text-green-700">{assignment.feedback}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No review assignments</h3>
              <p className="text-muted-foreground">
                {statusFilter !== "all" 
                  ? `No assignments with status "${statusFilter}"`
                  : "You haven't been assigned any projects to review yet"
                }
              </p>
            </div>
          )}
        </main>

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
