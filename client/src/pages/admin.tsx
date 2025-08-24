import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePermissions, RoleProtectedComponent } from '@/components/RoleProtectedComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserMinus, Building2, Shield, GraduationCap, Mail, Calendar, UserCheck } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { useToast } from '@/hooks/use-toast';

interface CollegeUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  institution: string;
  collegeDomain: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const { user, canAccess } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('faculty');

  // Fetch college users with enhanced error handling
  const { data: facultyResponse, isLoading: facultyLoading, error: facultyError } = useQuery({
    queryKey: ['/api/admin/faculty'],
    enabled: canAccess('canManageFaculty'),
    retry: (failureCount, error: any) => {
      // Don't retry on authentication or permission errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    }
  });

  const { data: studentResponse, isLoading: studentsLoading, error: studentError } = useQuery({
    queryKey: ['/api/admin/students'],
    enabled: canAccess('canManageStudents'),
    retry: (failureCount, error: any) => {
      // Don't retry on authentication or permission errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Extract data from enhanced responses
  const facultyUsers = facultyResponse?.success ? facultyResponse.data : [];
  const studentUsers = studentResponse?.success ? studentResponse.data : [];

  // Enhanced mutations for managing users with detailed error handling
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Enhanced error handling with specific error codes
        throw new Error(data.message || 'Failed to remove user');
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faculty'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      toast({
        title: 'User Removed',
        description: data.message || 'User removed successfully',
      });
    },
    onError: (error: any) => {
      console.error('Remove user error:', error);
      toast({
        title: 'Failed to Remove User',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Enhanced error handling with validation details
        if (data.code === 'INVALID_ROLE' && data.validRoles) {
          throw new Error(`Invalid role. Valid roles are: ${data.validRoles.join(', ')}`);
        }
        throw new Error(data.message || 'Failed to update user role');
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faculty'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      toast({
        title: 'Role Updated',
        description: data.message || 'User role updated successfully',
      });
    },
    onError: (error: any) => {
      console.error('Update role error:', error);
      toast({
        title: 'Failed to Update Role',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleRemoveUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to remove ${userName}? This action cannot be undone.`)) {
      removeUserMutation.mutate(userId);
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserRoleMutation.mutate({ userId, newRole });
  };

  const UserCard = ({ user: userItem, type }: { user: CollegeUser; type: 'faculty' | 'student' }) => (
    <Card className="mb-4 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-r from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              {type === 'faculty' ? (
                <GraduationCap className="w-7 h-7 text-white" />
              ) : (
                <Users className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                {userItem.firstName} {userItem.lastName}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{userItem.email}</span>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <Badge 
                  variant={userItem.role === 'FACULTY' ? 'default' : userItem.role === 'STUDENT' ? 'secondary' : 'outline'}
                  className="px-3 py-1 text-xs font-medium"
                >
                  {userItem.role}
                </Badge>
                {userItem.isVerified ? (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400 px-3 py-1">
                    <UserCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400 px-3 py-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Joined {new Date(userItem.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={userItem.role}
              onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={updateUserRoleMutation.isPending}
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
              <option value="GUEST">Guest</option>
            </select>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveUser(userItem.id, `${userItem.firstName} ${userItem.lastName}`)}
              disabled={removeUserMutation.isPending}
              className="px-4 py-2 rounded-xl hover:scale-105 transition-all duration-200 shadow-md"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!canAccess('canManageUsers')) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-80">
          <Header />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                You don't have permission to access the admin panel.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-auto bg-gradient-to-br from-slate-50/30 to-blue-50/20 dark:from-slate-900/30 dark:to-blue-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">College Administration</h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Manage faculty and students in your institution
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards with Error Handling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Total Faculty</CardTitle>
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                    {facultyLoading ? '...' : facultyUsers.length}
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    {facultyError ? 'Error loading data' : 'Active faculty members'}
                  </p>
                  {facultyResponse?.institution && (
                    <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg">
                      Institution: {facultyResponse.institution}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Students</CardTitle>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {studentsLoading ? '...' : studentUsers.length}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {studentError ? 'Error loading data' : 'Registered students'}
                  </p>
                  {studentResponse?.institution && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                      Institution: {studentResponse.institution}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Your College</CardTitle>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800/50 rounded-xl flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-purple-900 dark:text-purple-100 truncate">{user?.institution}</div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Domain: {user?.collegeDomain || 'Not configured'}
                  </p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-2 px-2 py-1 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                    Role: College Administrator
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Management Tabs */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</CardTitle>
                    <CardDescription className="text-base text-slate-600 dark:text-slate-400 mt-1">
                      Manage faculty and students in your college
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <TabsTrigger value="faculty" className="rounded-lg py-3 px-6 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Faculty Members
                    </TabsTrigger>
                    <TabsTrigger value="students" className="rounded-lg py-3 px-6 font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200">
                      <Users className="w-4 h-4 mr-2" />
                      Students
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="faculty" className="mt-6">
                    <div className="space-y-4">
                      {facultyLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-muted-foreground">Loading faculty...</p>
                        </div>
                      ) : facultyUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Faculty Members</h3>
                          <p className="text-muted-foreground">
                            No faculty members found in your college.
                          </p>
                        </div>
                      ) : (
                        facultyUsers.map((faculty: CollegeUser) => (
                          <UserCard key={faculty.id} user={faculty} type="faculty" />
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="students" className="mt-6">
                    <div className="space-y-4">
                      {studentsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-muted-foreground">Loading students...</p>
                        </div>
                      ) : studentUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Students</h3>
                          <p className="text-muted-foreground">
                            No students found in your college.
                          </p>
                        </div>
                      ) : (
                        studentUsers.map((student: CollegeUser) => (
                          <UserCard key={student.id} user={student} type="student" />
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Professional Footer Branding */}
        <div className="relative py-8 mt-12">
          <div className="max-w-7xl mx-auto px-8">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/10">
              <div className="p-8 text-center space-y-2">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  © 2025 ShareXConnect. All rights reserved.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Designed and developed by{" "}
                  <a 
                    href="https://aptivonsolin.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline-offset-2 hover:underline"
                  >
                    Aptivon Solution
                  </a>
                  <span className="italic text-slate-400 dark:text-slate-500 ml-1">
                    (Building Trust...)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}