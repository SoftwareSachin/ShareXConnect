import { useState } from "react";
import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import SearchDialog from "@/components/ui/search-dialog";
import NotificationsPopover from "@/components/ui/notifications-popover";
import HelpPopover from "@/components/ui/help-popover";
import ProfileDropdown from "@/components/ui/profile-dropdown";

// Microsoft logo SVG
const MicrosoftLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10" fill="#F25022"/>
    <rect x="12" width="10" height="10" fill="#00A4EF"/>
    <rect y="12" width="10" height="10" fill="#FFB900"/>
    <rect x="12" y="12" width="10" height="10" fill="#7FBA00"/>
  </svg>
);

export default function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-white border-b border-fluent-neutral-30 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <MicrosoftLogo />
            <span className="text-lg font-semibold text-fluent-neutral-100">Azure</span>
          </div>
          <div className="h-6 w-px bg-fluent-neutral-40"></div>
          <h1 className="text-lg font-medium text-fluent-neutral-90">Network Hub Management</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fluent-neutral-60" />
            <Input 
              placeholder="Search resources..." 
              className="pl-10 w-64 bg-fluent-neutral-10 border-fluent-neutral-30 text-fluent-neutral-90 cursor-pointer"
              onClick={() => setSearchOpen(true)}
              readOnly
            />
          </div>
          
          <NotificationsPopover>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-fluent-neutral-20">
              <Bell className="h-4 w-4 text-fluent-neutral-60" />
            </Button>
          </NotificationsPopover>
          
          <HelpPopover>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-fluent-neutral-20">
              <HelpCircle className="h-4 w-4 text-fluent-neutral-60" />
            </Button>
          </HelpPopover>
          
          <ProfileDropdown>
            <div className="flex items-center space-x-2 bg-fluent-neutral-20 rounded-md px-3 py-1 cursor-pointer hover:bg-fluent-neutral-30 transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-azure-blue text-white text-sm font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-fluent-neutral-90">John Doe</span>
            </div>
          </ProfileDropdown>
        </div>
      </div>
      
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
