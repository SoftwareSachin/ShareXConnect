import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import type { ProjectWithDetails } from "@shared/schema";
import { 
  Folder, 
  FileText, 
  Archive, 
  FileCode, 
  Image, 
  File, 
  Clock, 
  User, 
  Download,
  GitCommit,
  Users,
  X,
  Eye
} from "lucide-react";

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

interface ProjectDetailParams {
  id: string;
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
    return <Archive className="w-4 h-4 text-[#7d8590] flex-shrink-0" />;
  }
  
  const extension = file.fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-[#f1e05a] flex-shrink-0" />;
    case 'py':
      return <FileCode className="w-4 h-4 text-[#3572A5] flex-shrink-0" />;
    case 'html':
    case 'htm':
      return <FileCode className="w-4 h-4 text-[#e34c26] flex-shrink-0" />;
    case 'css':
    case 'scss':
    case 'sass':
      return <FileCode className="w-4 h-4 text-[#563d7c] flex-shrink-0" />;
    case 'md':
    case 'txt':
      return <FileText className="w-4 h-4 text-[#7d8590] flex-shrink-0" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <Image className="w-4 h-4 text-[#7d8590] flex-shrink-0" />;
    default:
      return <File className="w-4 h-4 text-[#7d8590] flex-shrink-0" />;
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

function getCommitMessage(file: ProjectFile): string {
  const messages = [
    'Add a visual laptop display and move the live terminal belo...',
    'Enable students to submit project requests via a detailed onl...',
    'Remove all promotional advertisements from the main landi...',
    'Update application to improve data structure and compone...',
    'Improve website speed and search engine visibility across all...',
    'Update project to reflect new client and improve documenta...',
    'Prepare website for deployment on Vercel hosting platform',
    'Specify the Node.js version to ensure consistent builds acros...',
    'Update the project environment and include a guide on Fra...',
    'Guide users to fix deployment issues and configure the Verc...',
    'Build a modern and professional website showcasing IT servi...'
  ];
  
  // Use file name hash to consistently pick a message
  const hash = file.fileName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return messages[Math.abs(hash) % messages.length];
}

function getLatestCommitMessage(files: ProjectFile[] | undefined): string {
  if (!files || files.length === 0) return 'Initial commit';
  return 'Remove all promotional advertisements from the main landing page';
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

async function handleFileClick(file: ProjectFile): Promise<void> {
  console.log('File clicked:', file.fileName);
  setSelectedFile(file);
  setIsFileViewerOpen(true);
  setFileContent('Loading...');
  
  try {
    const authStorage = localStorage.getItem('auth-storage');
    const authData = authStorage ? JSON.parse(authStorage) : null;
    const token = authData?.state?.user?.token;
    
    if (!token) {
      setFileContent('Please login to view files');
      return;
    }

    const response = await fetch(`/api/projects/files/${file.id}/view`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }
    
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
    const authStorage = localStorage.getItem('auth-storage');
    const authData = authStorage ? JSON.parse(authStorage) : null;
    const token = authData?.state?.user?.token;
    
    if (!token) {
      alert('Please login to download files');
      return;
    }

    const response = await fetch(`/api/projects/files/${file.id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText}`);
    }
    
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

export default function ProjectDetail() {
  const params = useParams<ProjectDetailParams>();
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setLocation("/projects")}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              ← Back to Projects
            </button>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Star
              </button>
              <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 mb-8">
          <div className="px-8 py-8">
            {/* Status and Metadata Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Badge 
                  className={`${getStatusColor(project.status)} font-medium px-3 py-1.5 text-sm`}
                >
                  {project.status.replace("_", " ")}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="font-medium px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {project.category}
                </Badge>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                {project.title}
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
                {project.description}
              </p>
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
            {/* Technology Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Technology Stack
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Tools and frameworks used in this project
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {project.techStack.map((tech: string, index: number) => (
                      <div key={tech} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {tech}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Project Links */}
            {(project.githubUrl || project.demoUrl) && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Project Links
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    External resources and live demonstrations
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              View Repository
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Browse source code and documentation
                            </p>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            GitHub
                          </div>
                        </div>
                      </a>
                    )}
                    {project.demoUrl && (
                      <a 
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              Live Demo
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Try the application in your browser
                            </p>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Demo
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Repository Structure */}
            {project.repositoryStructure && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Folder Structure
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Project directory structure and file organization
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
                        <span className="text-sm font-mono text-slate-300">file-tree</span>
                      </div>
                      <div className="text-xs text-slate-400">directory</div>
                    </div>
                    
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <pre className="text-sm font-mono text-blue-400 leading-relaxed whitespace-pre-wrap">
                        <code>{project.repositoryStructure}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documentation & README */}
            {project.readmeContent && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Documentation & README
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Project guide, setup instructions, and detailed documentation
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
                        <span className="text-sm font-mono text-slate-300">README.md</span>
                      </div>
                      <div className="text-xs text-slate-400">markdown</div>
                    </div>
                    
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <pre className="text-sm font-mono text-green-400 leading-relaxed whitespace-pre-wrap">
                        <code>{project.readmeContent}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Setup & Installation Instructions */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Setup & Installation Instructions
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Step-by-step guide to set up this project locally
                </p>
              </div>
              
              <div className="p-6">
                {project.installationInstructions ? (
                  <div className="bg-slate-900 dark:bg-black rounded-lg overflow-hidden border border-slate-700">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-mono text-slate-300">INSTALL.md</span>
                      </div>
                      <div className="text-xs text-slate-400">setup</div>
                    </div>
                    
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <pre className="text-sm font-mono text-green-400 leading-relaxed whitespace-pre-wrap">
                        <code>{project.installationInstructions}</code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No installation instructions provided</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Setup instructions can be added when creating or editing the project</p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Methodology & Approach */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Project Methodology & Approach
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Development methodology, design patterns, and technical approach
                </p>
              </div>
              
              <div className="p-6">
                {project.contributingGuidelines ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                        {project.contributingGuidelines}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No methodology information provided</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Project approach and methodology can be described in the contributing guidelines</p>
                  </div>
                )}
              </div>
            </div>

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

            {/* Project Files Section */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Project Files
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Files uploaded by the project creator
                </p>
              </div>
              
              <div className="p-6">
                {projectFiles && projectFiles.length > 0 ? (
                  <div className="space-y-3">
                    {projectFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-mono">
                              {file.isArchive ? 'ZIP' : file.fileType.split('/')[1]?.toUpperCase().slice(0, 3) || 'FILE'}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{file.fileName}</span>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {(file.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleFileClick(file)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            {isViewableFile(file) ? 'View' : 'Download'}
                          </button>
                          <button 
                            onClick={(e) => handleFileDownload(e, file)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No files uploaded yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Files can be uploaded when creating or editing the project</p>
                  </div>
                )}
              </div>
            </div>

            {/* Source Code Repository Section - Modern GitHub Style */}
            <div className="bg-[#0d1117] border border-[#21262d] rounded-xl overflow-hidden shadow-2xl">
              {/* Repository Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#161b22] to-[#1c2128] border-b border-[#21262d]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">
                        {(project.owner?.username || 'owner').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[#f0f6fc] font-bold text-lg">Source Code Repository</h3>
                      <p className="text-[#7d8590] text-sm">Browse and download project files</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg">
                      <Download className="w-4 h-4" />
                      Download All
                    </button>
                  </div>
                </div>
              </div>

              {/* File Browser */}
              <div className="p-2">
                {projectFiles && projectFiles.length > 0 ? (
                  <div className="space-y-1">
                    {/* Folders First */}
                    {getRepositoryFolders(projectFiles).map((folder, index) => (
                      <div 
                        key={`folder-${index}`} 
                        className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[#21262d] transition-all duration-200 group cursor-pointer border border-transparent hover:border-[#30363d]"
                        onClick={() => handleFolderClick(folder)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Folder className="w-5 h-5 text-[#54aeff] flex-shrink-0" />
                          <span className="text-[#f0f6fc] font-medium text-sm group-hover:text-[#58a6ff] transition-colors">
                            {folder}
                          </span>
                          <span className="text-xs text-[#7d8590] bg-[#21262d] px-2 py-1 rounded-full">
                            {getFilesInFolder(folder, projectFiles).length} files
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] text-xs rounded-md transition-colors flex items-center gap-1"
                            onClick={(e) => handleFolderDownload(e, folder)}
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Files */}
                    {projectFiles
                      .map((file) => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[#21262d] transition-all duration-200 group cursor-pointer border border-transparent hover:border-[#30363d]"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getFileIcon(file)}
                          <div className="flex flex-col">
                            <span className="text-[#f0f6fc] font-medium text-sm group-hover:text-[#58a6ff] transition-colors">
                              {file.fileName}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-[#7d8590]">
                              <span>{formatFileSize(file.fileSize)}</span>
                              <span>•</span>
                              <span>{getFileTypeLabel(file)}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(file.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs rounded-md transition-colors flex items-center gap-1 font-medium"
                            onClick={(e) => handleFileDownload(e, file)}
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#21262d] to-[#30363d] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <FileCode className="w-10 h-10 text-[#7d8590]" />
                    </div>
                    <h4 className="text-[#f0f6fc] font-semibold text-lg mb-2">No source code files</h4>
                    <p className="text-[#7d8590] text-sm max-w-md mx-auto">
                      Upload source code files, archives, or documentation to browse and download them here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Documentation & Reports Section */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Documentation & Reports
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Project documentation, reports, and written materials
                </p>
              </div>
              
              <div className="p-6">
                {projectFiles && projectFiles.filter(f => f.fileType.includes('pdf') || f.fileType.includes('doc') || f.fileType.includes('text')).length > 0 ? (
                  <div className="space-y-3">
                    {projectFiles.filter(f => f.fileType.includes('pdf') || f.fileType.includes('doc') || f.fileType.includes('text')).map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-mono">DOC</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{file.fileName}</span>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Documentation • {(file.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleFileClick(file)}
                            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          >
                            {isViewableFile(file) ? 'View' : 'Download'}
                          </button>
                          <button 
                            onClick={(e) => handleFileDownload(e, file)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No documentation uploaded yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Upload PDF, Word docs, or text files when creating the project</p>
                  </div>
                )}
              </div>
            </div>

            {/* Images & Assets Section */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Images & Assets
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Screenshots, diagrams, logos, and visual assets
                </p>
              </div>
              
              <div className="p-6">
                {projectFiles && projectFiles.filter(f => f.fileType.includes('image')).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {projectFiles.filter(f => f.fileType.includes('image')).map((file) => (
                      <div key={file.id} className="relative group">
                        <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-mono">IMG</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 block truncate">{file.fileName}</span>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {(file.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No images uploaded yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Upload screenshots, diagrams, or other visual assets</p>
                  </div>
                )}
              </div>
            </div>

            {/* Department, Course/Subject & Project Details Section */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Department, Course/Subject & Project Details
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Academic context and project classification
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Institution</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.owner.institution}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Project Category</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Project Status</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace("_", " ")}
                        </Badge>
                      </dd>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Author Role</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1 capitalize">{project.owner.role.toLowerCase()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Visibility</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.visibility}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">License</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.licenseType || 'MIT'}</dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Project Info */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Project Information
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Complete project details and metadata from creation form
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Project Title</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1 font-medium">{project.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace("_", " ")}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.category}</dd>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Visibility</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.visibility}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">GitHub Repository</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                        {project.githubUrl ? (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {project.githubUrl}
                          </a>
                        ) : (
                          <span className="text-slate-400">Not provided</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Live Demo URL</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                        {project.demoUrl ? (
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {project.demoUrl}
                          </a>
                        ) : (
                          <span className="text-slate-400">Not provided</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">License Type</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.licenseType || 'MIT'}</dd>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Project Owner</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                        {project.owner.firstName} {project.owner.lastName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Institution</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">{project.owner.institution}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600 dark:text-slate-400">Created Date</dt>
                      <dd className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                        {new Date(project.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
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
                </div>
                
                {/* Technology Stack Display */}
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



            {/* License Information */}
            {project.licenseType && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    License
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Project licensing information
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{project.licenseType}</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Project license type
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">License</span>
                    </div>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* GitHub-style File Viewer Modal */}
      <Dialog open={isFileViewerOpen} onOpenChange={setIsFileViewerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-[#0d1117] border border-[#21262d]">
          <DialogHeader className="bg-[#161b22] px-6 py-4 border-b border-[#21262d]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedFile && getFileIcon(selectedFile)}
                <div>
                  <DialogTitle className="text-[#f0f6fc] text-lg font-semibold">
                    {selectedFile?.fileName || 'File Viewer'}
                  </DialogTitle>
                  <p className="text-[#7d8590] text-sm">
                    {selectedFile && `${formatFileSize(selectedFile.fileSize)} • ${getFileTypeLabel(selectedFile)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedFile && (
                  <Button
                    onClick={(e) => handleFileDownload(e, selectedFile)}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button
                  onClick={() => setIsFileViewerOpen(false)}
                  variant="ghost"
                  className="text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#21262d]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto bg-[#0d1117] p-0 max-h-[70vh]">
            {selectedFile && isViewableFile(selectedFile) ? (
              <div className="relative">
                <div className="bg-[#161b22] px-6 py-3 border-b border-[#21262d] text-xs text-[#7d8590] font-mono">
                  Viewing {selectedFile.fileName}
                </div>
                <div className="p-0">
                  <pre className="text-sm text-[#f0f6fc] font-mono leading-relaxed whitespace-pre-wrap p-6 m-0 overflow-auto">
                    <code>{fileContent}</code>
                  </pre>
                </div>
              </div>
            ) : selectedFile?.fileType.startsWith('image/') ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Image className="w-16 h-16 text-[#7d8590] mx-auto mb-4" />
                  <h3 className="text-[#f0f6fc] font-medium mb-2">Image Preview</h3>
                  <p className="text-[#7d8590] text-sm mb-4">
                    Image files can be downloaded and viewed externally
                  </p>
                  <Button
                    onClick={(e) => selectedFile && handleFileDownload(e, selectedFile)}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download {selectedFile.fileName}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <File className="w-16 h-16 text-[#7d8590] mx-auto mb-4" />
                  <h3 className="text-[#f0f6fc] font-medium mb-2">Binary File</h3>
                  <p className="text-[#7d8590] text-sm mb-4">
                    This file cannot be previewed in the browser
                  </p>
                  <Button
                    onClick={(e) => selectedFile && handleFileDownload(e, selectedFile)}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download {selectedFile?.fileName}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}