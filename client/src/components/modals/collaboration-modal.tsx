import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { 
  Users, Send, Check, X, Clock, UserPlus, Mail, Search, Crown, 
  Shield, User, Settings, MoreHorizontal, Trash2, UserCheck, AlertCircle,
  ChevronDown, Filter, Calendar, MessageSquare, Star, Activity, Eye,
  UserMinus, Plus, Sparkles, Zap, Award, Target
} from "lucide-react";

interface CollaborationModalProps {
  projectId: string;
  isOwner: boolean;
  children: React.ReactNode;
}

interface CollaborationRequest {
  id: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  respondedAt?: string;
  requester: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username: string;
    role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  };
}

interface Collaborator {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  addedAt: string;
  isOwner?: boolean;
  collaboratorRole?: 'MEMBER' | 'MAINTAINER' | 'ADMIN';
}

interface SearchUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
}

const CollaborationModal: React.FC<CollaborationModalProps> = ({ 
  projectId, 
  isOwner, 
  children 
}) => {
  const [open, setOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);
  const [activeTab, setActiveTab] = useState("team");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current collaborators
  const { data: collaborators = [] } = useQuery<Collaborator[]>({
    queryKey: ['/api/projects', projectId, 'collaborators'],
    enabled: isOwner && open,
  });

  // Fetch collaboration requests (only for owners)
  const { data: requests = [] } = useQuery<CollaborationRequest[]>({
    queryKey: ['/api/projects', projectId, 'collaborate/requests'],
    enabled: isOwner && open,
  });

  // Search users
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const results: SearchUser[] = await response.json();
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Request collaboration mutation (for non-owners)
  const requestCollaboration = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      await apiRequest('POST', `/api/projects/${projectId}/collaborate/request`, { message });
    },
    onSuccess: () => {
      toast({
        title: "Request Sent",
        description: "Your collaboration request has been submitted.",
      });
      setRequestMessage("");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send collaboration request",
        variant: "destructive",
      });
    },
  });

  // Respond to collaboration request mutation
  const respondToRequest = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'APPROVED' | 'REJECTED' }) => {
      await apiRequest('POST', `/api/projects/collaborate/requests/${requestId}/respond`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Response Sent",
        description: "Collaboration request response has been sent.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborate/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborators'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to request",
        variant: "destructive",
      });
    },
  });

  // Add collaborator by email mutation
  const addCollaboratorByEmail = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      await apiRequest('POST', `/api/projects/${projectId}/collaborators/email`, { email });
    },
    onSuccess: () => {
      toast({
        title: "Collaborator Added",
        description: "Successfully added collaborator to the project.",
      });
      setCollaboratorEmail("");
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborators'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add collaborator",
        variant: "destructive",
      });
    },
  });

  // Batch invite users
  const batchInviteUsers = useMutation({
    mutationFn: async (users: SearchUser[]) => {
      for (const user of users) {
        await apiRequest('POST', `/api/projects/${projectId}/collaborators/email`, { email: user.email });
      }
    },
    onSuccess: () => {
      toast({
        title: "Invitations Sent",
        description: `Successfully invited ${selectedUsers.length} users to collaborate.`,
      });
      setSelectedUsers([]);
      setSearchQuery("");
      setShowSearchResults(false);
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborators'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitations",
        variant: "destructive",
      });
    },
  });

  // Remove collaborator
  const removeCollaborator = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('DELETE', `/api/projects/${projectId}/collaborators/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Collaborator Removed",
        description: "Collaborator has been removed from the project.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborators'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove collaborator",
        variant: "destructive",
      });
    },
  });

  const handleRequestCollaboration = () => {
    if (!requestMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide a message explaining why you'd like to collaborate.",
        variant: "destructive",
      });
      return;
    }
    requestCollaboration.mutate({ message: requestMessage });
  };

  const handleAddCollaborator = () => {
    if (!collaboratorEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    addCollaboratorByEmail.mutate({ email: collaboratorEmail });
  };

  const handleSelectUser = (user: SearchUser) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'FACULTY':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'STUDENT':
        return <User className="h-4 w-4 text-emerald-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">Admin</Badge>;
      case 'FACULTY':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Faculty</Badge>;
      case 'STUDENT':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Student</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'APPROVED':
        return <Check className="h-4 w-4 text-emerald-500" />;
      case 'REJECTED':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return "bg-gradient-to-br from-amber-400 to-orange-500";
      case 'FACULTY':
        return "bg-gradient-to-br from-blue-400 to-indigo-500";
      case 'STUDENT':
        return "bg-gradient-to-br from-emerald-400 to-teal-500";
      default:
        return "bg-gradient-to-br from-gray-400 to-gray-500";
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const processedRequests = requests.filter(r => r.status !== 'PENDING');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        {/* Enhanced Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 bg-white/20 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              {isOwner ? "Team Management" : "Join This Project"}
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-lg">
              {isOwner 
                ? "Build your dream team and manage collaboration requests with powerful tools"
                : "Connect with the project owner and become part of this amazing project"
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(95vh-200px)]">
          {isOwner ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-6">
              {/* Enhanced Tab Navigation */}
              <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <TabsTrigger value="team" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 px-4">
                  <Users className="h-4 w-4 mr-2" />
                  Team ({collaborators.length})
                </TabsTrigger>
                <TabsTrigger value="requests" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 px-4">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Requests 
                  {pendingRequests.length > 0 && (
                    <Badge className="ml-2 bg-amber-500 text-white text-xs px-2 py-0">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="invite" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3 px-4">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Team
                </TabsTrigger>
              </TabsList>

              <TabsContent value="team" className="space-y-6">
                <div className="grid gap-6">
                  {/* Team Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{collaborators.length}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Team Members</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-lg">
                          <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                            {collaborators.filter(c => !c.isOwner).length}
                          </p>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400">Collaborators</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500 rounded-lg">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{pendingRequests.length}</p>
                          <p className="text-sm text-amber-600 dark:text-amber-400">Pending Requests</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {collaborators.filter(c => c.role === 'FACULTY').length}
                          </p>
                          <p className="text-sm text-purple-600 dark:text-purple-400">Faculty</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Team Members Grid */}
                  <Card className="overflow-hidden shadow-lg border-0 bg-white dark:bg-slate-800">
                    <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
                      <CardTitle className="text-xl flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                        Your Amazing Team
                      </CardTitle>
                      <CardDescription className="text-base">
                        The brilliant minds working together on this project
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {collaborators.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-4">
                            <Users className="h-12 w-12 text-blue-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to Build Your Team?</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            Great projects need great teams. Start by inviting collaborators to join your project.
                          </p>
                          <Button onClick={() => setActiveTab("invite")} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Your First Team Member
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {collaborators.map((collaborator) => (
                            <div 
                              key={collaborator.id} 
                              className="group relative flex items-center justify-between p-6 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-750"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="relative">
                                  <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-slate-700 shadow-lg">
                                    <AvatarFallback className={`text-white font-bold text-lg ${getAvatarColor(collaborator.role)}`}>
                                      {getInitials(collaborator.firstName, collaborator.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {collaborator.isOwner && (
                                    <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full shadow-md">
                                      <Crown className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                                      {collaborator.firstName} {collaborator.lastName}
                                      {collaborator.isOwner && (
                                        <span className="ml-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                                          (Project Owner)
                                        </span>
                                      )}
                                    </h4>
                                    {getRoleIcon(collaborator.role)}
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {collaborator.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      @{collaborator.username}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    {getRoleBadge(collaborator.role)}
                                    <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-700">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Joined {new Date(collaborator.addedAt).toLocaleDateString()}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {!collaborator.isOwner && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCollaborator.mutate(collaborator.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 opacity-0 group-hover:opacity-100 transition-opacity"
                                    data-testid={`button-remove-${collaborator.id}`}
                                  >
                                    <UserMinus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="requests" className="space-y-6">
                {/* Pending Requests */}
                <Card className="overflow-hidden shadow-lg border-0">
                  <CardHeader className="pb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Pending Collaboration Requests
                      {pendingRequests.length > 0 && (
                        <Badge className="bg-amber-500 text-white">{pendingRequests.length}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-base">
                      Review and respond to collaboration requests from talented individuals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-full flex items-center justify-center mb-4">
                          <MessageSquare className="h-10 w-10 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          No pending collaboration requests at the moment.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingRequests.map((request) => (
                          <div 
                            key={request.id} 
                            className="p-6 border border-amber-200 dark:border-amber-800 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 hover:shadow-lg transition-all"
                            data-testid={`request-${request.id}`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 ring-2 ring-amber-200">
                                  <AvatarFallback className={getAvatarColor(request.requester.role)}>
                                    {getInitials(request.requester.firstName || '', request.requester.lastName || '')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {request.requester.firstName} {request.requester.lastName}
                                    </h4>
                                    {getRoleIcon(request.requester.role)}
                                    <Badge 
                                      className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200"
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      Pending Review
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {request.requester.email} • @{request.requester.username}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-l-amber-400 mb-4 shadow-sm">
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {request.message}
                              </p>
                            </div>
                            
                            <div className="flex gap-3">
                              <Button
                                size="sm"
                                data-testid={`button-approve-${request.id}`}
                                onClick={() => respondToRequest.mutate({ 
                                  requestId: request.id, 
                                  status: 'APPROVED' 
                                })}
                                disabled={respondToRequest.isPending}
                                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Accept & Add to Team
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-reject-${request.id}`}
                                onClick={() => respondToRequest.mutate({ 
                                  requestId: request.id, 
                                  status: 'REJECTED' 
                                })}
                                disabled={respondToRequest.isPending}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Request History */}
                {processedRequests.length > 0 && (
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-slate-500" />
                        Request History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {processedRequests.slice(0, 5).map((request) => (
                          <div key={request.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(request.requester.firstName || '', request.requester.lastName || '')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {request.requester.firstName} {request.requester.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge 
                                variant={request.status === 'APPROVED' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {request.status === 'APPROVED' ? (
                                  <Check className="h-3 w-3 mr-1" />
                                ) : (
                                  <X className="h-3 w-3 mr-1" />
                                )}
                                {request.status}
                              </Badge>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {request.respondedAt ? new Date(request.respondedAt).toLocaleDateString() : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="invite" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Invite by Email */}
                  <Card className="shadow-lg border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        Quick Email Invite
                      </CardTitle>
                      <CardDescription>
                        Send an invitation directly to someone's email address
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email-input" className="text-sm font-medium">Email Address</Label>
                          <Input
                            id="email-input"
                            data-testid="input-collaborator-email"
                            placeholder="colleague@university.edu"
                            value={collaboratorEmail}
                            onChange={(e) => setCollaboratorEmail(e.target.value)}
                            className="h-12 text-base"
                            type="email"
                          />
                        </div>
                        <Button
                          data-testid="button-add-collaborator"
                          onClick={handleAddCollaborator}
                          disabled={addCollaboratorByEmail.isPending}
                          className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium shadow-lg"
                        >
                          {addCollaboratorByEmail.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Sending Invitation...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              Send Invitation
                            </div>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Search and Invite */}
                  <Card className="shadow-lg border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <Search className="h-5 w-5 text-emerald-500" />
                        Find & Invite Users
                      </CardTitle>
                      <CardDescription>
                        Search for users from your institution to invite
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                          <Input
                            data-testid="input-user-search"
                            placeholder="Search by name, email, or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 text-base"
                          />
                        </div>
                        
                        {/* Selected Users */}
                        {selectedUsers.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Selected Users:</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedUsers.map((user) => (
                                <Badge key={user.id} className="bg-emerald-100 text-emerald-800 border-emerald-300 px-3 py-1 text-sm">
                                  <Avatar className="h-4 w-4 mr-2">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(user.firstName, user.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {user.firstName} {user.lastName}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 p-0 ml-2 hover:bg-emerald-200"
                                    onClick={() => handleRemoveSelectedUser(user.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                            <Button
                              onClick={() => batchInviteUsers.mutate(selectedUsers)}
                              disabled={batchInviteUsers.isPending}
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-12"
                            >
                              {batchInviteUsers.isPending ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Sending Invitations...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Send className="h-4 w-4" />
                                  Invite {selectedUsers.length} User{selectedUsers.length > 1 ? 's' : ''}
                                </div>
                              )}
                            </Button>
                          </div>
                        )}
                        
                        {/* Search Results */}
                        {showSearchResults && searchResults.length > 0 && (
                          <div className="border rounded-xl max-h-80 overflow-y-auto bg-white dark:bg-slate-800">
                            {searchResults.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                onClick={() => handleSelectUser(user)}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className={getAvatarColor(user.role)}>
                                      {getInitials(user.firstName, user.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {user.firstName} {user.lastName}
                                      </span>
                                      {getRoleIcon(user.role)}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {user.email} • @{user.username}
                                    </div>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Enhanced Non-Owner View */
            <div className="p-6">
              <Card className="shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 pb-6">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Target className="h-6 w-6 text-emerald-500" />
                    Join This Amazing Project
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                    Share your passion and skills with the project owner to become part of this incredible journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="collaboration-message" className="text-lg font-semibold">Your Collaboration Message</Label>
                      <Textarea
                        id="collaboration-message"
                        data-testid="textarea-collaboration-message"
                        placeholder="Hi! I'm excited about your project because...&#10;&#10;I can contribute with my experience in...&#10;&#10;Let's build something amazing together!"
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        rows={8}
                        className="resize-none text-base leading-relaxed"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                        <Award className="h-4 w-4 mt-0.5 text-blue-500" />
                        <span>
                          <strong>Pro tip:</strong> Share your background, relevant skills, and specific ways you can contribute to make your request stand out.
                        </span>
                      </p>
                    </div>
                    <Button
                      data-testid="button-send-request"
                      onClick={handleRequestCollaboration}
                      disabled={requestCollaboration.isPending || !requestMessage.trim()}
                      className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold shadow-xl"
                    >
                      {requestCollaboration.isPending ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending Your Request...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Send className="h-5 w-5" />
                          Send Collaboration Request
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationModal;