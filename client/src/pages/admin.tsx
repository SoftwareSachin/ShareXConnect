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

  // Fetch college users
  const { data: facultyUsers = [], isLoading: facultyLoading } = useQuery({
    queryKey: ['/api/admin/faculty'],
    enabled: canAccess('canManageFaculty'),
  });

  const { data: studentUsers = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/admin/students'],
    enabled: canAccess('canManageStudents'),
  });

  // Mutations for managing users
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to remove user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faculty'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      toast({
        title: 'Success',
        description: 'User removed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
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
      if (!response.ok) throw new Error('Failed to update user role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faculty'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/students'] });
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
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
        <div className="flex-1 flex flex-col">
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{facultyUsers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active faculty members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studentUsers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered students
                  </p>
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
                    College domain: {user?.collegeDomain || 'Not set'}
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
      </div>
    </div>
  );
}