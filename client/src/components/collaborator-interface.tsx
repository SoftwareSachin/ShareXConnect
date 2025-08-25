import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { ProjectWithDetails, User, ProjectComment } from "@shared/schema";
import {
  Users, MessageSquare, FileText, GitBranch, Clock, Send, Edit3,
  Code2, Upload, Download, Share2, Bookmark, Star, CheckCircle,
  AlertCircle, Activity, Calendar, Tag, Hash, Plus, Search,
  Bell, Settings, Archive, Eye, Heart, ThumbsUp
} from 'lucide-react';

interface CollaboratorInterfaceProps {
  project: ProjectWithDetails;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const CollaboratorInterface: React.FC<CollaboratorInterfaceProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as const });
  const [showNewTask, setShowNewTask] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch project comments
  const { data: comments = [] } = useQuery<ProjectComment[]>({
    queryKey: ['/api/projects', project.id, 'comments'],
  });

  // Fetch collaborators
  const { data: collaborators = [] } = useQuery<User[]>({
    queryKey: ['/api/projects', project.id, 'collaborators'],
  });

  // Mock tasks for demo - in real app this would come from API
  const [tasks] = useState<TaskItem[]>([
    {
      id: '1',
      title: 'Update documentation',
      description: 'Review and update the README file with latest changes',
      status: 'todo',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Fix responsive design issues',
      description: 'Address mobile layout problems in the dashboard',
      status: 'in-progress',
      assignedTo: user?.id,
      priority: 'medium',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ]);

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest(`/api/projects/${project.id}/comments`, 'POST', { content }),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'comments'] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'todo': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Modern Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{project.title}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Collaboration Workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                <Users className="w-3 h-3 mr-1" />
                Collaborator
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="discussions" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discussion
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Files
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Project Overview</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{project.description}</p>
                    
                    {/* Tech Stack */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Technology Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button variant="outline" className="justify-start gap-2">
                        <GitBranch className="w-4 h-4" />
                        View Code
                      </Button>
                      <Button variant="outline" className="justify-start gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button variant="outline" className="justify-start gap-2">
                        <Star className="w-4 h-4" />
                        Star Project
                      </Button>
                      <Button variant="outline" className="justify-start gap-2">
                        <Bell className="w-4 h-4" />
                        Subscribe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Collaboration Tasks</h3>
                      <Button 
                        onClick={() => setShowNewTask(true)}
                        className="gap-2"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">{task.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className={getPriorityColor(task.priority)} variant="outline">
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.status)} variant="outline">
                              {task.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                          {task.assignedTo === user?.id && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                              Assigned to you
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discussions Tab */}
              <TabsContent value="discussions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Team Discussion</h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add Comment Form */}
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Share your thoughts, ask questions, or provide feedback..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-24"
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => addCommentMutation.mutate(newComment)}
                          disabled={!newComment.trim() || addCommentMutation.isPending}
                          className="gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Post Comment
                        </Button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {getInitials('A', 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-sm">
                                  Anonymous User
                                </span>
                                <span className="text-xs text-slate-500">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Project Files</h3>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="w-4 h-4" />
                        Upload File
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Archive className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No files yet</h4>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">Upload files to share with your team</p>
                      <Button className="gap-2">
                        <Upload className="w-4 h-4" />
                        Upload your first file
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Owner */}
            <Card>
              <CardHeader className="pb-4">
                <h3 className="font-semibold">Project Owner</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(project.owner.firstName, project.owner.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{project.owner.firstName} {project.owner.lastName}</p>
                    <p className="text-xs text-slate-500">{project.owner.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader className="pb-4">
                <h3 className="font-semibold">Team Members ({collaborators.length + 1})</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center gap-3">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(collaborator.firstName, collaborator.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{collaborator.firstName} {collaborator.lastName}</p>
                      <p className="text-xs text-slate-500">{collaborator.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader className="pb-4">
                <h3 className="font-semibold">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm">Project created</p>
                      <p className="text-xs text-slate-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm">New comment added</p>
                      <p className="text-xs text-slate-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorInterface;