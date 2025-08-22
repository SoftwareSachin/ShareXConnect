import { User, Settings, LogOut, Building, CreditCard, Shield, Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileDropdownProps {
  children: React.ReactNode;
}

const userProfile = {
  name: "John Doe",
  email: "john.doe@company.com",
  role: "Network Administrator",
  organization: "Contoso Ltd",
  subscription: "Production",
  initials: "JD"
};

export default function ProfileDropdown({ children }: ProfileDropdownProps) {
  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'profile':
        console.log('Navigate to profile');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'billing':
        console.log('Navigate to billing');
        break;
      case 'security':
        console.log('Navigate to security');
        break;
      case 'notifications':
        console.log('Navigate to notification settings');
        break;
      case 'organization':
        console.log('Navigate to organization settings');
        break;
      case 'logout':
        console.log('Logout user');
        break;
      default:
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-azure-blue text-white text-lg font-medium">
                {userProfile.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{userProfile.name}</h3>
              <p className="text-sm text-gray-600 truncate">{userProfile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {userProfile.role}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {userProfile.subscription}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2">
          <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Account
          </DropdownMenuLabel>
          
          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-3 p-3"
            onClick={() => handleMenuAction('profile')}
          >
            <User className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium text-sm">My Profile</div>
              <div className="text-xs text-gray-500">View and edit your profile</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-3 p-3"
            onClick={() => handleMenuAction('settings')}
          >
            <Settings className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium text-sm">Settings</div>
              <div className="text-xs text-gray-500">Manage your preferences</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-3 p-3"
            onClick={() => handleMenuAction('notifications')}
          >
            <Bell className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium text-sm">Notifications</div>
              <div className="text-xs text-gray-500">Configure notification settings</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Organization
          </DropdownMenuLabel>

          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-3 p-3"
            onClick={() => handleMenuAction('organization')}
          >
            <Building className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium text-sm">{userProfile.organization}</div>
              <div className="text-xs text-gray-500">Organization settings</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-3 p-3"
            onClick={() => handleMenuAction('billing')}
          >
            <CreditCard className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium text-sm">Billing & Usage</div>
              <div className="text-xs text-gray-500">Manage subscription and costs</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-3 p-3"
            onClick={() => handleMenuAction('security')}
          >
            <Shield className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium text-sm">Security</div>
              <div className="text-xs text-gray-500">Access and security settings</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-3 p-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleMenuAction('logout')}
          >
            <LogOut className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium text-sm">Sign Out</div>
              <div className="text-xs text-red-500">Sign out of your account</div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}