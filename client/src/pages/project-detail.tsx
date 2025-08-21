import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    }
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

            {/* Installation Instructions */}
            {project.installationInstructions && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Installation Instructions
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Step-by-step setup and installation guide
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
                        <span className="text-sm font-mono text-slate-300">INSTALL.md</span>
                      </div>
                      <div className="text-xs text-slate-400">guide</div>
                    </div>
                    
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <pre className="text-sm font-mono text-yellow-400 leading-relaxed whitespace-pre-wrap">
                        <code>{project.installationInstructions}</code>
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

            {/* Media Gallery */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Media & Screenshots
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Project images, screenshots, and visual assets
                </p>
              </div>
              
              <div className="p-6">
                {/* Demo Images Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Sample screenshot placeholders - these would be actual uploaded images */}
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-mono">IMG</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Application Screenshot</p>
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-mono">PIC</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Feature Demo</p>
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-mono">MOB</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Mobile View</p>
                    </div>
                  </div>
                </div>
                
                {/* File Upload Info */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Uploaded Files</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs">IMG</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">project-screenshot-1.png</span>
                          <p className="text-xs text-slate-600 dark:text-slate-400">1.2 MB • Uploaded during creation</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors">
                        View
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs">DOC</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">project-documentation.pdf</span>
                          <p className="text-xs text-slate-600 dark:text-slate-400">2.5 MB • Documentation file</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors">
                        Download
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs">VID</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">demo-video.mp4</span>
                          <p className="text-xs text-slate-600 dark:text-slate-400">15.3 MB • Project demonstration</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors">
                        Play
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Files */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Project Files
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Source code and project assets
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-mono">ZIP</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">project-source.zip</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Complete source code archive</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* License */}
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
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">MIT License</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Free and open source software license
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Open Source</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Statistics
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Project engagement and activity metrics
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Stars</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Forks</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Views</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Downloads</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Code Preview
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Sample code from the project
                </p>
              </div>
              
              <div className="p-6">
                <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-mono text-slate-300">main.js</span>
                    </div>
                    <div className="text-xs text-slate-400">javascript</div>
                  </div>
                  
                  <div className="p-6">
                    <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                      <code>{`// Sample code preview
function initializeApp() {
  console.log('Application starting...');
  
  const config = {
    version: '1.0.0',
    environment: 'production'
  };
  
  return config;
}

export default initializeApp;`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
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
    </div>
  );
}