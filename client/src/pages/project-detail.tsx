import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiGet, apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { ProjectWithDetails } from "@shared/schema";
import { 
  FileCode, 
  Download, 
  Upload, 
  Calendar, 
  User, 
  Building, 
  BookOpen, 
  Eye, 
  Star, 
  MessageCircle, 
  Share, 
  File, 
  Image, 
  Archive, 
  Folder, 
  X,
  Clock,
  GitFork,
  ExternalLink,
  Heart,
  Bookmark,
  Code2,
  Trash2,
  AlertTriangle,
  GitBranch,
  Globe,
  Github,
  Play,
  Volume2
} from 'lucide-react';

interface ProjectDetailParams {
  id: string;
}

interface ProjectFile {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  content?: string;
  isArchive: boolean;
  archiveContents?: string;
  uploadedAt: string;
}

// Helper functions for GitHub-style repository display
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInWeeks === 1) return '1 week ago';
  if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
  if (diffInMonths === 1) return '1 month ago';
  return `${diffInMonths} months ago`;
}

function getFileIcon(file: ProjectFile) {
  if (file.isArchive) {
    return <Archive className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
  }
  
  const extension = file.fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'js':
    case 'jsx':
      return <FileCode className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
    case 'ts':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    case 'py':
      return <FileCode className="w-4 h-4 text-green-500 dark:text-green-400" />;
    case 'html':
    case 'htm':
      return <FileCode className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
    case 'css':
    case 'scss':
    case 'sass':
      return <FileCode className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
    case 'md':
      return <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    case 'txt':
      return <File className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <Image className="w-4 h-4 text-pink-500 dark:text-pink-400" />;
    case 'pdf':
      return <File className="w-4 h-4 text-red-500 dark:text-red-400" />;
    default:
      return <File className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
  }
}

function getRepositoryFolders(files: ProjectFile[]): string[] {
  const folders = new Set<string>();
  
  // Extract folder names from file paths
  files.forEach(file => {
    if (file.filePath && file.filePath.includes('/')) {
      const pathParts = file.filePath.split('/');
      if (pathParts.length > 1) {
        folders.add(pathParts[0]);
      }
    }
  });
  
  // Add some common folder names based on file types for better GitHub-like experience
  const hasJavaScript = files.some(f => f.fileName.includes('.js') || f.fileName.includes('.jsx'));
  const hasPython = files.some(f => f.fileName.includes('.py'));
  const hasDocuments = files.some(f => f.fileName.includes('.md') || f.fileName.includes('.txt'));
  const hasAssets = files.some(f => f.fileName.includes('.png') || f.fileName.includes('.jpg'));
  
  if (hasJavaScript && !folders.has('src')) folders.add('client');
  if (hasPython && !folders.has('src')) folders.add('api');
  if (hasDocuments && !folders.has('docs')) folders.add('docs');
  if (hasAssets && !folders.has('assets')) folders.add('attached_assets');
  
  return Array.from(folders).sort();
}


function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileTypeLabel(file: ProjectFile): string {
  if (file.isArchive) return 'Archive';
  const extension = file.fileName.split('.').pop()?.toLowerCase() || '';
  switch (extension) {
    case 'js': return 'JavaScript';
    case 'jsx': return 'React JSX';
    case 'ts': return 'TypeScript';
    case 'tsx': return 'React TSX';
    case 'py': return 'Python';
    case 'html': return 'HTML';
    case 'css': return 'CSS';
    case 'scss': return 'Sass';
    case 'md': return 'Markdown';
    case 'txt': return 'Text';
    case 'json': return 'JSON';
    case 'png': case 'jpg': case 'jpeg': return 'Image';
    default: return 'File';
  }
}

function getFilesInFolder(folderName: string, files: ProjectFile[]): ProjectFile[] {
  return files.filter(file => 
    file.filePath && file.filePath.startsWith(folderName + '/')
  );
}

// Move these functions inside the component to access state setters
export default function ProjectDetail() {
  const params = useParams<ProjectDetailParams>();
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get current user from auth store (must be called before any conditional returns)
  const { user } = useAuthStore();


  async function handleFileClick(file: ProjectFile): Promise<void> {
    console.log('File clicked:', file.fileName);
    setSelectedFile(file);
    setIsFileViewerOpen(true);
    setFileContent('Loading...');
    
    try {
      const response = await apiRequest('GET', `/api/projects/files/${file.id}/view`);
      const content = await response.text();
      setFileContent(content);
    } catch (error) {
      console.error('❌ View failed:', error);
      setFileContent(`Error loading file: ${error}`);
    }
  }

  function handleFolderClick(folderName: string): void {
    console.log('Folder clicked:', folderName);
    // Toggle folder expansion or navigate into folder
  }

  async function handleFileDownload(e: React.MouseEvent, file: ProjectFile): Promise<void> {
    e.stopPropagation();
    console.log('🔽 Downloading file:', file.fileName, 'ID:', file.id);
    
    try {
      const response = await apiRequest('GET', `/api/projects/files/${file.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('✅ File download completed:', file.fileName);
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert(`Failed to download file: ${error}`);
    }
  }

  const handleDeleteProject = async () => {
    if (!user || !project || project.ownerId !== user.id) {
      console.error('❌ Cannot delete: not owner or not authenticated');
      return;
    }

    setIsDeleting(true);
    try {
      await apiRequest('DELETE', `/api/projects/${project.id}`);
      console.log('✅ Project deleted successfully');
      setLocation('/dashboard'); // Redirect to dashboard
    } catch (error) {
      console.error('❌ Failed to delete project:', error);
      alert(`Failed to delete project: ${error}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      for (const file of Array.from(files)) {
        console.log('📤 Uploading file:', file.name);
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`/api/projects/${params.id}/files`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ File uploaded successfully:', result);
      }
      
      // Reset the input and refresh the files list
      e.target.value = '';
      window.location.reload(); // Simple refresh to show new files
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert(`Failed to upload files: ${error}`);
    }
  }

  function handleFolderDownload(e: React.MouseEvent, folderName: string): void {
    e.stopPropagation();
    console.log('Download folder:', folderName);
    // In the future, implement zip download of folder contents
    alert('Folder download will be implemented soon!');
  }

  function isViewableFile(file: ProjectFile): boolean {
    const viewableExtensions = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json', 'xml', 'yml', 'yaml'];
    const extension = file.fileName.split('.').pop()?.toLowerCase() || '';
    return viewableExtensions.includes(extension) || file.fileType.startsWith('text/');
  }
  
  const { data: project, isLoading, error } = useQuery<ProjectWithDetails>({
    queryKey: [`/api/projects/${params.id}`],
    queryFn: async (): Promise<ProjectWithDetails> => {
      console.log('🔍 Fetching project with ID:', params.id);
      console.log('🔗 API URL:', `/api/projects/${params.id}`);
      try {
        const result = await apiGet<ProjectWithDetails>(`/api/projects/${params.id}`);
        console.log('✅ Project data received:', result);
        return result;
      } catch (err) {
        console.error('❌ Error fetching project:', err);
        throw err;
      }
    }
  });

  const { data: projectFiles } = useQuery<ProjectFile[]>({
    queryKey: [`/api/projects/${params.id}/files`],
    queryFn: async (): Promise<ProjectFile[]> => {
      try {
        const result = await apiGet<ProjectFile[]>(`/api/projects/${params.id}/files`);
        console.log('✅ Project files received:', result);
        return result;
      } catch (err) {
        console.error('❌ Error fetching project files:', err);
        return [];
      }
    },
    enabled: !!params.id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-red-600 dark:text-red-400 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Project Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <button 
            onClick={() => setLocation("/projects")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Check ownership and collaboration status
  const isOwner = user && project ? user.id === project.ownerId : false;
  const isCollaborator = user && project?.collaborators ? 
    project.collaborators.some(collaborator => collaborator.id === user.id) : false;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header - Material Design 3 */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setLocation("/projects")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 font-medium"
            >
              ← Back to Projects
            </button>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 text-slate-600 hover:text-slate-900">
                <Star className="w-4 h-4" />
                Star
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 text-slate-600 hover:text-slate-900">
                <MessageCircle className="w-4 h-4" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Section - Material Design 3 */}
        <div className="bg-white backdrop-blur-sm rounded-3xl border border-slate-200 mb-8 shadow-xl shadow-slate-900/5">
          <div className="px-8 py-10">
            {/* Status and Metadata Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Badge 
                  className="bg-green-100 text-green-700 border border-green-200 font-medium px-4 py-2 text-sm rounded-xl"
                >
                  {project.status.replace("_", " ")}
                </Badge>
                <Badge 
                  className="bg-blue-100 text-blue-700 border border-blue-200 font-medium px-4 py-2 text-sm rounded-xl"
                >
                  {project.category}
                </Badge>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200">
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {project.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            
            {/* Project Title and Description */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                {project.title}
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed max-w-4xl">
                {project.description}
              </p>
            </div>

            {/* Academic Information Grid */}
            <div className="mb-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Academic Information
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {project.academicLevel && (
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Academic Level</dt>
                      <dd className="text-slate-900 dark:text-slate-100 font-medium">{project.academicLevel}</dd>
                    </div>
                  )}
                  {project.department && (
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Department</dt>
                      <dd className="text-slate-900 dark:text-slate-100 font-medium">{project.department}</dd>
                    </div>
                  )}
                  {project.courseSubject && (
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Course/Subject</dt>
                      <dd className="text-slate-900 dark:text-slate-100 font-medium">{project.courseSubject}</dd>
                    </div>
                  )}
                </div>
                
                {/* Additional Academic Details */}
                <div className="mt-6 space-y-4">
                  {project.projectMethodology && (
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Project Methodology & Approach</dt>
                      <dd className="text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{project.projectMethodology}</p>
                      </dd>
                    </div>
                  )}
                  
                  {project.setupInstructions && (
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Setup & Installation Instructions</dt>
                      <dd className="text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">{project.setupInstructions}</pre>
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Author Information */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                <span className="text-white font-semibold">
                  {getInitials(project.owner.firstName || '', project.owner.lastName || '')}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {project.owner.firstName} {project.owner.lastName}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {project.owner.institution}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">



            {/* Documentation & Reports */}
            {project.documentationReports && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Documentation & Reports
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Project documentation, technical reports, and research findings
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {project.documentationReports}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Repository URLs */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Project Links
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Source code repositories and live demonstrations
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                {project.repositoryUrl && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <GitBranch className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <dt className="text-sm font-medium text-slate-900 dark:text-slate-100">Repository URL</dt>
                      <dd className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                          {project.repositoryUrl}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
                {(project.liveDemoUrl || project.demoUrl) && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <ExternalLink className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <dt className="text-sm font-medium text-slate-900 dark:text-slate-100">Live Demo URL</dt>
                      <dd className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <a href={project.liveDemoUrl || project.demoUrl || undefined} target="_blank" rel="noopener noreferrer">
                          {project.liveDemoUrl || project.demoUrl}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
                {project.githubUrl && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Github className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <dt className="text-sm font-medium text-slate-900 dark:text-slate-100">GitHub Repository</dt>
                      <dd className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          {project.githubUrl}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Images & Assets */}
            {project.imagesAssets && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Images & Assets
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Project screenshots, diagrams, and visual assets
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      try {
                        const assets = JSON.parse(project.imagesAssets);
                        if (Array.isArray(assets)) {
                          return assets.map((asset, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img 
                                  src={asset.url || asset} 
                                  alt={asset.description || `Project asset ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NS41IDUwLjVMMTAwIDY1TDExNC41IDUwLjVMMTAwIDM2TDg1LjUgNTAuNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4=';
                                  }}
                                />
                              </div>
                              {asset.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-center">
                                  {asset.description}
                                </p>
                              )}
                            </div>
                          ));
                        }
                      } catch (e) {
                        // If it's just a string, display it as a single asset
                        return (
                          <div className="col-span-full">
                            <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img 
                                src={project.imagesAssets} 
                                alt="Project asset"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center">
                                        <div class="text-center">
                                          <div class="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                            <svg class="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                          </div>
                                          <p class="text-sm text-slate-600 dark:text-slate-400">Image not available</p>
                                        </div>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Source Code Repository */}
            {project.sourceCodeRepository && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Source Code Repository
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Repository structure and main source code files
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="bg-slate-900 dark:bg-black rounded-lg overflow-hidden border border-slate-700">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-mono text-slate-300">source-tree</span>
                      </div>
                      <div className="text-xs text-slate-400">repository</div>
                    </div>
                    
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <pre className="text-sm font-mono text-blue-400 leading-relaxed whitespace-pre-wrap">
                        <code>{project.sourceCodeRepository}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Documentation */}
            {project.apiDocumentation && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    API Documentation
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    API endpoints, parameters, and usage examples
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="bg-slate-900 dark:bg-black rounded-lg overflow-hidden border border-slate-700">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-mono text-slate-300">API.md</span>
                      </div>
                      <div className="text-xs text-slate-400">documentation</div>
                    </div>
                    
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <pre className="text-sm font-mono text-cyan-400 leading-relaxed whitespace-pre-wrap">
                        <code>{project.apiDocumentation}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contributing Guidelines */}
            {project.contributingGuidelines && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Contributing Guidelines
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    How to contribute to this project and development workflow
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="bg-slate-900 dark:bg-black rounded-lg overflow-hidden border border-slate-700">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-mono text-slate-300">CONTRIBUTING.md</span>
                      </div>
                      <div className="text-xs text-slate-400">guide</div>
                    </div>
                    
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <pre className="text-sm font-mono text-purple-400 leading-relaxed whitespace-pre-wrap">
                        <code>{project.contributingGuidelines}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* GitHub-Style Repository Section */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden">
              {/* Repository Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#21262d]">
                <div className="flex items-center gap-3">
                  <Code2 className="w-5 h-5 text-[#7c3aed]" />
                  <h3 className="text-[#f0f6fc] font-semibold text-base">
                    {project.title.toLowerCase().replace(/\s+/g, '')}
                  </h3>
                  <span className="px-2 py-0.5 text-xs text-[#7d8590] bg-[#21262d] rounded-full border border-[#30363d]">
                    {projectFiles?.length || 0} files
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#21262d] transition-colors">
                    <GitFork className="w-4 h-4" />
                    Clone
                  </button>
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>


              {/* File Browser Header */}
              <div className="px-4 py-3 bg-[#0d1117] border-b border-[#21262d]">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[#7d8590] uppercase tracking-wider">NAME</span>
                  <span className="text-[#7d8590] uppercase tracking-wider">SIZE</span>
                </div>
              </div>

              {/* File/Folder Browser */}
              <div className="bg-[#0d1117]">
                {projectFiles && projectFiles.length > 0 ? (
                  <>
                    {/* Organize files into folders */}
                    {(() => {
                      const folders = new Set<string>();
                      const rootFiles: ProjectFile[] = [];
                      const folderFiles: { [key: string]: ProjectFile[] } = {};

                      projectFiles.forEach(file => {
                        if (file.filePath && file.filePath.includes('/')) {
                          const folderName = file.filePath.split('/')[0];
                          folders.add(folderName);
                          if (!folderFiles[folderName]) folderFiles[folderName] = [];
                          folderFiles[folderName].push(file);
                        } else {
                          rootFiles.push(file);
                        }
                      });

                      return (
                        <>
                          {/* Folders */}
                          {Array.from(folders).sort().map(folderName => {
                            const isExpanded = expandedFolders.has(folderName);
                            const folderFileCount = folderFiles[folderName]?.length || 0;
                            
                            return (
                              <div key={folderName}>
                                <div 
                                  className="flex items-center justify-between px-4 py-2 hover:bg-[#161b22] cursor-pointer border-b border-[#21262d]/50 group"
                                  onClick={() => {
                                    const newExpanded = new Set(expandedFolders);
                                    if (isExpanded) {
                                      newExpanded.delete(folderName);
                                    } else {
                                      newExpanded.add(folderName);
                                    }
                                    setExpandedFolders(newExpanded);
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[#7d8590] text-sm">
                                        {isExpanded ? '▼' : '▶'}
                                      </span>
                                      <Folder className="w-4 h-4 text-[#54aeff]" />
                                    </div>
                                    <span className="text-[#7d8590] text-sm font-medium group-hover:text-[#58a6ff]">
                                      {folderName}
                                    </span>
                                    <span className="text-xs text-[#656d76] bg-[#21262d] px-2 py-0.5 rounded-full">
                                      {folderFileCount} files
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-[#656d76] font-mono">-</span>
                                  </div>
                                </div>
                                
                                {/* Folder contents */}
                                {isExpanded && folderFiles[folderName] && (
                                  <div className="bg-[#010409]">
                                    {folderFiles[folderName].map(file => (
                                      <div 
                                        key={file.id}
                                        className="flex items-center justify-between px-8 py-2 hover:bg-[#161b22] cursor-pointer border-b border-[#21262d]/30 group"
                                        onClick={() => handleFileClick(file)}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-4"></div> {/* Indent for folder items */}
                                          {getFileIcon(file)}
                                          <span className="text-[#7d8590] text-sm group-hover:text-[#58a6ff] group-hover:underline">
                                            {file.fileName}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs text-[#656d76] font-mono">
                                            {formatTimeAgo(file.uploadedAt)}
                                          </span>
                                          <span className="text-xs text-[#656d76] font-mono min-w-[60px] text-right">
                                            {formatFileSize(file.fileSize)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          
                          {/* Root files */}
                          {rootFiles.sort((a, b) => a.fileName.localeCompare(b.fileName)).map(file => (
                            <div 
                              key={file.id}
                              className="flex items-center justify-between px-4 py-2 hover:bg-[#161b22] cursor-pointer border-b border-[#21262d]/50 group"
                              onClick={() => handleFileClick(file)}
                            >
                              <div className="flex items-center gap-3">
                                {getFileIcon(file)}
                                <span className="text-[#7d8590] text-sm group-hover:text-[#58a6ff] group-hover:underline">
                                  {file.fileName}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-[#656d76] font-mono">
                                  {formatTimeAgo(file.uploadedAt)}
                                </span>
                                <span className="text-xs text-[#656d76] font-mono min-w-[60px] text-right">
                                  {formatFileSize(file.fileSize)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <div className="px-8 py-16 text-center">
                    <div className="w-16 h-16 bg-[#21262d] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Folder className="w-8 h-8 text-[#656d76]" />
                    </div>
                    <h4 className="text-[#f0f6fc] font-semibold text-lg mb-2">
                      No files uploaded yet
                    </h4>
                    <p className="text-[#7d8590] text-sm max-w-md mx-auto">
                      Upload source code, documentation, or other project files to get started with your repository.
                    </p>
                    {(isOwner || isCollaborator) && (
                      <div className="mt-6">
                        <input
                          type="file"
                          multiple
                          accept=".zip,.rar,.tar,.gz,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.md,.txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="repo-file-upload"
                        />
                        <label
                          htmlFor="repo-file-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-sm rounded-md cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Upload files
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>







            {/* Project Information Section */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Additional Details
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  License information and project statistics
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">License Type</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.licenseType || 'MIT'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                        {new Date(project.updatedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Files Count</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                        {projectFiles?.length || 0} files uploaded
                      </dd>
                    </div>
                  </div>
                </div>
                
                {/* Technology Stack */}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Technology Stack</dt>
                    <dd className="flex flex-wrap gap-2">
                      {project.techStack.map((tech, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                

              </div>
            </div>

            {/* Documentation & Setup Instructions */}
            {(project.readmeContent || project.installationInstructions || project.contributingGuidelines || project.apiDocumentation) && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Documentation & Setup
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Project documentation and setup instructions
                  </p>
                </div>
                
                <div className="p-6 space-y-6">
                  {project.readmeContent && (
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">README</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <pre className="whitespace-pre-wrap font-mono text-xs">{project.readmeContent}</pre>
                      </dd>
                    </div>
                  )}
                  

                  
                  {project.contributingGuidelines && (
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Contributing Guidelines</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <pre className="whitespace-pre-wrap">{project.contributingGuidelines}</pre>
                      </dd>
                    </div>
                  )}
                  
                  {project.apiDocumentation && (
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">API Documentation</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <pre className="whitespace-pre-wrap font-mono text-xs">{project.apiDocumentation}</pre>
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Repository Structure */}
            {project.repositoryStructure && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Repository Structure
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Project file organization and structure
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <pre className="text-sm font-mono text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{project.repositoryStructure}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Code Files Section */}
            {projectFiles && projectFiles.filter(f => f.fileName.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|html|css|php|rb|go|rs|swift|kt|json|xml|yaml|yml|sql|sh|bat)$/i)).length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCode className="w-5 h-5 text-green-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          Source Code
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {projectFiles.filter(f => f.fileName.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|html|css|php|rb|go|rs|swift|kt|json|xml|yaml|yml|sql|sh|bat)$/i)).length} files
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `/api/projects/${project.id}/download-all`;
                        link.download = `${project.title.replace(/\s+/g, '_')}_code.zip`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Clone
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-2">
                    {projectFiles.filter(f => f.fileName.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|html|css|php|rb|go|rs|swift|kt|json|xml|yaml|yml|sql|sh|bat)$/i)).map((file) => (
                      <div key={file.id} className="group flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                        <FileCode className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate font-mono">
                              {file.fileName}
                            </span>
                            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                              {file.fileName.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {(file.fileSize / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedFile(file);
                              setIsFileViewerOpen(true);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded hover:border-slate-300 dark:hover:border-slate-500 transition-all"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={(e) => handleFileDownload(e, file)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded hover:border-slate-300 dark:hover:border-slate-500 transition-all"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Images & Media Section */}
            {projectFiles && projectFiles.filter(f => f.fileType.startsWith('image/') || f.fileType.startsWith('video/') || f.fileName.match(/\.(png|jpg|jpeg|gif|svg|webp|mp4|mov|avi|webm|mp3|wav|ogg)$/i)).length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image className="w-5 h-5 text-pink-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          Images & Media
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {projectFiles.filter(f => f.fileType.startsWith('image/') || f.fileType.startsWith('video/') || f.fileName.match(/\.(png|jpg|jpeg|gif|svg|webp|mp4|mov|avi|webm|mp3|wav|ogg)$/i)).length} files
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `/api/projects/${project.id}/download-all`;
                        link.download = `${project.title.replace(/\s+/g, '_')}_media.zip`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {projectFiles.filter(f => f.fileType.startsWith('image/') || f.fileType.startsWith('video/') || f.fileName.match(/\.(png|jpg|jpeg|gif|svg|webp|mp4|mov|avi|webm|mp3|wav|ogg)$/i)).map((file) => {
                      const isVideo = file.fileType.startsWith('video/') || file.fileName.match(/\.(mp4|mov|avi|webm)$/i);
                      const isAudio = file.fileName.match(/\.(mp3|wav|ogg)$/i);
                      
                      return (
                        <div key={file.id} className="group relative bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                          <div className="aspect-square bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            {file.fileType.startsWith('image/') ? (
                              <Image className="w-8 h-8 text-pink-500" />
                            ) : isVideo ? (
                              <Play className="w-8 h-8 text-purple-500" />
                            ) : isAudio ? (
                              <Volume2 className="w-8 h-8 text-indigo-500" />
                            ) : (
                              <File className="w-8 h-8 text-slate-500" />
                            )}
                          </div>
                          <div className="p-3">
                            <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate mb-1">
                              {file.fileName}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {(file.fileSize / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedFile(file);
                                  setIsFileViewerOpen(true);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-white bg-opacity-20 backdrop-blur-sm rounded border border-white border-opacity-30 hover:bg-opacity-30 transition-all"
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </button>
                              <button
                                onClick={(e) => handleFileDownload(e, file)}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-white bg-opacity-20 backdrop-blur-sm rounded border border-white border-opacity-30 hover:bg-opacity-30 transition-all"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Documentation Section */}
            {projectFiles && projectFiles.filter(f => f.fileType.includes('pdf') || f.fileName.match(/\.(doc|docx|txt|md|rtf|readme)$/i)).length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-blue-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          Documentation
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {projectFiles.filter(f => f.fileType.includes('pdf') || f.fileName.match(/\.(doc|docx|txt|md|rtf|readme)$/i)).length} files
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `/api/projects/${project.id}/download-all`;
                        link.download = `${project.title.replace(/\s+/g, '_')}_docs.zip`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    {projectFiles.filter(f => f.fileType.includes('pdf') || f.fileName.match(/\.(doc|docx|txt|md|rtf|readme)$/i)).map((file) => (
                      <div key={file.id} className="group flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                        <div className="flex-shrink-0">
                          <File className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {file.fileName}
                            </span>
                            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                              {file.fileName.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedFile(file);
                              setIsFileViewerOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded hover:border-slate-300 dark:hover:border-slate-500 transition-all"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={(e) => handleFileDownload(e, file)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded hover:border-slate-300 dark:hover:border-slate-500 transition-all"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Author Card */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center border-4 border-slate-200 dark:border-slate-700">
                    <span className="text-white font-bold text-2xl">
                      {getInitials(project.owner.firstName || '', project.owner.lastName || '')}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">
                  {project.owner.firstName} {project.owner.lastName}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                  {project.owner.institution}
                </p>
                <Badge 
                  variant="secondary" 
                  className="font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                >
                  {project.owner.role.toLowerCase()}
                </Badge>
              </CardHeader>
            </Card>

            {/* Project Stats */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6">
              <CardHeader className="pb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  Activity
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Views</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Project visibility</p>
                  </div>
                  <span className="font-bold text-lg text-slate-900 dark:text-slate-100">0</span>
                </div>
                
                <Separator className="bg-slate-200 dark:bg-slate-800" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Stars</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Community love</p>
                  </div>
                  <span className="font-bold text-lg text-slate-900 dark:text-slate-100">0</span>
                </div>
                
                <Separator className="bg-slate-200 dark:bg-slate-800" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Comments</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Feedback & Discussion</p>
                  </div>
                  <span className="font-bold text-lg text-slate-900 dark:text-slate-100">0</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Star this project</span>
                </button>
                
                <button className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Download ZIP</span>
                </button>
                
                <button className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Add comment</span>
                </button>
                
                {/* Delete button - only show if user is the owner */}
                {user && project.ownerId === user.id && (
                  <button 
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-full p-3 border border-red-200 dark:border-red-800 rounded-lg hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">Delete Project</span>
                    </div>
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Enhanced GitHub-style File Viewer Modal */}
      <Dialog open={isFileViewerOpen} onOpenChange={setIsFileViewerOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] bg-[#0d1117] border border-[#30363d] p-0">
          {/* File Viewer Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#21262d]">
            <div className="flex items-center gap-3">
              {selectedFile && getFileIcon(selectedFile)}
              <div>
                <h3 className="text-[#f0f6fc] text-lg font-semibold">
                  {selectedFile?.fileName || 'File Viewer'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#7d8590]">
                  <span>{selectedFile && formatFileSize(selectedFile.fileSize)}</span>
                  <span>•</span>
                  <span>{selectedFile && getFileTypeLabel(selectedFile)}</span>
                  <span>•</span>
                  <span>UTF-8</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 text-sm text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#21262d] transition-colors"
                onClick={() => navigator.clipboard.writeText(selectedFile?.fileName || '')}
              >
                Copy path
              </button>
              {selectedFile && (
                <button
                  onClick={(e) => handleFileDownload(e, selectedFile)}
                  className="px-3 py-1.5 text-sm text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
              <button
                onClick={() => setIsFileViewerOpen(false)}
                className="p-2 text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* File Content */}
          <div className="flex-1 overflow-auto bg-[#0d1117] max-h-[80vh]">
            {selectedFile && isViewableFile(selectedFile) ? (
              <div className="relative">
                {/* Line numbers and content */}
                <div className="flex">
                  {/* Line numbers column */}
                  <div className="bg-[#0d1117] px-4 py-4 border-r border-[#21262d] select-none">
                    <div className="text-xs font-mono text-[#656d76] leading-6">
                      {fileContent.split('\n').map((_, index) => (
                        <div key={index} className="text-right">
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Content column */}
                  <div className="flex-1 p-4">
                    <pre className="text-sm font-mono text-[#e6edf3] leading-6 whitespace-pre-wrap overflow-auto">
                      <code className="language-javascript">{fileContent}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ) : selectedFile?.fileType.startsWith('image/') ? (
              <div className="flex items-center justify-center p-8 min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#21262d] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Image className="w-8 h-8 text-[#7d8590]" />
                  </div>
                  <h3 className="text-[#f0f6fc] font-medium mb-2">Image Preview</h3>
                  <p className="text-[#7d8590] text-sm mb-4">
                    Image files can be downloaded and viewed externally
                  </p>
                  <Button
                    onClick={(e) => selectedFile && handleFileDownload(e, selectedFile)}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white"
                  >
                    <span className="mr-2">↓</span>
                    Download {selectedFile.fileName}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-slate-600 dark:text-slate-400 text-2xl">📄</span>
                  </div>
                  <h3 className="text-[#f0f6fc] font-medium mb-2">Binary File</h3>
                  <p className="text-[#7d8590] text-sm mb-4">
                    This file cannot be previewed in the browser
                  </p>
                  <Button
                    onClick={(e) => selectedFile && handleFileDownload(e, selectedFile)}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white"
                  >
                    <span className="mr-2">↓</span>
                    Download {selectedFile?.fileName}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Delete Project
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Are you sure you want to delete <span className="font-semibold">"{project?.title}"</span>? 
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This will permanently delete the project and all associated files. This action cannot be reversed.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}