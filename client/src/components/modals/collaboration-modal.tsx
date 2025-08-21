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
  ChevronDown, Filter, Calendar, MessageSquare
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
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'FACULTY':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'STUDENT':
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'APPROVED':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const processedRequests = requests.filter(r => r.status !== 'PENDING');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isOwner ? "Team Management" : "Request Collaboration"}
          </DialogTitle>
          <DialogDescription>
            {isOwner 
              ? "Manage your project team, handle collaboration requests, and control access."
              : "Request to collaborate on this project by sending a message to the owner."
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[650px] pr-4">
          {isOwner ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="team">Team ({collaborators.length})</TabsTrigger>
                <TabsTrigger value="requests">
                  Requests ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="invite">Invite Members</TabsTrigger>
              </TabsList>

              <TabsContent value="team" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Current Team Members
                    </CardTitle>
                    <CardDescription>
                      Manage roles and permissions for project collaborators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {collaborators.map((collaborator) => (
                        <div 
                          key={collaborator.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {getInitials(collaborator.firstName, collaborator.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {collaborator.firstName} {collaborator.lastName}
                                  {collaborator.isOwner && " (Owner)"}
                                </span>
                                {getRoleIcon(collaborator.role)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {collaborator.email} • @{collaborator.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Added {new Date(collaborator.addedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {collaborator.role}
                            </Badge>
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
                      {collaborators.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No team members yet</p>
                          <p className="text-sm">Start by inviting collaborators to your project</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Pending Requests
                    </CardTitle>
                    <CardDescription>
                      Review and respond to collaboration requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingRequests.map((request) => (
                        <div 
                          key={request.id} 
                          className="border rounded-lg p-4 space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                          data-testid={`request-${request.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                                  {getInitials(request.requester.firstName || '', request.requester.lastName || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {request.requester.firstName} {request.requester.lastName}
                                  </span>
                                  {getRoleIcon(request.requester.role)}
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {getStatusIcon(request.status)}
                                    {request.status}
                                  </Badge>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {request.requester.email} • @{request.requester.username}
                                </span>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 inline mr-1" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="bg-white dark:bg-muted/50 p-3 rounded border-l-4 border-l-blue-500">
                            <p className="text-sm leading-relaxed">
                              {request.message}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              data-testid={`button-approve-${request.id}`}
                              onClick={() => respondToRequest.mutate({ 
                                requestId: request.id, 
                                status: 'APPROVED' 
                              })}
                              disabled={respondToRequest.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve & Add
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
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingRequests.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No pending requests</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {processedRequests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Request History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {processedRequests.slice(0, 5).map((request) => (
                          <div key={request.id} className="flex items-center justify-between py-2 text-sm">
                            <span>
                              {request.requester.firstName} {request.requester.lastName}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={request.status === 'APPROVED' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {request.status}
                              </Badge>
                              <span className="text-muted-foreground">
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

              <TabsContent value="invite" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Invite by Email
                      </CardTitle>
                      <CardDescription>
                        Add collaborators using their registered email address
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          data-testid="input-collaborator-email"
                          placeholder="Enter email address"
                          value={collaboratorEmail}
                          onChange={(e) => setCollaboratorEmail(e.target.value)}
                          className="flex-1"
                          type="email"
                        />
                        <Button
                          data-testid="button-add-collaborator"
                          onClick={handleAddCollaborator}
                          disabled={addCollaboratorByEmail.isPending}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Users
                      </CardTitle>
                      <CardDescription>
                        Find and invite users from your institution
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          data-testid="input-user-search"
                          placeholder="Search by name, email, or username..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {selectedUsers.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Selected Users:</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedUsers.map((user) => (
                              <Badge key={user.id} variant="secondary" className="gap-1">
                                {user.firstName} {user.lastName}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0 hover:bg-transparent"
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
                            className="w-full"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send {selectedUsers.length} Invitation{selectedUsers.length > 1 ? 's' : ''}
                          </Button>
                        </div>
                      )}
                      
                      {showSearchResults && searchResults.length > 0 && (
                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                              onClick={() => handleSelectUser(user)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {getInitials(user.firstName, user.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      {user.firstName} {user.lastName}
                                    </span>
                                    {getRoleIcon(user.role)}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Request Collaboration Form for Non-owners */
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Request to Collaborate
                </CardTitle>
                <CardDescription>
                  Tell the project owner why you'd like to contribute
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collaboration-message">Your Message</Label>
                  <Textarea
                    id="collaboration-message"
                    data-testid="textarea-collaboration-message"
                    placeholder="Hi! I'm interested in collaborating on your project because..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Explain your background, skills, and how you can contribute to this project.
                  </p>
                </div>
                <Button
                  data-testid="button-send-request"
                  onClick={handleRequestCollaboration}
                  disabled={requestCollaboration.isPending || !requestMessage.trim()}
                  className="w-full"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {requestCollaboration.isPending ? "Sending Request..." : "Send Collaboration Request"}
                </Button>
              </CardContent>
            </Card>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationModal;