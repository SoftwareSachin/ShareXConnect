import { HelpCircle, Book, MessageSquare, FileText, ExternalLink, Video } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface HelpPopoverProps {
  children: React.ReactNode;
}

const helpResources = [
  {
    title: "Azure Network Documentation",
    description: "Comprehensive guide to Azure networking concepts",
    icon: Book,
    url: "https://docs.microsoft.com/en-us/azure/virtual-network/",
    external: true
  },
  {
    title: "Hub-Spoke Architecture Guide",
    description: "Best practices for hub-spoke network topology",
    icon: FileText,
    url: "https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/hub-spoke",
    external: true
  },
  {
    title: "Security Best Practices",
    description: "Network security guidelines and recommendations",
    icon: FileText,
    url: "https://docs.microsoft.com/en-us/azure/security/fundamentals/network-best-practices",
    external: true
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides for network management",
    icon: Video,
    url: "#",
    external: false
  }
];

const quickActions = [
  {
    title: "Contact Support",
    description: "Get help from Azure support team",
    icon: MessageSquare,
    action: () => window.open("https://azure.microsoft.com/support/", "_blank")
  },
  {
    title: "Feature Request",
    description: "Suggest new features or improvements",
    icon: MessageSquare,
    action: () => window.open("https://feedback.azure.com/", "_blank")
  }
];

export default function HelpPopover({ children }: HelpPopoverProps) {
  const handleResourceClick = (resource: typeof helpResources[0]) => {
    if (resource.external) {
      window.open(resource.url, "_blank");
    } else {
      // Handle internal navigation
      console.log("Navigate to:", resource.url);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Help & Support
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Documentation</h4>
            <div className="space-y-2">
              {helpResources.map((resource, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-gray-50"
                  onClick={() => handleResourceClick(resource)}
                >
                  <div className="flex items-start gap-3">
                    <resource.icon className="w-4 h-4 text-azure-blue mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {resource.title}
                        </span>
                        {resource.external && (
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Support</h4>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-gray-50"
                  onClick={action.action}
                >
                  <div className="flex items-start gap-3">
                    <action.icon className="w-4 h-4 text-azure-blue mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900 text-sm">
                        {action.title}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />
        
        <div className="p-3">
          <div className="text-xs text-gray-500 text-center">
            Version 1.0.0 • Last updated: Dec 2024
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}