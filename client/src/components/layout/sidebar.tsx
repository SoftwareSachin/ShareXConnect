import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/store/auth-store";
import { RoleBasedMenuItem, usePermissions } from "@/components/RoleProtectedComponent";
import { getRoleName } from "@shared/permissions";
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
  const { isStudent, isFaculty, isAdmin, isGuest } = usePermissions();
  const [location] = useLocation();

  const navItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard", 
      icon: Home, 
      permissions: ["canViewAllProjects"] as const,
      showForGuest: true 
    },
    { 
      path: "/projects", 
      label: "My Projects", 
      icon: Folder, 
      permissions: ["canCreateProject"] as const,
      roles: ["STUDENT"] 
    },
    { 
      path: "/discover", 
      label: "Discover Projects", 
      icon: Search, 
      permissions: ["canViewPublicProjects"] as const,
      showForGuest: true 
    },
    { 
      path: "/reviews", 
      label: "Faculty Reviews", 
      icon: ClipboardCheck, 
      permissions: ["canReceiveAssignments"] as const,
      roles: ["FACULTY"] 
    },
    { 
      path: "/assignments", 
      label: "Assignments", 
      icon: BookOpen, 
      permissions: ["canViewAssignedProjects"] as const,
      roles: ["FACULTY"] 
    },
    { 
      path: "/users", 
      label: "Manage Users", 
      icon: Users, 
      permissions: ["canManageUsers"] as const,
      roles: ["ADMIN"] 
    },
    { 
      path: "/starred", 
      label: "Starred Projects", 
      icon: Star, 
      permissions: ["canStarProjects"] as const,
      roles: ["STUDENT", "FACULTY", "ADMIN"] 
    },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">ShareX</h1>
        <p className="text-sm text-muted-foreground">Academic Platform</p>
      </div>
      
      {/* Role Display */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
          {user ? getRoleName(user.role as any) : 'Guest'}
        </div>
        {user && (
          <p className="text-xs text-muted-foreground mt-1">
            {user.institution}
          </p>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            // Check if item should be shown for guests
            if (isGuest && !item.showForGuest) {
              return null;
            }
            
            // For non-guests, check role-based permissions
            if (!isGuest && item.roles && !item.roles.includes(user?.role as any)) {
              return null;
            }
            
            return (
              <RoleBasedMenuItem
                key={item.path}
                permissions={item.permissions}
                role={item.roles}
              >
                <li>
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
              </RoleBasedMenuItem>
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
