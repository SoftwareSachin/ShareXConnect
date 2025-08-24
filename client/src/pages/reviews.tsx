import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { 
  User, 
  Clock, 
  Calendar, 
  Paperclip, 
  Github, 
  ExternalLink,
  MoreHorizontal,
  CheckCircle,
  Star,
  FileCheck,
  GraduationCap,
  ArrowRight,
  Filter,
  Briefcase,
  Target,
  Award,
  BookOpen,
  Eye,
  Download
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center pl-80">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-100/80 dark:bg-slate-800/80 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <GraduationCap className="w-10 h-10 text-slate-500 dark:text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Access Denied</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">This page is only available to faculty members.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Sidebar />
      <div className="pl-80">
        <Header
          title="Faculty Reviews"
          description="Review and grade assigned student projects"
          showCreateButton={false}
          showSearch={false}
        />

        {/* Modern Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <main className="relative p-8 space-y-10">
          {/* Ultra-Modern Header Section */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileCheck className="w-8 h-8 text-white dark:text-slate-900" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Review Assignments</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                      {filteredAssignments?.length || 0} assignment{filteredAssignments?.length !== 1 ? 's' : ''} • Academic evaluation and grading
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-1">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48 border-0 bg-transparent shadow-none focus:ring-0" data-testid="select-assignment-filter">
                        <div className="flex items-center space-x-2">
                          <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <SelectValue placeholder="Filter by status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-2xl shadow-xl">
                        <SelectItem value="all" className="rounded-xl">All Assignments</SelectItem>
                        <SelectItem value="pending" className="rounded-xl">Pending Review</SelectItem>
                        <SelectItem value="completed" className="rounded-xl">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-6 flex-1">
                        <div className="w-16 h-16 bg-slate-200/50 dark:bg-slate-700/50 rounded-2xl animate-pulse"></div>
                        <div className="flex-1 space-y-4">
                          <div className="h-6 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl animate-pulse w-3/4"></div>
                          <div className="h-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-full"></div>
                          <div className="h-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-5/6"></div>
                          <div className="flex items-center space-x-4">
                            <div className="h-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-32"></div>
                            <div className="h-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-24"></div>
                            <div className="h-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-28"></div>
                          </div>
                        </div>
                      </div>
                      <div className="h-12 w-36 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAssignments?.length ? (
            <div className="space-y-8">
              {filteredAssignments.map((assignment) => (
                <div 
                  key={assignment.id} 
                  data-testid={`card-assignment-${assignment.id}`}
                  className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10 hover:bg-white/90 dark:hover:bg-slate-900/90 hover:border-white/40 dark:hover:border-slate-600/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/20 hover:-translate-y-2 hover:scale-[1.01]"
                >
                  <div className="p-8">
                    {/* Header with Project Info */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-6 flex-1">
                        {/* Professional Project Icon */}
                        <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <span className="text-white dark:text-slate-900 text-lg font-bold">
                            {assignment.project.techStack?.[0]?.slice(0, 2) || "PR"}
                          </span>
                        </div>
                        
                        {/* Project Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate" data-testid={`text-project-title-${assignment.id}`}>
                              {assignment.project.title}
                            </h3>
                            <div className={`
                              px-4 py-2 text-sm font-semibold rounded-xl backdrop-blur-sm
                              ${assignment.status === "PENDING" 
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/50" 
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/50"
                              }
                            `}>
                              {assignment.status === "PENDING" ? "Pending Review" : "Completed"}
                            </div>
                          </div>
                          
                          <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed text-lg">
                            {assignment.project.description}
                          </p>
                          
                          {/* Student and Assignment Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Student</p>
                                <p className="text-slate-900 dark:text-slate-100 font-semibold" data-testid={`text-student-name-${assignment.id}`}>
                                  {assignment.project.owner.firstName} {assignment.project.owner.lastName}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Assigned</p>
                                <p className="text-slate-900 dark:text-slate-100 font-semibold">
                                  {formatDate(assignment.createdAt)}
                                </p>
                              </div>
                            </div>
                            
                            {assignment.status === "COMPLETED" && assignment.updatedAt && (
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Reviewed</p>
                                  <p className="text-slate-900 dark:text-slate-100 font-semibold">
                                    {formatDate(assignment.updatedAt)}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {assignment.grade && (
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center">
                                  <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Grade</p>
                                  <p className="text-slate-900 dark:text-slate-100 font-semibold">
                                    {assignment.grade}/100
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex flex-col items-end space-y-3">
                        <Link href={`/project/${assignment.project.id}`}>
                          <Button
                            className={`
                              ${assignment.status === "PENDING" 
                                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200" 
                                : "bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60"
                              }
                              rounded-2xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg
                            `}
                            data-testid={`button-review-${assignment.id}`}
                          >
                            <div className="flex items-center space-x-2">
                              {assignment.status === "PENDING" ? (
                                <>
                                  <Eye className="w-4 h-4" />
                                  <span>Review Project</span>
                                </>
                              ) : (
                                <>
                                  <BookOpen className="w-4 h-4" />
                                  <span>View Review</span>
                                </>
                              )}
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    {/* Tech Stack */}
                    {assignment.project.techStack && assignment.project.techStack.length > 0 && (
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Tech Stack:</span>
                        </div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          {assignment.project.techStack.slice(0, 4).map((tech) => (
                            <div key={tech} className="px-3 py-1.5 text-xs font-semibold bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                              {tech}
                            </div>
                          ))}
                          {assignment.project.techStack.length > 4 && (
                            <div className="px-3 py-1.5 text-xs font-semibold bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                              +{assignment.project.techStack.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Project Resources */}
                    <div className="border-t border-white/10 dark:border-slate-700/30 pt-6">
                      <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl flex items-center justify-center">
                            <Paperclip className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Project files available</span>
                        </div>
                        
                        {assignment.project.githubUrl && (
                          <a 
                            href={assignment.project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-300 group"
                          >
                            <div className="w-8 h-8 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl flex items-center justify-center group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80 transition-colors duration-300">
                              <Github className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Repository</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        
                        {assignment.project.demoUrl && (
                          <a 
                            href={assignment.project.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-300 group"
                          >
                            <div className="w-8 h-8 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl flex items-center justify-center group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80 transition-colors duration-300">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Live Demo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Review Feedback (if completed) */}
                    {assignment.status === "COMPLETED" && assignment.feedback && (
                      <div className="border-t border-white/10 dark:border-slate-700/30 pt-6 mt-6">
                        <div className="bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl p-6 backdrop-blur-sm">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Review Summary</h4>
                          </div>
                          <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed">{assignment.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-100/80 dark:bg-slate-800/80 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <CheckCircle className="w-12 h-12 text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No review assignments</h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  {statusFilter !== "all" 
                    ? `No assignments with status "${statusFilter}"`
                    : "You haven't been assigned any projects to review yet"
                  }
                </p>
              </div>
            </div>
          )}
          {/* Professional Footer Branding */}
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
        </main>
      </div>
    </div>
  );
}
