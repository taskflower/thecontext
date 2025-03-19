import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FlowPlayer } from "@/modules/flowPlayer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/modules/store";
import {
  Play,
  CheckCircle,
  Clock,
  ArrowRight,
  Github,
  Twitter,
  FilterIcon,
  Box,
  FileCode,
  Database,
  Plus,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { FilterEditor } from "@/modules/filters/FilterEditor";
import { FilterStatus } from "@/modules/filters/FilterStatus";

const WorkspacePage = () => {
  const [flowPlayerOpen, setFlowPlayerOpen] = useState(false);
  const [editingFilters, setEditingFilters] = useState(null);

  const { slug } = useParams();
  const {
    items: workspaces,
    selectWorkspace,
    getCurrentScenario,
    checkScenarioFilterMatch,
    getScenariosWithFilterStatus,
  } = useAppStore();
  const navigate = useNavigate();

  // Force component to update when state changes
  useAppStore((state) => state.stateVersion);

  // Find workspace by slug and select it
  useEffect(() => {
    if (slug) {
      const workspace = workspaces.find((w) => w.slug === slug);
      if (workspace) {
        selectWorkspace(workspace.id);
      }
    }
  }, [slug, workspaces, selectWorkspace]);

  // Get current workspace from slug
  const currentWorkspace = React.useMemo(() => {
    return workspaces.find((w) => w.slug === slug);
  }, [workspaces, slug]);

  // Get current scenario
  const currentScenario = getCurrentScenario();

  // Get all scenarios with filter match status
  const scenariosWithStatus = React.useMemo(() => {
    return getScenariosWithFilterStatus();
  }, [
    getScenariosWithFilterStatus,
    useAppStore((state) => state.stateVersion),
  ]);

  // Get only scenarios that have defined filters
  const filteredScenarios = React.useMemo(() => {
    return scenariosWithStatus.filter((scenario) => {
      // Check if scenario has defined filters
      return (
        scenario.hasFilters === true ||
        (scenario.filters && scenario.filters.length > 0)
      );
    });
  }, [scenariosWithStatus]);

  // Check if scenario active (matches filters)
  const isScenarioActive = (scenarioId) => {
    const contextItems = currentWorkspace?.contextItems || [];
    return checkScenarioFilterMatch(scenarioId, contextItems);
  };

  const openFlowPlayer = () => {
    setFlowPlayerOpen(true);
  };

  // Filter management functions
  const handleFilterClick = (e: React.MouseEvent, scenarioId) => {
    e.stopPropagation();
    setEditingFilters(scenarioId);
  };

  // Format time ago function
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp || now);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `about ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {currentWorkspace?.title === "Wise ads"
                ? "Wise ads"
                : currentWorkspace?.title || "Workspace"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentScenario
                ? `Current scenario: ${currentScenario.name}`
                : "No scenario selected"}
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
                  <span>Selected Workspace:</span>
                  Wise ads
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
                      window.history.pushState({}, "", `/${workspace.slug}`);
                    }}
                  >
                    <Box className="h-4 w-4 mr-2" />
                    {workspace.title === "Wise ads"
                      ? "Wise ads"
                      : workspace.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="secondary"
              className="gap-2"
              onClick={openFlowPlayer}
              disabled={
                !currentScenario || !isScenarioActive(currentScenario.id)
              }
            >
              <Play className="h-4 w-4" />
              Run Flow
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 shadow-sm">
              <FileCode className="h-4 w-4" />
              Export Scenarios
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 shadow-sm"
              title="Open Workspace Context"
            >
              <Database className="h-4 w-4" />
              Documents
            </Button>
            <Button
              variant="outline"
              className="gap-2 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Scenario
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Available Scenarios</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Display only scenarios with defined filters */}
          {filteredScenarios.map((scenario) => {
            const isActive = scenario.matchesFilter;
            const isCurrentScenario = currentScenario?.id === scenario.id;

            return (
              <Card
                key={scenario.id}
                className={`overflow-hidden hover:shadow-md transition-shadow ${
                  !isActive ? "opacity-70" : ""
                } ${isCurrentScenario ? "border-primary border-2" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title="Manage Filters"
                        onClick={(e) => handleFilterClick(e, scenario.id)}
                      >
                        <FilterIcon className="h-3.5 w-3.5" />
                      </Button>
                      <FilterStatus
                        scenarioId={scenario.id}
                        onEditClick={(e) => handleFilterClick(e, scenario.id)}
                      />
                      <Badge variant="secondary" className="text-xs">
                        {scenario.children ? scenario.children.length : 0} nodes
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {scenario.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {isActive ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      <span>{isActive ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Updated {formatTimeAgo(scenario.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  {isCurrentScenario ? (
                    <Button
                      className="w-full gap-2"
                      onClick={openFlowPlayer}
                      disabled={!isActive}
                    >
                      <Play className="h-4 w-4" />
                      Start Flow
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full gap-2"
                      onClick={() => {
                        selectWorkspace(currentWorkspace?.id || "");
                        const workspace = useAppStore
                          .getState()
                          .items.find((w) => w.id === currentWorkspace?.id);
                        if (workspace) {
                          useAppStore.getState().selectScenario(scenario.id);
                        }
                      }}
                      disabled={!isActive}
                    >
                      <ArrowRight className="h-4 w-4" />
                      Select
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}

          {filteredScenarios.length === 0 && (
            <div className="col-span-full text-center p-12 border rounded-lg bg-card">
              <div className="text-muted-foreground mb-4">
                No scenarios with filters found
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/scenarios/new")}
              >
                Create New Scenario
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                © 2025 Deep Context Studio. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <Github className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" size="sm" className="text-xs">
                Terms
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                Privacy
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Dialog for FlowPlayer */}
      <Dialog open={flowPlayerOpen} onOpenChange={setFlowPlayerOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl">
              {currentScenario?.name || "Flow Player"}
            </DialogTitle>
          </DialogHeader>

          <div className="h-[calc(100%-4rem)] overflow-hidden p-0">
            <FlowPlayer />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Filters */}
      {editingFilters && (
        <FilterEditor
          scenarioId={editingFilters}
          onClose={() => setEditingFilters(null)}
        />
      )}
    </div>
  );
};

export default WorkspacePage;
