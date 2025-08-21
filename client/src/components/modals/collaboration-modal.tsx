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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { 
  Users, Send, Check, X, Clock, UserPlus, Search,
  User, Trash2
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
    },
    onSuccess: () => {
      toast({
        title: "Response sent",
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
        title: "Collaborator added",
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
        title: "Invitations sent",
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
        title: "Collaborator removed",
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
        title: "Message required",
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
        title: "Email required",
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>;
      case 'FACULTY':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Faculty</Badge>;
      case 'STUDENT':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Student</Badge>;
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="p-6 border-b bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              {isOwner ? "Team management" : "Request collaboration"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {isOwner 
                ? "Manage your project team and collaboration requests"
                : "Send a collaboration request to join this project"
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          {isOwner ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="team">
                    Team ({collaborators.length})
                  </TabsTrigger>
                  <TabsTrigger value="requests">
                    Requests ({pendingRequests.length})
                  </TabsTrigger>
                  <TabsTrigger value="invite">
                    Add collaborator
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="team" className="px-6 pb-6 space-y-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Team members</h3>
                  {collaborators.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No team members yet</p>
                      <p className="text-sm">Add collaborators to start building your team</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {collaborators.map((collaborator) => (
                        <div 
                          key={collaborator.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={`text-white ${getAvatarColor(collaborator.role)}`}>
                                {getInitials(collaborator.firstName, collaborator.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {collaborator.firstName} {collaborator.lastName}
                                  {collaborator.isOwner && " (Owner)"}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {collaborator.email} • @{collaborator.username}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
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

              <TabsContent value="requests" className="px-6 pb-6 space-y-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Pending requests</h3>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No pending requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingRequests.map((request) => (
                        <Card key={request.id} data-testid={`request-${request.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className={getAvatarColor(request.requester.role)}>
                                  {getInitials(request.requester.firstName || '', request.requester.lastName || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">
                                      {request.requester.firstName} {request.requester.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {request.requester.email} • @{request.requester.username}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(request.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded mb-3 text-sm">
                              {request.message}
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
                              >
                                <Check className="h-4 w-4 mr-1" />
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
                              >
                                <X className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="invite" className="px-6 pb-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Add collaborator</h3>
                    <p className="text-sm text-gray-600 mb-4">Search for users to add as collaborators to your project.</p>
                    
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        data-testid="input-user-search"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium mb-2 block">Selected users</Label>
                        <div className="flex flex-wrap gap-2 mb-3">
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
                          Send {selectedUsers.length} invitation{selectedUsers.length > 1 ? 's' : ''}
                        </Button>
                      </div>
                    )}
                    
                    {/* Search Results */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelectUser(user)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={getAvatarColor(user.role)}>
                                  {getInitials(user.firstName, user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <div className="space-y-3">
                      <Label htmlFor="email-input" className="text-sm font-medium">Or add by email address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email-input"
                          data-testid="input-collaborator-email"
                          placeholder="colleague@university.edu"
                          value={collaboratorEmail}
                          onChange={(e) => setCollaboratorEmail(e.target.value)}
                          type="email"
                        />
                        <Button
                          data-testid="button-add-collaborator"
                          onClick={handleAddCollaborator}
                          disabled={addCollaboratorByEmail.isPending}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Non-Owner View */
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="collaboration-message" className="text-sm font-medium mb-2 block">
                    Your message
                  </Label>
                  <Textarea
                    id="collaboration-message"
                    data-testid="textarea-collaboration-message"
                    placeholder="Hi! I'm interested in collaborating on your project because..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Explain your background and how you can contribute to this project.
                  </p>
                </div>
                <Button
                  data-testid="button-send-request"
                  onClick={handleRequestCollaboration}
                  disabled={requestCollaboration.isPending || !requestMessage.trim()}
                  className="w-full"
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