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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { useLocation } from "wouter";
import { 
  Users, Send, Check, X, Clock, UserPlus, Search, Trash2, ExternalLink
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
  const [acceptedProjectId, setAcceptedProjectId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

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
      const token = useAuthStore.getState().token;
      if (!token) {
        console.error('No authentication token available');
        return;
      }
      
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&projectId=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Search error:', errorData.message);
        toast({
          title: "Search Error",
          description: errorData.message || "Failed to search users",
          variant: "destructive",
        });
        return;
      }
      
      const results: SearchUser[] = await response.json();
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error", 
        description: "Failed to search users. Please try again.",
        variant: "destructive",
      });
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

  // Reset accepted project state when modal closes
  useEffect(() => {
    if (!open) {
      setAcceptedProjectId(null);
    }
  }, [open]);

  // Request collaboration mutation (for non-owners)
  const requestCollaboration = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      await apiRequest('POST', `/api/projects/${projectId}/collaborate/request`, { message });
    },
    onSuccess: () => {
      toast({
        title: "Request sent",
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
      return { status, projectId };
    },
    onSuccess: (data) => {
      if (data.status === 'APPROVED') {
        setAcceptedProjectId(data.projectId);
        toast({
          title: "Invitation accepted!",
          description: "You're now a collaborator on this project.",
        });
        // Invalidate dashboard stats and project listings since user is now a collaborator
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/invitations'] });
      } else {
        toast({
          title: "Response sent",
          description: "Collaboration request response has been sent.",
        });
      }
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

  // Invite collaborator by email mutation
  const inviteCollaboratorByEmail = useMutation({
    mutationFn: async ({ email, message }: { email: string; message?: string }) => {
      await apiRequest('POST', `/api/projects/${projectId}/collaborators/invite`, { email, message });
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: "Collaboration invitation sent successfully. The user will need to accept before becoming a collaborator.",
      });
      setCollaboratorEmail("");
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborate/requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  // Batch invite users
  const batchInviteUsers = useMutation({
    mutationFn: async (users: SearchUser[]) => {
      for (const user of users) {
        await apiRequest('POST', `/api/projects/${projectId}/collaborators/invite`, { 
          email: user.email, 
          message: `You've been invited to collaborate on this project` 
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Invitations sent",
        description: `Successfully sent ${selectedUsers.length} collaboration invitations. Users will need to accept before becoming collaborators.`,
      });
      setSelectedUsers([]);
      setSearchQuery("");
      setShowSearchResults(false);
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborate/requests'] });
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
        title: "Collaborator removed",
        description: "Collaborator has been removed from the project.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'collaborators'] });
      // Invalidate dashboard stats since collaboration counts have changed
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
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
        title: "Message required",
        description: "Please provide a message explaining why you'd like to collaborate.",
        variant: "destructive",
      });
      return;
    }
    requestCollaboration.mutate({ message: requestMessage });
  };

  const handleInviteCollaborator = () => {
    if (!collaboratorEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    inviteCollaboratorByEmail.mutate({ email: collaboratorEmail });
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-purple-500 hover:bg-purple-500 text-white">Admin</Badge>;
      case 'FACULTY':
        return <Badge className="bg-blue-500 hover:bg-blue-500 text-white">Faculty</Badge>;
      case 'STUDENT':
        return <Badge className="bg-green-500 hover:bg-green-500 text-white">Student</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return "bg-purple-500";
      case 'FACULTY':
        return "bg-blue-500";
      case 'STUDENT':
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">
              {isOwner ? "Team management" : "Request collaboration"}
            </DialogTitle>
            <DialogDescription className="text-gray-700 mt-1">
              {isOwner 
                ? "Manage your project team and collaboration requests"
                : "Send a collaboration request to join this project"
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-120px)] bg-white">
          {isOwner ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation */}
              <div className="px-6 pt-4 border-b border-gray-200">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                  <TabsTrigger value="team" className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-600">
                    Team ({collaborators.length})
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-600">
                    Requests ({pendingRequests.length})
                  </TabsTrigger>
                  <TabsTrigger value="invite" className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-600">
                    Add collaborator
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Team Tab */}
              <TabsContent value="team" className="px-6 py-6 space-y-4">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-black">Team members</h3>
                  {collaborators.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-900 font-medium mb-2">No team members yet</p>
                      <p className="text-gray-600">Add collaborators to start building your team</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {collaborators.map((collaborator) => (
                        <div 
                          key={collaborator.id} 
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className={`text-white font-semibold ${getAvatarColor(collaborator.role)}`}>
                                {getInitials(collaborator.firstName, collaborator.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-black">
                                  {collaborator.firstName} {collaborator.lastName}
                                  {collaborator.isOwner && " (Owner)"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700">
                                {collaborator.email} • @{collaborator.username}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getRoleBadge(collaborator.role)}
                            {!collaborator.isOwner && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCollaborator.mutate(collaborator.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`button-remove-${collaborator.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Requests Tab */}
              <TabsContent value="requests" className="px-6 py-6 space-y-4">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-black">Pending requests</h3>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-900 font-medium mb-2">No pending requests</p>
                      <p className="text-gray-600">All collaboration requests have been processed</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div 
                          key={request.id} 
                          className="border border-gray-200 rounded-lg bg-white p-4"
                          data-testid={`request-${request.id}`}
                        >
                          <div className="flex items-start gap-3 mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className={`font-semibold text-white ${getAvatarColor(request.requester?.role || 'STUDENT')}`}>
                                {getInitials(request.requester?.firstName || '', request.requester?.lastName || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-black">
                                    {request.requester?.firstName || 'Unknown'} {request.requester?.lastName || 'User'}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {request.requester?.email || 'No email'} • @{request.requester?.username || 'unknown'}
                                  </p>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {request.message && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                              <p className="text-gray-900 leading-relaxed">
                                {request.message}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex gap-3">
                            {acceptedProjectId ? (
                              <Button
                                size="sm"
                                data-testid="button-view-project"
                                onClick={() => {
                                  setLocation(`/projects/${acceptedProjectId}`);
                                  setOpen(false);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Your Project
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  data-testid={`button-approve-${request.id}`}
                                  onClick={() => respondToRequest.mutate({ 
                                    requestId: request.id, 
                                    status: 'APPROVED' 
                                  })}
                                  disabled={respondToRequest.isPending}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Accept
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
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Decline
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Add Collaborator Tab */}
              <TabsContent value="invite" className="px-6 py-6">
                <div className="space-y-6">
                  {/* Search Section */}
                  <div>
                    <h3 className="text-base font-semibold text-black mb-2">Invite collaborator</h3>
                    <p className="text-gray-700 mb-4">Search for users to invite as collaborators to your project. They will need to accept your invitation before becoming collaborators.</p>
                    
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        data-testid="input-user-search"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-gray-300 text-black placeholder-gray-500"
                      />
                    </div>
                    
                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm font-semibold text-black mb-2 block">Selected users</Label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedUsers.map((user) => (
                            <Badge key={user.id} variant="secondary" className="gap-2 bg-blue-100 text-blue-800">
                              {user.firstName} {user.lastName}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-transparent text-blue-600"
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
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send {selectedUsers.length} invitation{selectedUsers.length > 1 ? 's' : ''}
                        </Button>
                      </div>
                    )}
                    
                    {/* Search Results */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto bg-white">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelectUser(user)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className={`text-white font-semibold ${getAvatarColor(user.role)}`}>
                                  {getInitials(user.firstName, user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-black">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="border-gray-300 text-gray-700">
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Email Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="space-y-3">
                      <Label htmlFor="email-input" className="text-sm font-semibold text-black">Or invite by email address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email-input"
                          data-testid="input-collaborator-email"
                          placeholder="colleague@university.edu"
                          value={collaboratorEmail}
                          onChange={(e) => setCollaboratorEmail(e.target.value)}
                          type="email"
                          className="border-gray-300 text-black placeholder-gray-500"
                        />
                        <Button
                          data-testid="button-invite-collaborator"
                          onClick={handleInviteCollaborator}
                          disabled={inviteCollaboratorByEmail.isPending}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Invite
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Non-Owner View */
            <div className="p-6 bg-white">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="collaboration-message" className="text-sm font-semibold text-black mb-2 block">
                    Your message
                  </Label>
                  <Textarea
                    id="collaboration-message"
                    data-testid="textarea-collaboration-message"
                    placeholder="Hi! I'm interested in collaborating on your project because..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows={5}
                    className="resize-none border-gray-300 text-black placeholder-gray-500"
                  />
                  <p className="text-sm text-gray-700 mt-1">
                    Explain your background and how you can contribute to this project.
                  </p>
                </div>
                <Button
                  data-testid="button-send-request"
                  onClick={handleRequestCollaboration}
                  disabled={requestCollaboration.isPending || !requestMessage.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {requestCollaboration.isPending ? "Sending request..." : "Send collaboration request"}
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationModal;