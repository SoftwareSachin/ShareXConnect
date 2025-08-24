import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePermissions, RoleProtectedComponent } from '@/components/RoleProtectedComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, UserMinus, Building2, Settings, Shield } from 'lucide-react';
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
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{userItem.firstName} {userItem.lastName}</h3>
              <p className="text-sm text-muted-foreground">{userItem.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={userItem.isVerified ? 'default' : 'secondary'}>
                  {userItem.role}
                </Badge>
                {userItem.isVerified && (
                  <Badge variant="outline" className="text-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={userItem.role}
              onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
              className="px-2 py-1 border rounded text-sm"
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
            >
              <UserMinus className="w-4 h-4" />
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
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">College Administration</h1>
              <p className="text-muted-foreground">
                Manage faculty and students in your college
              </p>
            </div>

            {/* Enhanced Stats Cards with Error Handling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {facultyLoading ? '...' : facultyUsers.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {facultyError ? 'Error loading data' : 'Active faculty members'}
                  </p>
                  {facultyResponse?.institution && (
                    <p className="text-xs text-green-600 mt-1">
                      Institution: {facultyResponse.institution}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {studentsLoading ? '...' : studentUsers.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {studentError ? 'Error loading data' : 'Registered students'}
                  </p>
                  {studentResponse?.institution && (
                    <p className="text-xs text-green-600 mt-1">
                      Institution: {studentResponse.institution}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Your College</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{user?.institution}</div>
                  <p className="text-xs text-muted-foreground">
                    Domain: {user?.collegeDomain || 'Not configured'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Role: College Administrator
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Management Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage faculty and students in your college
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="faculty">Faculty Members</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
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