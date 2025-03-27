// src/components/frontApp/WorkspaceHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Box, ChevronDown, Database } from "lucide-react";
import { WorkspaceHeaderProps } from "./types";


const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ 
  currentWorkspace, 
  currentScenario, 
  workspaces, 
  selectWorkspace 
}) => {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {currentWorkspace?.title || "Workspace"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {currentScenario
              ? `Scenariusz: ${currentScenario.name}`
              : "Jeszcze nie wybrano scenariusza"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Workspace Selection Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border shadow-sm"
                id="workspace-selector"
              >
                <Box className="h-4 w-4" />
                <span>Workspace:</span>
                {currentWorkspace?.title || "Select workspace"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  className={
                    currentWorkspace?.id === workspace.id ? "bg-accent" : ""
                  }
                  onClick={() => {
                    selectWorkspace(workspace.id);
                    // Update URL if workspace has slug
                    if (workspace.slug) {
                      navigate(`/${workspace.slug}`);
                    }
                  }}
                >
                  <Box className="h-4 w-4 mr-2" />
                  {workspace.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 shadow-sm"
              title="Open Workspace Context"
            >
              <Database className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WorkspaceHeader;