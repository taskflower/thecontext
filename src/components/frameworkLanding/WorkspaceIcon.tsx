import { WorkspaceStorageItem } from "@/services/WorkspaceService";
import { BarChart, Code, Database, Layers, Package } from "lucide-react";

interface WorkspaceIconProps {
  workspace: WorkspaceStorageItem;
  onClick: () => void;
}

// Workspace types with vibrant, highly visible colors
const WORKSPACE_TYPES = {
  CODE: {
    icon: Code,
    bgClass: "bg-blue-500",
    iconColor: "text-white"
  },
  DATA: {
    icon: Database,
    bgClass: "bg-emerald-500",
    iconColor: "text-white"
  },
  ANALYSIS: {
    icon: BarChart,
    bgClass: "bg-amber-500",
    iconColor: "text-white"
  },
  SYSTEM: {
    icon: Layers,
    bgClass: "bg-purple-500",
    iconColor: "text-white"
  },
  DEFAULT: {
    icon: Package,
    bgClass: "bg-slate-500", 
    iconColor: "text-white"
  }
};

const WorkspaceIcon: React.FC<WorkspaceIconProps> = ({ workspace, onClick }) => {
  // Determine workspace type based on title or metadata
  const getWorkspaceType = (workspace: WorkspaceStorageItem) => {
    const title = workspace.title.toLowerCase();
    
    if (title.includes("code") || title.includes("dev") || title.includes("script")) {
      return WORKSPACE_TYPES.CODE;
    } else if (title.includes("data") || title.includes("db") || title.includes("storage")) {
      return WORKSPACE_TYPES.DATA;
    } else if (title.includes("analysis") || title.includes("chart") || title.includes("report")) {
      return WORKSPACE_TYPES.ANALYSIS;
    } else if (title.includes("system") || title.includes("config") || title.includes("setup")) {
      return WORKSPACE_TYPES.SYSTEM;
    } else {
      return WORKSPACE_TYPES.DEFAULT;
    }
  };

  const workspaceType = getWorkspaceType(workspace);
  const IconComponent = workspaceType.icon;
  
  return (
    <div 
      className="flex flex-col items-center cursor-pointer"
      onClick={onClick}
    >
      <div 
        className={`${workspaceType.bgClass} w-full aspect-square rounded-md border-0 flex items-center justify-center ${workspaceType.iconColor} transition-all shadow-md hover:shadow-xl hover:translate-y-[-1px]`}
        aria-label={`${workspace.title} workspace`}
      >
        <IconComponent size={24} strokeWidth={2} />
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium truncate max-w-full">
          {workspace.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Open
        </p>
      </div>
    </div>
  );
};

export default WorkspaceIcon;