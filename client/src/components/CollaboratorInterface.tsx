import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  FileText, 
  MessageCircle, 
  Settings, 
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowRight,
  Calendar,
  User,
  Plus,
  Send,
  AlertCircle,
  Edit
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: string;
  status: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  academicLevel?: string;
  department?: string;
  courseSubject?: string;
  projectMethodology?: string;
  setupInstructions?: string;
  repositoryUrl?: string;
  liveDemoUrl?: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ProjectFile {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Collaborator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  addedAt: string;
}

interface PullRequest {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'APPROVED' | 'REJECTED' | 'MERGED' | 'DRAFT';
  authorId: string;
  author?: {
    firstName: string;
    lastName: string;
  };
  filesChanged: string[];
  changesPreview?: string;
  createdAt: string;
  updatedAt: string;
}

interface CollaboratorInterfaceProps {
  project: Project;
}

export default function CollaboratorInterface({ project }: CollaboratorInterfaceProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  
  // Enhanced PR workflow state (move before usage)
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [showPRDialog, setShowPRDialog] = useState(false);
  const [prSummary, setPrSummary] = useState('');
  const [changesSinceLastPR, setChangesSinceLastPR] = useState<string[]>([]);

  // Check if current user is the project owner
  const isOwner = user?.id === project.owner.id;
  
  // Debug: log user status
  console.log('Current user:', user?.id);
  console.log('Project owner:', project.owner.id);
  console.log('Is owner:', isOwner);
  console.log('Changes since last PR:', changesSinceLastPR);
  
  // Form states for editing
  const [editedProject, setEditedProject] = useState({
    title: project.title,
    description: project.description,
    category: project.category,
    techStack: project.techStack,
    githubUrl: project.githubUrl || '',
    demoUrl: project.demoUrl || '',
    academicLevel: project.academicLevel || '',
    department: project.department || '',
    courseSubject: project.courseSubject || '',
    projectMethodology: project.projectMethodology || '',
    setupInstructions: project.setupInstructions || '',
  });

  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Comment state
  const [newComment, setNewComment] = useState('');

  // Fetch project files
  const { data: projectFiles = [] } = useQuery<ProjectFile[]>({
    queryKey: [`/api/projects/${project.id}/files`],
  });

  // Fetch project comments
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/projects/${project.id}/comments`],
  });

  // Fetch collaborators
  const { data: collaborators = [] } = useQuery<Collaborator[]>({
    queryKey: [`/api/projects/${project.id}/collaborators`],
  });

  // Fetch pull requests
  const { data: pullRequests = [] } = useQuery<PullRequest[]>({
    queryKey: [`/api/projects/${project.id}/pull-requests`],
  });

  // Auto-detect changes and track them for PR creation
  const trackChange = (type: 'details' | 'files' | 'comments', changeData: any) => {
    const change = {
      type,
      timestamp: new Date().toISOString(),
      data: changeData,
      id: `${type}-${Date.now()}`
    };
    
    setPendingChanges(prev => [...prev, change]);
    setChangesSinceLastPR(prev => {
      const newSet = new Set([...prev, type]);
      return Array.from(newSet);
    });
    
    toast({
      title: "Changes Detected",
      description: "Your changes will be prepared for a pull request.",
    });
  };

  // Enhanced pull request creation mutation (collaborators only)
  const createPullRequest = useMutation({
    mutationFn: async (changes: {
      changedFields: string[];
      changesData: any;
    }) => {
      // Generate detailed title and description based on changes
      const generateTitle = (fields: string[]) => {
        if (fields.length === 1) {
          const field = fields[0];
          return `Update ${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}`;
        }
        return `Update ${fields.length} project fields`;
      };
      
      const generateDescription = (fields: string[], data: any) => {
        let description = 'Proposed changes:\n\n';
        fields.forEach(field => {
          const oldValue = project[field as keyof typeof project];
          const newValue = data[field];
          if (field === 'techStack') {
            description += `• **${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}**: ${Array.isArray(oldValue) ? oldValue.join(', ') : oldValue || 'None'} → ${Array.isArray(newValue) ? newValue.join(', ') : newValue || 'None'}\n`;
          } else {
            const oldText = typeof oldValue === 'string' ? (oldValue.length > 50 ? oldValue.substring(0, 47) + '...' : oldValue) : oldValue || 'None';
            const newText = typeof newValue === 'string' ? (newValue.length > 50 ? newValue.substring(0, 47) + '...' : newValue) : newValue || 'None';
            description += `• **${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}**: ${oldText} → ${newText}\n`;
          }
        });
        description += '\nPlease review and merge if acceptable.';
        return description;
      };
      
      const title = generateTitle(changes.changedFields);
      const description = generateDescription(changes.changedFields, changes.changesData);
      
      // Create FormData for file upload support
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', prSummary || description);
      formData.append('filesChanged', JSON.stringify(changes.changedFields));
      formData.append('changesPreview', JSON.stringify(changes.changesData));
      formData.append('branchName', `update-${changes.changedFields.join('-')}-${Date.now()}`);
      
      // Get token for authorization
      const token = useAuthStore.getState().token;
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/projects/${project.id}/pull-requests`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to create pull request');
      }
    },
    onSuccess: () => {
      toast({
        title: "Pull Request Created",
        description: "Your contribution has been submitted for review. The project owner will be notified.",
      });
      setHasUnsavedChanges(false);
      setPendingChanges([]);
      setChangesSinceLastPR([]);
      setPrSummary('');
      setShowPRDialog(false);
      // Reset form to original values
      setEditedProject({
        title: project.title,
        description: project.description,
        category: project.category,
        techStack: project.techStack,
        githubUrl: project.githubUrl || '',
        demoUrl: project.demoUrl || '',
        academicLevel: project.academicLevel || '',
        department: project.department || '',
        courseSubject: project.courseSubject || '',
        projectMethodology: project.projectMethodology || '',
        setupInstructions: project.setupInstructions || '',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/pull-requests`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Pull Request",
        description: error?.message || "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  // Pull request approval mutation (owners only)
  const updatePullRequestStatus = useMutation({
    mutationFn: async ({ prId, status }: { prId: string; status: string }) => {
      await apiRequest('PATCH', `/api/projects/${project.id}/pull-requests/${prId}`, {
        status,
      });
    },
    onSuccess: (_, { status }) => {
      const statusMessages = {
        'APPROVED': {
          title: "Pull Request Approved",
          description: "The contribution has been approved and is ready for merge."
        },
        'REJECTED': {
          title: "Pull Request Rejected",
          description: "The contribution was rejected. The collaborator has been notified."
        },
        'MERGED': {
          title: "Changes Merged Successfully",
          description: "The contribution has been merged and the project has been updated!"
        }
      };
      
      const message = statusMessages[status as keyof typeof statusMessages] || {
        title: "Pull Request Updated",
        description: "The pull request status has been updated."
      };
      
      toast({
        title: message.title,
        description: message.description,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/pull-requests`] });
      
      // If merged, also refresh project data to show updated information
      if (status === 'MERGED') {
        queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
        // Also refresh the main project list if user navigates back
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pull request status.",
        variant: "destructive",
      });
    },
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const authData = localStorage.getItem('auth-storage');
        const headers: Record<string, string> = {};
        
        if (authData) {
          try {
            const { state } = JSON.parse(authData);
            if (state?.token) {
              headers["Authorization"] = `Bearer ${state.token}`;
            }
          } catch (e) {
            console.warn('Failed to parse auth data:', e);
          }
        }
        
        const response = await fetch(`/api/projects/${project.id}/files`, {
          method: 'POST',
          headers,
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        return response.json();
      });
      
      return Promise.all(uploadPromises);
    },
    onSuccess: (data) => {
      toast({
        title: "Files Uploaded",
        description: "Your files have been uploaded successfully.",
      });
      setSelectedFiles(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Track file upload for PR if user is collaborator
      if (!isOwner) {
        trackChange('files', { action: 'upload', fileCount: data.length });
        toast({
          title: "Changes Detected",
          description: `Uploaded ${data.length} file(s). Go to Discussion tab to create a pull request.`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/files`] });
    },
    onError: (error: any) => {
      console.error('File upload error:', error);
      
      // Handle specific error codes
      if (error?.message?.includes("REQUIRES_PULL_REQUEST") || 
          error?.message?.includes("create a pull request")) {
        toast({
          title: "Pull Request Required",
          description: "As a collaborator, you cannot upload files directly. Create a pull request to propose your changes.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: error?.message || "Failed to upload files. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', `/api/projects/${project.id}/comments`, {
        content: content.trim(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment Posted",
        description: "Your comment has been added to the discussion.",
      });
      setNewComment('');
      // Track comment change for PR
      trackChange('comments', { content: newComment, action: 'add' });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/comments`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Post Comment",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Detect changes and update hasUnsavedChanges
  const detectChanges = () => {
    const changedFields = [];
    const changesData: any = {};
    
    if (editedProject.title !== project.title) {
      changedFields.push('title');
      changesData.title = editedProject.title;
    }
    if (editedProject.description !== project.description) {
      changedFields.push('description');
      changesData.description = editedProject.description;
    }
    if (editedProject.category !== project.category) {
      changedFields.push('category');
      changesData.category = editedProject.category;
    }
    if (JSON.stringify(editedProject.techStack) !== JSON.stringify(project.techStack)) {
      changedFields.push('techStack');
      changesData.techStack = editedProject.techStack;
    }
    if (editedProject.githubUrl !== (project.githubUrl || '')) {
      changedFields.push('githubUrl');
      changesData.githubUrl = editedProject.githubUrl;
    }
    if (editedProject.demoUrl !== (project.demoUrl || '')) {
      changedFields.push('demoUrl');
      changesData.demoUrl = editedProject.demoUrl;
    }
    if (editedProject.academicLevel !== (project.academicLevel || '')) {
      changedFields.push('academicLevel');
      changesData.academicLevel = editedProject.academicLevel;
    }
    if (editedProject.department !== (project.department || '')) {
      changedFields.push('department');
      changesData.department = editedProject.department;
    }
    if (editedProject.courseSubject !== (project.courseSubject || '')) {
      changedFields.push('courseSubject');
      changesData.courseSubject = editedProject.courseSubject;
    }
    if (editedProject.projectMethodology !== (project.projectMethodology || '')) {
      changedFields.push('projectMethodology');
      changesData.projectMethodology = editedProject.projectMethodology;
    }
    if (editedProject.setupInstructions !== (project.setupInstructions || '')) {
      changedFields.push('setupInstructions');
      changesData.setupInstructions = editedProject.setupInstructions;
    }

    const hasChanges = changedFields.length > 0;
    setHasUnsavedChanges(hasChanges);
    
    return { changedFields, changesData, hasChanges };
  };

  // Auto-detect changes when form values change
  React.useEffect(() => {
    detectChanges();
  }, [editedProject]);

  const handleSubmitChanges = () => {
    const { changedFields, changesData, hasChanges } = detectChanges();
    
    if (!hasChanges) {
      toast({
        title: "No Changes",
        description: "No changes detected to submit.",
        variant: "destructive",
      });
      return;
    }

    createPullRequest.mutate({ changedFields, changesData });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      OPEN: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      MERGED: { color: 'bg-purple-100 text-purple-800', icon: GitBranch },
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: Eye },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OPEN;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleFileUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate(selectedFiles);
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please write a comment before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    if (newComment.length > 1000) {
      toast({
        title: "Comment Too Long",
        description: "Comments must be 1000 characters or less.",
        variant: "destructive",
      });
      return;
    }
    
    commentMutation.mutate(newComment);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Collaboration Workspace
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {project.title} - Make changes and submit pull requests
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {isOwner ? 'Owner' : 'Collaborator'}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Details
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="discussion" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Edit Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>
                      Make changes to project information. Changes will be submitted as pull requests for owner approval.
                    </CardDescription>
                  </div>
                  {hasUnsavedChanges && !isOwner && (
                    <Button 
                      onClick={handleSubmitChanges}
                      disabled={createPullRequest.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createPullRequest.isPending ? 'Submitting...' : 'Submit Changes'}
                    </Button>
                  )}
                  {isOwner && (
                    <Badge className="bg-blue-100 text-blue-800">
                      You can edit directly as the owner
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Project Title</Label>
                      <Input
                        id="title"
                        value={editedProject.title}
                        onChange={(e) => setEditedProject(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        value={editedProject.description}
                        onChange={(e) => setEditedProject(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={editedProject.category} onValueChange={(value) => setEditedProject(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Mobile App">Mobile App</SelectItem>
                          <SelectItem value="Desktop App">Desktop App</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                          <SelectItem value="Game Development">Game Development</SelectItem>
                          <SelectItem value="IoT">IoT</SelectItem>
                          <SelectItem value="Blockchain">Blockchain</SelectItem>
                          <SelectItem value="DevOps">DevOps</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="academicLevel">Academic Level</Label>
                      <Input
                        id="academicLevel"
                        value={editedProject.academicLevel}
                        onChange={(e) => setEditedProject(prev => ({ ...prev, academicLevel: e.target.value }))}
                        placeholder="e.g., Undergraduate, Graduate, PhD"
                      />
                    </div>

                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={editedProject.department}
                        onChange={(e) => setEditedProject(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="e.g., Computer Science, Engineering"
                      />
                    </div>

                    <div>
                      <Label htmlFor="courseSubject">Course/Subject</Label>
                      <Input
                        id="courseSubject"
                        value={editedProject.courseSubject}
                        onChange={(e) => setEditedProject(prev => ({ ...prev, courseSubject: e.target.value }))}
                        placeholder="e.g., Software Engineering, Data Structures"
                      />
                    </div>

                    <div>
                      <Label htmlFor="githubUrl">GitHub URL</Label>
                      <Input
                        id="githubUrl"
                        value={editedProject.githubUrl}
                        onChange={(e) => setEditedProject(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/username/repo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="demoUrl">Demo URL</Label>
                      <Input
                        id="demoUrl"
                        value={editedProject.demoUrl}
                        onChange={(e) => setEditedProject(prev => ({ ...prev, demoUrl: e.target.value }))}
                        placeholder="https://your-demo.com"
                      />
                    </div>
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
                <CardDescription>
                  View and manage project files
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* File Upload Section */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Upload New Files</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="file-upload">Select Files</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={(e) => setSelectedFiles(e.target.files)}
                        className="cursor-pointer"
                      />
                    </div>
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedFiles.length} file(s) selected
                        </p>
                        <Button
                          onClick={handleFileUpload}
                          disabled={uploadMutation.isPending}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {uploadMutation.isPending ? 'Uploading...' : 'Upload Files'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Existing Files */}
                {projectFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400">No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projectFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-slate-500" />
                          <div>
                            <p className="font-medium">{file.fileName}</p>
                            <p className="text-sm text-slate-500">
                              {(file.fileSize / 1024).toFixed(1)} KB • {formatDate(file.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discussion Tab */}
          <TabsContent value="discussion">
            <div className="space-y-6">
              {/* Manual PR Creation for Collaborators (always show for testing) */}
              {true && (
                <Card className="border-l-4 border-l-blue-400 bg-blue-50 dark:bg-blue-950 mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-blue-600" />
                      Create Pull Request
                    </CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-300">
                      Submit your changes (file uploads, comments, edits) for owner review
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="manual-pr-summary">Pull Request Summary</Label>
                        <Textarea
                          id="manual-pr-summary"
                          placeholder="Describe what you've changed: uploaded 6 new files, added comments, etc..."
                          value={prSummary}
                          onChange={(e) => setPrSummary(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Describe your contributions to this project
                        </p>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={() => {
                            const changedFields = ['files', 'comments'];
                            createPullRequest.mutate({
                              changedFields,
                              changesData: { 
                                summary: prSummary,
                                filesUploaded: true,
                                commentsAdded: true
                              }
                            });
                          }}
                          disabled={createPullRequest.isPending || !prSummary.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <GitBranch className="w-4 h-4 mr-2" />
                          {createPullRequest.isPending ? 'Creating PR...' : 'Create Pull Request'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Auto PR Section (for collaborators with pending changes) */}
              {!isOwner && changesSinceLastPR.length > 0 && (
                <Card className="border-l-4 border-l-orange-400 bg-orange-50 dark:bg-orange-950">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      Push Changes to Pull Request
                    </CardTitle>
                    <CardDescription className="text-orange-700 dark:text-orange-300">
                      You have {changesSinceLastPR.length} type(s) of changes ready to be submitted for review
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Display pending changes */}
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Changes to be submitted:</h4>
                        <div className="flex flex-wrap gap-2">
                          {changesSinceLastPR.map((change) => (
                            <Badge key={change} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {change}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Summary input */}
                      <div>
                        <Label htmlFor="pr-summary">Pull Request Summary (Optional)</Label>
                        <Textarea
                          id="pr-summary"
                          placeholder="Briefly describe what you've changed and why..."
                          value={prSummary}
                          onChange={(e) => setPrSummary(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Provide context for the project owner about your changes
                        </p>
                      </div>
                      
                      {/* Push PR button */}
                      <div className="flex justify-end">
                        <Button
                          onClick={() => {
                            // Create PR with all pending changes
                            const changedFields = [...changesSinceLastPR];
                            createPullRequest.mutate({
                              changedFields,
                              changesData: editedProject
                            });
                          }}
                          disabled={createPullRequest.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <GitBranch className="w-4 h-4 mr-2" />
                          {createPullRequest.isPending ? 'Creating PR...' : 'Push Pull Request'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Pull Requests Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Pull Requests
                  </CardTitle>
                  <CardDescription>
                    {isOwner 
                      ? "Review and manage contribution requests from collaborators" 
                      : "Track your contribution requests and their status"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pullRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <GitBranch className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No Pull Requests</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {isOwner 
                          ? "When collaborators make changes, their contributions will appear here for review" 
                          : "Your contributions will appear here once you make changes to project details"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pullRequests.map((pr) => (
                        <div key={pr.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                {pr.title}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {pr.description}
                              </p>
                            </div>
                            {getStatusBadge(pr.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span>By {pr.author?.firstName} {pr.author?.lastName}</span>
                            <span>{pr.filesChanged.length} files changed</span>
                            <span>{formatDate(pr.createdAt)}</span>
                          </div>
                          
                          {pr.changesPreview && (
                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded border-l-4 border-blue-200">
                              <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Changes Preview:</h5>
                              <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                {(() => {
                                  try {
                                    const changes = JSON.parse(pr.changesPreview);
                                    return Object.keys(changes).map(key => {
                                      const value = Array.isArray(changes[key]) ? changes[key].join(', ') : changes[key];
                                      const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                                      return `• ${fieldName}: ${value}`;
                                    }).join('\n');
                                  } catch {
                                    return pr.changesPreview;
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                          
                          {/* Owner Actions */}
                          {isOwner && pr.status === 'OPEN' && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePullRequestStatus.mutate({ prId: pr.id, status: 'APPROVED' })}
                                disabled={updatePullRequestStatus.isPending}
                                className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {updatePullRequestStatus.isPending ? 'Approving...' : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePullRequestStatus.mutate({ prId: pr.id, status: 'REJECTED' })}
                                disabled={updatePullRequestStatus.isPending}
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {updatePullRequestStatus.isPending ? 'Rejecting...' : 'Reject'}
                              </Button>
                            </div>
                          )}
                          {isOwner && pr.status === 'APPROVED' && (
                            <div className="mt-4 flex items-center gap-3">
                              <Button
                                size="sm"
                                onClick={() => updatePullRequestStatus.mutate({ prId: pr.id, status: 'MERGED' })}
                                disabled={updatePullRequestStatus.isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <GitBranch className="h-4 w-4 mr-1" />
                                {updatePullRequestStatus.isPending ? 'Merging...' : 'Merge Changes'}
                              </Button>
                              <span className="text-sm text-green-600 font-medium">
                                ✅ Approved - Ready to merge
                              </span>
                            </div>
                          )}
                          
                          {/* Status Message for Non-Owners */}
                          {!isOwner && pr.status !== 'OPEN' && (
                            <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                              {pr.status === 'APPROVED' && "✅ Your contribution has been approved and is ready for merge."}
                              {pr.status === 'MERGED' && "🎉 Your contribution has been successfully merged into the project!"}
                              {pr.status === 'REJECTED' && "❌ Your contribution was not accepted. Consider revising and resubmitting."}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Discussion</CardTitle>
                  <CardDescription>
                    Collaborate and discuss project details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Add Comment Form */}
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {getInitials(user?.firstName || '', user?.lastName || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Share your thoughts about this project..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {newComment.length}/1000 characters
                          </p>
                          <Button
                            onClick={handleCommentSubmit}
                            disabled={!newComment.trim() || commentMutation.isPending}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600 dark:text-slate-400">No comments yet</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        Be the first to share your thoughts!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {getInitials(comment.author.firstName, comment.author.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {comment.author.firstName} {comment.author.lastName}
                                </span>
                                <span className="text-sm text-slate-500">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  View project collaborators and team information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Project Owner */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(project.owner.firstName, project.owner.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {project.owner.firstName} {project.owner.lastName}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {project.owner.email}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Owner</Badge>
                  </div>

                  {/* Collaborators */}
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getInitials(collaborator.firstName, collaborator.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {collaborator.firstName} {collaborator.lastName}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {collaborator.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{collaborator.role}</Badge>
                        <span className="text-sm text-slate-500">
                          Joined {formatDate(collaborator.addedAt)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {collaborators.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600 dark:text-slate-400">No other collaborators yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}