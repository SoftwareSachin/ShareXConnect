import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";
import { getRoleName } from "@shared/permissions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EditProfileModal } from "@/components/modals/edit-profile-modal";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Search, 
  FileCheck, 
  Users, 
  Star,
  GraduationCap,
  BookOpen,
  LogOut,
  Edit3 
} from "lucide-react";

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const [location] = useLocation();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", showForGuest: true, icon: LayoutDashboard },
    { path: "/projects", label: "My Projects", roles: ["STUDENT"], icon: FolderOpen },
    { path: "/discover", label: "Discover Projects", showForGuest: true, icon: Search },
    { path: "/reviews", label: "Review Assignments", roles: ["FACULTY"], icon: FileCheck },
    { path: "/users", label: "Manage Users", roles: ["ADMIN"], icon: Users },
    { path: "/starred", label: "Starred Projects", roles: ["STUDENT", "FACULTY"], icon: Star },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  const isGuest = !user;

  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col z-40 shadow-2xl">
      {/* Modern Header */}
      <div className="p-8 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-7 h-7 text-white dark:text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">ShareXConnect</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium tracking-wide">Academic Platform</p>
          </div>
        </div>
      </div>
      
      {/* Modern Role Display */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Your Role</label>
          <div className="w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-700/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-sm">
            {user ? getRoleName(user.role as any) : 'Guest'}
          </div>
          {user && (
            <p className="text-xs text-slate-600 dark:text-slate-400 px-1 font-medium">
              {user.institution}
            </p>
          )}
        </div>
      </div>

      {/* Modern Navigation Menu */}
      <nav className="flex-1 p-6">
        <div className="space-y-1">
          {navItems.map((item) => {
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
              <Link
                key={item.path}
                href={item.path}
                className={`
                  block w-full px-4 py-3.5 rounded-xl text-left transition-all duration-300 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:scale-[1.02]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive 
                      ? 'bg-white/20 shadow-inner' 
                      : 'bg-slate-200/60 dark:bg-slate-700/60 group-hover:bg-slate-300/60 dark:group-hover:bg-slate-600/60'
                    }
                  `}>
                    <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                  </div>
                  <span className={`font-semibold text-sm transition-all duration-300 ${isActive ? 'text-white' : 'group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Modern User Profile Section */}
      {user && (
        <div className="p-6 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/30 to-white/30 dark:from-slate-800/30 dark:to-slate-900/30">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100/70 dark:from-slate-800 dark:to-slate-700/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-300">
            <Avatar className="w-11 h-11 shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-inner">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditProfile(true)}
                className="w-9 h-9 p-0 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 hover:scale-105"
                data-testid="button-edit-profile"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-9 h-9 p-0 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Edit Modal */}
      <EditProfileModal 
        open={showEditProfile} 
        onOpenChange={setShowEditProfile} 
      />
    </div>
  );
}