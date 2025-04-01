// src/components/frontApp/WorkspaceHeader.tsx
import React from "react";

import { Button } from "@/components/ui/button";

import { Menu } from "lucide-react";
import { AuthButton } from "../AuthButton";
import { WorkspaceContext } from "./";
import { useAppStore } from "@/modules/store";
import { Avatar, AvatarFallback } from "./Avatr";

const WorkspaceHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Get data and actions from the store
  const workspaces = useAppStore((state) => state.items);
  const currentWorkspaceId = useAppStore((state) => state.selected.workspace);
  const currentScenarioId = useAppStore((state) => state.selected.scenario);

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

        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <AuthButton />
          <WorkspaceContext />c
        </div>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
