import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Star, 
  MessageCircle, 
  ExternalLink, 
  Github, 
  Users, 
  Folder, 
  File, 
  FileText, 
  FileCode, 
  Image, 
  Archive,
  Calendar,
  Eye,
  Shield,
  Zap,
  Code2,
  BookOpen,
  Settings,
  Globe,
  Lock,
  Building
} from "lucide-react";
import { Link } from "wouter";
import { apiGet } from "@/lib/api";
import type { ProjectWithDetails } from "@shared/schema";

interface ProjectDetailParams {
  id: string;
}

export default function ProjectDetail() {
  const params = useParams<ProjectDetailParams>();
  const [, setLocation] = useLocation();
  
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
    },
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-8 w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    console.log('❌ Project detail error:', error);
    console.log('📊 Project data:', project);
    console.log('🆔 Project ID from params:', params.id);
    
    // Check if it's an authentication error
    const isAuthError = error && error.message && (
      error.message.includes('Invalid or expired token') ||
      error.message.includes('Request failed') ||
      error.message.includes('403')
    );
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {isAuthError ? 'Authentication Required' : 'Project Not Found'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {isAuthError 
              ? 'Your session has expired. Please log in again to view this project.'
              : 'The project you\'re looking for doesn\'t exist or has been removed.'
            }
          </p>
          {error && (
            <p className="text-red-600 dark:text-red-400 mb-4 text-sm">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          )}
          <div className="space-x-4">
            {isAuthError ? (
              <>
                <Link href="/login">
                  <Button>Log In Again</Button>
                </Link>
                <Link href="/projects">
                  <Button variant="outline">Back to Projects</Button>
                </Link>
              </>
            ) : (
              <Link href="/projects">
                <Button>Back to Projects</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "DRAFT":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/projects")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Star className="w-4 h-4" />
                Star
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden mb-8">
          {/* Project Header */}
          <div className="px-8 py-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1 max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <Badge 
                    className={`${getStatusColor(project.status)} font-medium px-3 py-1`}
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                  <Badge variant="secondary" className="font-medium px-3 py-1">
                    {project.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    {project.visibility === 'PUBLIC' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {project.visibility}
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4 leading-tight">
                  {project.title}
                </h1>
                
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {project.description}
                </p>

                {/* Author & Metadata */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-slate-800">
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                        {getInitials(project.owner.firstName || '', project.owner.lastName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {project.owner.firstName} {project.owner.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <Building className="w-3 h-3" />
                        {project.owner.institution}
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-8 w-px bg-gray-200 dark:bg-slate-700"></div>
                  
                  <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Technology Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Technology Stack
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Tools and frameworks used in this project
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {project.techStack.map((tech: string, index: number) => (
                      <div key={tech} className="group relative">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {tech}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Links */}
            {(project.githubUrl || project.demoUrl) && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Project Links
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        External resources and live demos
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-4">
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-md bg-white dark:bg-slate-800/50"
                      >
                        <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Github className="w-6 h-6 text-white dark:text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            View Repository
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Browse source code and documentation
                          </p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </a>
                    )}
                    {project.demoUrl && (
                      <a 
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-md bg-white dark:bg-slate-800/50"
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            Live Demo
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Try the application in your browser
                          </p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* README Section */}
            {project.readmeContent && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        README.md
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Project documentation and setup instructions
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">README.md</span>
                        </div>
                        <FileText className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="p-6">
                        <pre className="text-sm text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          <code>{project.readmeContent}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Repository Structure */}
            {project.repositoryStructure && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Folder className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Repository Structure
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Project file organization and directory tree
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">File Structure</span>
                      </div>
                      <Folder className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="p-6">
                      <pre className="text-sm text-slate-700 dark:text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        <code>{project.repositoryStructure}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Installation Instructions */}
            {project.installationInstructions && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Installation Guide
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Step-by-step setup and installation instructions
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-300 ml-2">Terminal</span>
                      </div>
                      <Settings className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="p-6">
                      <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        <code>{project.installationInstructions}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Documentation */}
            {project.apiDocumentation && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        API Documentation
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Interface specifications and usage examples
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">API.md</span>
                      </div>
                      <FileCode className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="p-6">
                      <pre className="text-sm text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        <code>{project.apiDocumentation}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contributing Guidelines */}
            {project.contributingGuidelines && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Contributing Guidelines
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        How to contribute to this project and development workflow
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">CONTRIBUTING.md</span>
                      </div>
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="p-6">
                      <pre className="text-sm text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        <code>{project.contributingGuidelines}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}



            {/* File Explorer - GitHub-like file browser */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="text-slate-600">📁</span>
                  Project Files
                </h3>
                
                {/* File Tree Structure */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  {/* File Tree Header */}
                  <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Repository Structure</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">📄 15 files</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">📁 8 folders</span>
                      </div>
                    </div>
                  </div>

                  {/* File Browser */}
                  <div className="bg-white dark:bg-slate-900">
                    {/* Root Directory */}
                    <div className="hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 px-4 py-2">
                        <Folder className="w-4 h-4 text-blue-600" />
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">src/</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">Main source code</span>
                      </div>
                    </div>

                    {/* Files in src/ */}
                    <div className="ml-6">
                      <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                        <FileCode className="w-4 h-4 text-green-600" />
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">App.js</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">2.5 KB • React Component</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">index.js</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">1.2 KB • Entry point</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                        <FileCode className="w-4 h-4 text-purple-600" />
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">styles.css</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">4.1 KB • Stylesheets</span>
                      </div>
                    </div>

                    {/* Components Directory */}
                    <div className="hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 px-4 py-2">
                        <Folder className="w-4 h-4 text-blue-600" />
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">components/</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">React components</span>
                      </div>
                    </div>

                    {/* Assets Directory */}
                    <div className="hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 px-4 py-2">
                        <Folder className="w-4 h-4 text-blue-600" />
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">assets/</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">Images & media</span>
                      </div>
                    </div>

                    {/* Images in assets/ */}
                    <div className="ml-6">
                      <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                        <Image className="w-4 h-4 text-green-600" />
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">logo.png</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">150 KB • App logo</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                        <Image className="w-4 h-4 text-green-600" />
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">hero-image.jpg</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">2.1 MB • Hero banner</span>
                      </div>
                    </div>

                    {/* Documentation Files */}
                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-mono text-sm text-slate-900 dark:text-slate-100">package.json</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">1.8 KB • Dependencies</span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span className="font-mono text-sm text-slate-900 dark:text-slate-100">README.md</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">3.2 KB • Project docs</span>
                    </div>

                    {/* Archive Files */}
                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <Archive className="w-4 h-4 text-purple-600" />
                      <span className="font-mono text-sm text-slate-900 dark:text-slate-100">project-source.zip</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">12.5 MB • Complete source</span>
                    </div>
                  </div>
                </div>

                {/* File Type Filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <FileCode className="w-3 h-3 mr-1" />
                    Code (8)
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Image className="w-3 h-3 mr-1" />
                    Images (4)
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Docs (3)
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Archive className="w-3 h-3 mr-1" />
                    Archives (1)
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Code Preview Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="text-green-600">💻</span>
                  Code Preview
                </h3>
                
                {/* File Tabs */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-600">
                        <FileCode className="w-3 h-3 text-green-600" />
                        <span className="text-sm font-mono">App.js</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-pointer">
                        <FileCode className="w-3 h-3" />
                        <span className="text-sm font-mono">index.js</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Code Content */}
                  <div className="bg-slate-900 dark:bg-slate-950 p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-300">
                      <code>{`import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Project</h1>
        <p>
          This is a comprehensive academic project
          showcasing modern web development.
        </p>
      </header>
    </div>
  );
}

export default App;`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documentation Gallery */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">📚</span>
                  Documentation & Media
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Preview */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-mono">logo.png</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center h-32">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        LOGO
                      </div>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 border-b">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-mono">API-docs.md</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 h-32 overflow-y-auto">
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <div># API Documentation</div>
                        <div>## Authentication</div>
                        <div>POST /api/auth/login</div>
                        <div>## Projects</div>
                        <div>GET /api/projects</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Archive Explorer */}
                <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-mono">project-source.zip</span>
                      <Badge variant="secondary" className="ml-auto text-xs">12.5 MB</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900">
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                      <div>📁 src/</div>
                      <div className="ml-4">📄 App.js (2.5 KB)</div>
                      <div className="ml-4">📄 index.js (1.2 KB)</div>
                      <div className="ml-4">📄 styles.css (4.1 KB)</div>
                      <div>📁 assets/</div>
                      <div className="ml-4">🖼️ logo.png (150 KB)</div>
                      <div className="ml-4">🖼️ hero-image.jpg (2.1 MB)</div>
                      <div>📄 package.json (1.8 KB)</div>
                      <div>📄 README.md (3.2 KB)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="text-slate-600">ℹ️</span>
                  Project Info
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Visibility</span>
                    <Badge variant={project.visibility === 'PUBLIC' ? 'default' : 'secondary'} className="capitalize">
                      {project.visibility.toLowerCase()}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Category</span>
                    <Badge variant="outline">{project.category}</Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Created</p>
                    <p className="font-mono text-sm text-slate-900 dark:text-slate-100">
                      {new Date(project.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Last Updated</p>
                    <p className="font-mono text-sm text-slate-900 dark:text-slate-100">
                      {new Date(project.updatedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* License Info */}
            {project.licenseType && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <span className="text-yellow-600">📝</span>
                    License
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 text-sm font-bold">📄</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{project.licenseType}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Open source license</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="text-green-600">📊</span>
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Stars
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{project.starCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Collaborators
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{project.collaborators?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Comments
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{project.commentCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}