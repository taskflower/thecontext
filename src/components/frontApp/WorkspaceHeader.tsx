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
import { Box, ChevronDown, Menu } from "lucide-react";
import { WorkspaceHeaderProps } from "./types";
import { AuthButton } from "../AuthButton";
import { WorkspaceContext } from "./";

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ 
  currentWorkspace, 
  currentScenario, 
  workspaces, 
  selectWorkspace 
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="border-b bg-background">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6">
        <div className="flex w-full sm:w-auto justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {currentWorkspace?.title || "Workspace"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {currentScenario
                ? `Scenariusz: ${currentScenario.name}`
                : "Jeszcze nie wybrano scenariusza"}
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="sm:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 mt-4 sm:mt-0`}>
          {/* Workspace Selection Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border shadow-sm w-full sm:w-auto justify-between"
                id="workspace-selector"
              >
                <Box className="h-4 w-4" />
                <span className="truncate max-w-[150px]">
                  {currentWorkspace?.title || "Select workspace"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
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
                    setMobileMenuOpen(false);
                  }}
                >
                  <Box className="h-4 w-4 mr-2" />
                  {workspace.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {/* Replacing the Button with our WorkspaceContext component */}
            <WorkspaceContext workspace={currentWorkspace} />
          </div>

          <AuthButton />
        </div>
      </div>
    </header>
  );
};

export default WorkspaceHeader;