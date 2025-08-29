import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { RoleProtectedComponent } from "@/components/RoleProtectedComponent";

interface HeaderProps {
  title: string;
  description: string;
  onCreateProject?: () => void;
  onSearch?: (query: string) => void;
  showCreateButton?: boolean;
  showSearch?: boolean;
}

export function Header({ 
  title, 
  description, 
  onCreateProject, 
  onSearch, 
  showCreateButton = true,
  showSearch = true 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          {showSearch && (
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            </form>
          )}
          {showCreateButton && onCreateProject && (
            <RoleProtectedComponent permissions={['canCreateProject']}>
              <Button onClick={onCreateProject} className="font-medium">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </RoleProtectedComponent>
          )}
        </div>
      </div>
    </header>
  );
}
