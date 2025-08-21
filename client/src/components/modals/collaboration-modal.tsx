import React, { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Users, Send, Check, X, Clock, UserPlus, Mail } from "lucide-react";

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
  requester: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

const CollaborationModal: React.FC<CollaborationModalProps> = ({ 
  projectId, 
  isOwner, 
  children 
}) => {
  const [open, setOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch collaboration requests (only for owners)
  const { data: requests = [] } = useQuery<CollaborationRequest[]>({
    queryKey: ['/api/projects', projectId, 'collaborate/requests'],
    enabled: isOwner && open,
  });

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

  // Respond to collaboration request mutation (for owners)
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

  // Add collaborator by email mutation (for owners)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isOwner ? "Manage Collaboration" : "Request Collaboration"}
          </DialogTitle>
          <DialogDescription>
            {isOwner 
              ? "Manage collaboration requests and add team members to your project."
              : "Request to collaborate on this project by sending a message to the owner."
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-6">
            {isOwner ? (
              <>
                {/* Add Collaborator by Email */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Collaborator
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      data-testid="input-collaborator-email"
                      placeholder="Enter collaborator's email"
                      value={collaboratorEmail}
                      onChange={(e) => setCollaboratorEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      data-testid="button-add-collaborator"
                      onClick={handleAddCollaborator}
                      disabled={addCollaboratorByEmail.isPending}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add team members by their registered platform email address.
                  </p>
                </div>

                <Separator />

                {/* Collaboration Requests */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Collaboration Requests ({requests.length})
                  </Label>
                  {requests.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No collaboration requests yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((request) => (
                        <div 
                          key={request.id} 
                          className="border rounded-lg p-4 space-y-3"
                          data-testid={`request-${request.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {request.requester.firstName} {request.requester.lastName}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ({request.requester.email})
                              </span>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {request.status}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm bg-muted p-3 rounded">
                            {request.message}
                          </p>
                          {request.status === 'PENDING' && (
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
                                Approve
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
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Request Collaboration Form */
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Why would you like to collaborate on this project?
                </Label>
                <Textarea
                  data-testid="textarea-collaboration-message"
                  placeholder="Explain your interest and what you can contribute..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                />
                <Button
                  data-testid="button-send-request"
                  onClick={handleRequestCollaboration}
                  disabled={requestCollaboration.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {requestCollaboration.isPending ? "Sending..." : "Send Request"}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationModal;