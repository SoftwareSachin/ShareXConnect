import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats, ProjectWithDetails, CollaborationRequest, User, Project } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { AssignFacultyModal } from "@/components/modals/assign-faculty-modal";
import { RoleProtectedComponent, usePermissions } from "@/components/RoleProtectedComponent";
import { useToast } from "@/hooks/use-toast";
import { 
  FolderOpen, 
  Clock, 
  CheckCircle, 
  Users, 
  FileCheck, 
  ClipboardList,
  GraduationCap,
  BarChart3,
  Plus,
  UserCheck,
  Search,
  TrendingUp,
  Eye,
  ArrowRight,
  Code,
  GitBranch,
  Mail,
  X,
  Check,
  ExternalLink
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { canAccess } = usePermissions();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);

  const handleInvitationResponse = async (invitationId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiRequest(
        'POST',
        `/api/projects/collaborate/requests/${invitationId}/respond`,
        { status }
      );
      
      refetchInvitations();
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      toast({
        title: status === 'APPROVED' ? "Invitation Accepted" : "Invitation Declined",
        description: status === 'APPROVED' 
          ? "You've successfully joined the project!" 
          : "You've declined the collaboration invitation.",
      });
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to respond to invitation. Please try again.",
      });
    }
  };

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  const { data: recentProjects, isLoading: projectsLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects", { my: "true", limit: 3 }],
    queryFn: () => apiGet("/api/projects?my=true"),
    enabled: !!user,
  });

  // Fetch collaborative projects where user is collaborator but not owner
  const { data: collaborativeProjects, isLoading: collaborativeLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects/collaborations"],
    enabled: !!user,
  });

  // Also fetch all projects for activity feed
  const { data: projects } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects"],
    queryFn: () => apiGet("/api/projects"),
    enabled: !!user,
  });

  // Fetch user invitations
  type UserInvitation = CollaborationRequest & { project: Project; sender: User };
  const { data: invitations, refetch: refetchInvitations } = useQuery<UserInvitation[]>({
    queryKey: ["/api/user/invitations"],
    enabled: !!user,
  });

  // Fetch collaboration requests for project owners
  type IncomingRequest = CollaborationRequest & { project: Project; requester: User };
  const { data: incomingRequests = [] } = useQuery<IncomingRequest[]>({
    queryKey: ["/api/owner/collaboration-requests"],
    enabled: !!user,
  });

  // Helper function to get appropriate icon for each card
  const getCardIcon = (title: string) => {
    switch (title) {
      case "Active Projects":
      case "Total Projects":
        return <FolderOpen className="w-6 h-6" />;
      case "Under Review":
      case "Pending Reviews":
        return <Clock className="w-6 h-6" />;
      case "Completed":
      case "Approved":
        return <CheckCircle className="w-6 h-6" />;
      case "Collaborations":
      case "Active Users":
        return <Users className="w-6 h-6" />;
      case "Total Reviews":
        return <FileCheck className="w-6 h-6" />;
      case "Mentoring":
        return <GraduationCap className="w-6 h-6" />;
      default:
        return <BarChart3 className="w-6 h-6" />;
    }
  };

  const getStatCards = () => {
    if (user?.role === "STUDENT") {
      return [
        {
          title: "Active Projects",
          value: stats?.totalProjects || 0,
          description: "Projects in development",
          primary: true,
        },
        {
          title: "Under Review",
          value: stats?.inReview || 0,
          description: "Awaiting faculty feedback",
          primary: false,
        },
        {
          title: "Completed",
          value: stats?.approved || 0,
          description: "Successfully approved",
          primary: false,
        },
        {
          title: "Collaborations",
          value: stats?.collaborators || 0,
          description: "Team partnerships",
          primary: false,
        },
      ];
    } else if (user?.role === "FACULTY") {
      return [
        {
          title: "Total Reviews",
          value: stats?.totalProjects || 0,
          description: "Projects reviewed",
          primary: true,
        },
        {
          title: "Pending Reviews",
          value: stats?.inReview || 0,
          description: "Awaiting review",
          primary: false,
        },
        {
          title: "Approved",
          value: stats?.approved || 0,
          description: "Projects approved",
          primary: false,
        },
        {
          title: "Mentoring",
          value: stats?.collaborators || 0,
          description: "Students guided",
          primary: false,
        },
      ];
    } else {
      return [
        {
          title: "Total Projects",
          value: stats?.totalProjects || 0,
          description: "Platform projects",
          primary: true,
        },
        {
          title: "Under Review",
          value: stats?.inReview || 0,
          description: "Pending approval",
          primary: false,
        },
        {
          title: "Approved",
          value: stats?.approved || 0,
          description: "Successful projects",
          primary: false,
        },
        {
          title: "Active Users",
          value: stats?.collaborators || 0,
          description: "Platform members",
          primary: false,
        },
      ];
    }
  };

  const statCards = getStatCards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Sidebar />
      <div className="pl-80">
        <Header
          title="Dashboard"
          description="Welcome back! Here's your project overview."
          showSearch={false}
          showCreateButton={canAccess('canCreateProject')}
          onCreateProject={() => setShowCreateModal(true)}
        />

        {/* Modern Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <main className="relative p-8 space-y-10">
          {/* Collaboration Invitations Section */}
          {invitations && invitations.length > 0 && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
              <div className="p-8 border-b border-white/10 dark:border-slate-700/30 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-400/20 rounded-2xl flex items-center justify-center">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      Collaboration Invitations ({invitations.length})
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                      You've been invited to collaborate on these projects
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-start gap-6 p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
                    data-testid={`invitation-${invitation.id}`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {invitation.sender.firstName?.[0]}{invitation.sender.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                            {invitation.project.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                            {invitation.project.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-medium">
                              Invited by {invitation.sender.firstName} {invitation.sender.lastName}
                            </span>
                            <span>•</span>
                            <span>{new Date(invitation.createdAt).toLocaleDateString()}</span>
                          </div>
                          {invitation.message && (
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                              <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                                "{invitation.message}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleInvitationResponse(invitation.id, 'APPROVED')}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium shadow-lg shadow-green-600/20 transition-all duration-300 hover:shadow-green-600/30 hover:scale-105"
                          data-testid={`button-accept-invitation-${invitation.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleInvitationResponse(invitation.id, 'REJECTED')}
                          variant="outline"
                          className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                          data-testid={`button-decline-invitation-${invitation.id}`}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                        <Link href={`/project/${invitation.project.id}`}>
                          <Button
                            variant="ghost"
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-6 py-2 rounded-xl font-medium"
                            data-testid={`button-view-project-${invitation.project.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Project
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ultra-Modern Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {statCards.map((card, index) => (
              <div 
                key={index}
                className={`
                  relative group overflow-hidden
                  bg-white/80 dark:bg-slate-900/80 
                  backdrop-blur-2xl 
                  border border-white/20 dark:border-slate-700/30
                  rounded-3xl p-8
                  hover:bg-white/90 dark:hover:bg-slate-900/90
                  hover:border-white/40 dark:hover:border-slate-600/50
                  transition-all duration-500 ease-out
                  hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/20
                  hover:-translate-y-2 hover:scale-[1.02]
                  ${card.primary ? 'ring-1 ring-slate-200/50 dark:ring-slate-700/50' : ''}
                `}
                data-testid={`card-stat-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {/* Professional Icon */}
                <div className="mb-6">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center
                    ${card.primary 
                      ? 'bg-slate-900/90 dark:bg-slate-100/90 shadow-lg shadow-slate-900/20' 
                      : 'bg-slate-100/90 dark:bg-slate-800/90'
                    }
                    backdrop-blur-sm border border-white/20 dark:border-slate-700/30
                    transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                  `}>
                    <div className={`
                      ${card.primary 
                        ? 'text-white dark:text-slate-900' 
                        : 'text-slate-600 dark:text-slate-300'
                      }
                    `}>
                      {getCardIcon(card.title)}
                    </div>
                  </div>
                </div>
                
                {/* Statistics Content */}
                <div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3" data-testid={`text-stat-value-${index}`}>
                    {statsLoading ? (
                      <div className="h-10 w-20 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl animate-pulse"></div>
                    ) : (
                      <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                        {card.value}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {card.title}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {card.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ultra-Modern Projects Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Recent Projects */}
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                <div className="p-8 border-b border-white/10 dark:border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Recent Projects</h2>
                      <p className="text-slate-500 dark:text-slate-400">Your latest academic work and collaborations</p>
                    </div>
                    <RoleProtectedComponent permissions={['canCreateProject']}>
                      <Button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        New Project
                      </Button>
                    </RoleProtectedComponent>
                  </div>
                </div>
                <div className="p-8">
                  {projectsLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/20">
                          <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-slate-200/50 dark:bg-slate-700/50 rounded-2xl animate-pulse"></div>
                            <div className="flex-1 space-y-3">
                              <div className="h-5 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse"></div>
                              <div className="h-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-3/4"></div>
                              <div className="h-3 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentProjects?.length ? (
                    <div className="space-y-6">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="group p-6 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/20 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:border-white/40 dark:hover:border-slate-600/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                          <div className="flex items-start space-x-6">
                            <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                              <span className="text-white dark:text-slate-900 text-lg font-bold">
                                {project.techStack?.[0]?.slice(0, 2) || "PR"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate mb-2">{project.title}</h4>
                              <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                              <div className="flex items-center gap-4">
                                <div className={`
                                  px-3 py-1.5 text-xs font-semibold rounded-xl
                                  ${project.status === "APPROVED" 
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" 
                                    : project.status === "UNDER_REVIEW"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  }
                                `}>
                                  {project.status.replace("_", " ")}
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                  {new Date(project.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {user?.role === "STUDENT" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setShowAssignModal(true);
                                  }}
                                  data-testid={`button-assign-project-${project.id}`}
                                >
                                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Assign to Faculty</span>
                                </Button>
                              )}
                              <div className="w-10 h-10 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <GitBranch className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-slate-100/80 dark:bg-slate-800/80 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <FolderOpen className="w-10 h-10 text-slate-500 dark:text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No projects yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Create your first project to get started with collaboration</p>
                      <RoleProtectedComponent permissions={['canCreateProject']}>
                        <Button 
                          onClick={() => setShowCreateModal(true)} 
                          className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl px-8 py-3 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          Create your first project
                        </Button>
                      </RoleProtectedComponent>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Collaborative Projects Section */}
            {collaborativeProjects && collaborativeProjects.length > 0 && (
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                <div className="p-8 border-b border-white/10 dark:border-slate-700/30 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 dark:from-emerald-900/20 dark:to-blue-900/20">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-400/20 rounded-2xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        Collaborative Projects ({collaborativeProjects.length})
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        Projects where you're a collaborator
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  {collaborativeLoading ? (
                    <div className="space-y-8">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-emerald-200/20 dark:border-emerald-700/20">
                          <div className="flex items-start space-x-6">
                            <div className="w-20 h-20 bg-slate-200/50 dark:bg-slate-700/50 rounded-3xl animate-pulse"></div>
                            <div className="flex-1 space-y-4">
                              <div className="space-y-3">
                                <div className="h-7 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl animate-pulse w-3/4"></div>
                                <div className="h-5 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-full"></div>
                                <div className="h-5 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-2/3"></div>
                              </div>
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-200/50 dark:bg-slate-700/50 rounded-full animate-pulse"></div>
                                  <div className="space-y-2">
                                    <div className="h-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-24"></div>
                                    <div className="h-3 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse w-16"></div>
                                  </div>
                                </div>
                                <div className="h-10 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl animate-pulse w-32"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {collaborativeProjects.map((project) => (
                        <div key={project.id} className="group p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-emerald-200/40 dark:border-emerald-700/40 hover:bg-white/90 dark:hover:bg-slate-800/90 hover:border-emerald-300/60 dark:hover:border-emerald-600/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 backdrop-blur-sm">
                          {/* Header with Title and Badges */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Project Avatar */}
                              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                                <span className="text-white text-lg font-bold">
                                  {project.techStack?.[0]?.slice(0, 2).toUpperCase() || "CO"}
                                </span>
                              </div>
                              
                              {/* Project Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">{project.title}</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-3">{project.description}</p>
                                
                                {/* Tech Stack */}
                                {project.techStack && project.techStack.length > 0 && (
                                  <div className="flex items-center gap-2 mb-2">
                                    {project.techStack.slice(0, 3).map((tech) => (
                                      <span key={tech} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                                        {tech}
                                      </span>
                                    ))}
                                    {project.techStack.length > 3 && (
                                      <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md">
                                        +{project.techStack.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Status Badges */}
                            <div className="flex flex-col gap-2 items-end flex-shrink-0 ml-4">
                              <div className="px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50">
                                Collaborator
                              </div>
                              <div className={`
                                px-3 py-1.5 text-xs font-semibold rounded-lg
                                ${project.status === "APPROVED" 
                                  ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300 border border-green-200/50 dark:border-green-700/50" 
                                  : project.status === "UNDER_REVIEW"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/50"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                                }
                              `}>
                                {project.status.replace("_", " ")}
                              </div>
                            </div>
                          </div>
                          
                          {/* Footer with Owner and Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                            {/* Project Owner Info */}
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
                                <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
                                  {project.owner.firstName?.[0]?.toUpperCase()}{project.owner.lastName?.[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {project.owner.firstName} {project.owner.lastName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Project Owner
                                </p>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <Link href={`/project/${project.id}`}>
                                <Button
                                  size="sm"
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 rounded-lg font-medium text-sm"
                                  data-testid={`button-view-collaboration-${project.id}`}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1.5" />
                                  View Project
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ultra-Modern Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                <div className="p-8 border-b border-white/10 dark:border-slate-700/30">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Quick Actions</h2>
                  <p className="text-slate-500 dark:text-slate-400">Common tasks and shortcuts</p>
                </div>
                <div className="p-8 space-y-4">
                  <RoleProtectedComponent permissions={['canCreateProject']}>
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="w-full justify-start h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl shadow-sm"
                      data-testid="button-create-project"
                    >
                      <div className="w-8 h-8 bg-white/20 dark:bg-slate-900/20 rounded-lg flex items-center justify-center mr-3">
                        <Plus className="w-4 h-4 text-white dark:text-slate-900" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Create New Project</div>
                        <div className="text-xs opacity-80">Start your next idea</div>
                      </div>
                    </Button>
                  </RoleProtectedComponent>
                  
                  {user?.role === "STUDENT" && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-12 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30 rounded-xl transition-all duration-300"
                        onClick={() => {
                          if (recentProjects && recentProjects.length > 0) {
                            setSelectedProject(recentProjects[0]);
                            setShowAssignModal(true);
                          } else {
                            toast({
                              variant: "destructive",
                              title: "No Projects Found",
                              description: "Please create a project first before assigning it to faculty.",
                            });
                          }
                        }}
                        disabled={!recentProjects || recentProjects.length === 0}
                        data-testid="button-assign-to-faculty"
                      >
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg flex items-center justify-center mr-3">
                          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Assign to Faculty</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Get your project reviewed</div>
                        </div>
                      </Button>
                      <Link href="/projects?tab=explore">
                        <Button variant="outline" className="w-full justify-start h-12 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-3">
                            <Search className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-slate-900 dark:text-slate-100">Find Collaborators</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Connect with peers</div>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/projects?view=my">
                        <Button variant="outline" className="w-full justify-start h-12 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl">
                          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center mr-3">
                            <TrendingUp className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-slate-900 dark:text-slate-100">View Progress</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Track your work</div>
                          </div>
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {user?.role === "FACULTY" && (
                    <>
                      <Button variant="outline" className="w-full justify-start h-12 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mr-3">
                          <FileCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Review Projects</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Evaluate student work</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3">
                          <GraduationCap className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Manage Students</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Guide and mentor</div>
                        </div>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Collaboration Requests Section for Project Owners */}
              {incomingRequests && incomingRequests.length > 0 && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                  <div className="p-8 border-b border-white/10 dark:border-slate-700/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Collaboration Requests</h2>
                        <p className="text-slate-500 dark:text-slate-400">Users wanting to collaborate on your projects</p>
                      </div>
                      <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                        {incomingRequests.length} pending
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    {incomingRequests.map((request) => (
                      <div key={request.id} className="bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-slate-700/30 rounded-2xl p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                                  {request.requester.firstName} {request.requester.lastName}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                  {request.requester.email} • @{request.requester.username}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  wants to collaborate on <span className="font-medium text-slate-700 dark:text-slate-300">{request.project.title}</span>
                                </p>
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            {request.message && (
                              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl mb-4">
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                  "{request.message}"
                                </p>
                              </div>
                            )}
                            <div className="flex gap-3">
                              <Button
                                size="sm"
                                onClick={() => handleInvitationResponse(request.id, 'APPROVED')}
                                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-0"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInvitationResponse(request.id, 'REJECTED')}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Modern Activity Feed */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
                <div className="p-8 border-b border-white/10 dark:border-slate-700/30">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Recent Activity</h2>
                  <p className="text-slate-500 dark:text-slate-400">Latest platform updates and projects</p>
                </div>
                <div className="p-8">
                  {projects?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-slate-100/80 dark:bg-slate-800/80 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <BarChart3 className="w-10 h-10 text-slate-500 dark:text-slate-400" />
                      </div>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">No activity yet</p>
                      <p className="text-slate-500 dark:text-slate-400">Create your first project to start seeing activity here</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {projects?.slice(0, 3).map((project: any) => (
                        <div key={project.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/20 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{project.title}</p>
                            <p className="text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">{project.description}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


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

      <CreateProjectModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
      <AssignFacultyModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        project={selectedProject}
      />
    </div>
  );
}
