import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/store/auth-store";
import { getRoleName } from "@shared/permissions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Search, 
  FileCheck, 
  Users, 
  Star,
  GraduationCap,
  BookOpen,
  LogOut 
} from "lucide-react";

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", showForGuest: true, icon: LayoutDashboard },
    { path: "/projects", label: "My Projects", roles: ["STUDENT"], icon: FolderOpen },
    { path: "/discover", label: "Discover Projects", showForGuest: true, icon: Search },
    { path: "/reviews", label: "Review Assignments", roles: ["FACULTY"], icon: FileCheck },
    { path: "/users", label: "Manage Users", roles: ["ADMIN"], icon: Users },
    { path: "/starred", label: "Starred Projects", roles: ["STUDENT", "FACULTY", "ADMIN"], icon: Star },
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
    <div className="fixed inset-y-0 left-0 w-80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col z-40">
      {/* Modern Header */}
      <div className="p-8 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white dark:text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">ShareX</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Academic Platform</p>
          </div>
        </div>
      </div>
      
      {/* Modern Role Display */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Your Role</label>
          <div className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100">
            {user ? getRoleName(user.role as any) : 'Guest'}
          </div>
          {user && (
            <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
              {user.institution}
            </p>
          )}
        </div>
      </div>

      {/* Modern Navigation Menu */}
      <nav className="flex-1 p-6">
        <div className="space-y-2">
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
                  block w-full px-4 py-3 rounded-xl text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${isActive 
                      ? 'bg-white/20 dark:bg-slate-900/20' 
                      : 'bg-slate-200/50 dark:bg-slate-700/50'
                    }
                  `}>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'}`} />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Modern User Profile Section */}
      {user && (
        <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 p-4 bg-slate-50/70 dark:bg-slate-800/70 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-8 h-8 p-0 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}