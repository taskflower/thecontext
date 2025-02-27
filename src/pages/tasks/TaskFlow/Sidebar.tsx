import React from "react";
import { Home, CheckSquare, FileText, Settings, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TabName } from "./types";
import { useDataStore } from "./store";


interface SidebarProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
  toggleNewProjectModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  toggleNewProjectModal 
}) => {
  const { getTasksCountByStatus } = useDataStore();
  const pendingTasksCount =
    getTasksCountByStatus("todo") + getTasksCountByStatus("in-progress");

  return (
    <div className="w-64 bg-background border-r flex flex-col">
      <div className="h-16 border-b flex items-center px-6">
        <h1 className="text-xl font-bold">
          TaskFlow<span className="text-primary">AI</span>
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Button
          className="w-full mb-6"
          onClick={toggleNewProjectModal}
        >
          <Plus size={16} className="mr-2" />
          <span>New Project</span>
        </Button>

        <nav>
          <ul className="space-y-1">
            <li>
              <Button
                variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("dashboard")}
              >
                <Home size={16} className="mr-3" />
                <span>Dashboard</span>
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "tasks" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("tasks")}
              >
                <CheckSquare size={16} className="mr-3" />
                <span>Tasks</span>
                {pendingTasksCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {pendingTasksCount}
                  </Badge>
                )}
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "documents" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("documents")}
              >
                <FileText size={16} className="mr-3" />
                <span>Documents</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
              >
                <Settings size={16} className="mr-3" />
                <span>Settings</span>
              </Button>
            </li>
          </ul>
        </nav>
      </div>

      <Separator />
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            JD
          </div>
          <div>
            <div className="font-medium">John Doe</div>
            <div className="text-xs text-muted-foreground">Project Manager</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;