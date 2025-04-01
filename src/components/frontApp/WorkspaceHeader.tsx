// src/components/frontApp/WorkspaceHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Box, ChevronDown, Menu, Plus, Home, Settings } from "lucide-react";
import { AuthButton } from "../AuthButton";
import { WorkspaceContext, AppSelector } from "./";
import { useAppStore } from "@/modules/store";
import { Avatar, AvatarFallback } from "./Avatr";


const WorkspaceHeader: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Get data and actions from the store
  const workspaces = useAppStore((state) => state.items);
  const currentWorkspaceId = useAppStore((state) => state.selected.workspace);
  const currentScenarioId = useAppStore((state) => state.selected.scenario);
  const selectWorkspace = useAppStore((state) => state.selectWorkspace);

  // Get current workspace and scenario objects
  const currentWorkspace =
    workspaces.find((w) => w.id === currentWorkspaceId) || null;
  const currentScenario =
    currentWorkspace?.children.find((s) => s.id === currentScenarioId) || null;

  // Get first letter of workspace name for avatar
  const getWorkspaceInitial = (name: string) => {
    return name?.charAt(0).toUpperCase() || "W";
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6">
        <div className="flex w-full sm:w-auto justify-between items-center">
          <div className="flex items-center gap-3">
            {currentWorkspace && (
              <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                <AvatarFallback className="text-sm font-medium">
                  {getWorkspaceInitial(currentWorkspace.title)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {currentWorkspace?.title || "Workspace"}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {currentScenario
                  ? `Scenario: ${currentScenario.name}`
                  : "No scenario selected"}
              </p>
            </div>
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

        <div
          className={`${
            mobileMenuOpen ? "flex" : "hidden"
          } sm:flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 mt-4 sm:mt-0`}
        >
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
                  className={`${
                    currentWorkspaceId === workspace.id ? "bg-accent" : ""
                  } cursor-pointer`}
                  onClick={() => {
                    selectWorkspace(workspace.id);
                    // Update URL if workspace has slug
                    if (workspace.slug) {
                      navigate(`/${workspace.slug}`);
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarFallback className="text-xs">
                      {getWorkspaceInitial(workspace.title)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{workspace.title}</span>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => navigate("/")}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => console.log("Create workspace")}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <AppSelector />
            <WorkspaceContext />
          </div>

          <AuthButton />
        </div>
      </div>
    </header>
  );
};

export default WorkspaceHeader;