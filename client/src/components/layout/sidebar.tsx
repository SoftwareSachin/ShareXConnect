import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, 
  Folder, 
  Search, 
  ClipboardCheck, 
  BookOpen, 
  Users, 
  Star, 
  LogOut 
} from "lucide-react";
import { useState, useEffect } from "react";

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const [location] = useLocation();
  const [currentRole, setCurrentRole] = useState(user?.role || "student");

  useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role);
    }
  }, [user?.role]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home, roles: ["student", "faculty", "admin"] },
    { path: "/projects", label: "My Projects", icon: Folder, roles: ["student", "faculty", "admin"] },
    { path: "/discover", label: "Discover", icon: Search, roles: ["student", "faculty", "admin"] },
    { path: "/reviews", label: "Reviews", icon: ClipboardCheck, roles: ["faculty"] },
    { path: "/assignments", label: "Assignments", icon: BookOpen, roles: ["faculty"] },
    { path: "/users", label: "Manage Users", icon: Users, roles: ["admin"] },
    { path: "/starred", label: "Starred", icon: Star, roles: ["student", "faculty", "admin"] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentRole));

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">ShareX</h1>
        <p className="text-sm text-muted-foreground">Academic Platform</p>
      </div>
      
      {/* Role Switcher */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
        <Select value={currentRole} onValueChange={(value: string) => setCurrentRole(value as "student" | "faculty" | "admin")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="admin">College Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-blue-50 text-primary border border-blue-200" 
                        : "text-muted-foreground hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-white">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
