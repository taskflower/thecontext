import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Filter as FilterIcon,
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

import { FilterStatus } from "@/modules/filters";

const WorkspacePage = () => {
  const [flowPlayerOpen, setFlowPlayerOpen] = useState(false);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);

  const { slug } = useParams();
  const {
    items: workspaces,
    selectWorkspace,
    selectScenario,
    getCurrentWorkspace,
    getCurrentScenario,
    checkScenarioFilterMatch,
  } = useAppStore();
  const navigate = useNavigate();

  // Find workspace by slug and select it
  useEffect(() => {
    if (slug) {
      const workspace = workspaces.find((w) => w.slug === slug);
      if (workspace) {
        selectWorkspace(workspace.id);
      }
    }
  }, [slug, workspaces, selectWorkspace]);

  // Get current workspace and scenario
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();

  // Get all scenarios from current workspace with filter status
  const scenariosWithStatus = React.useMemo(() => {
    if (!currentWorkspace) return [];
    
    return currentWorkspace.children.map(scenario => {
      const hasFilters = !!scenario.filters && scenario.filters.length > 0;
      const activeFilters = hasFilters && scenario.filters ? scenario.filters.filter(f => f.enabled) : [];
      const matchesFilter = checkScenarioFilterMatch();
      
      return {
        ...scenario,
        hasFilters,
        activeFiltersCount: activeFilters.length,
        matchesFilter: hasFilters ? matchesFilter : true
      };
    });
  }, [currentWorkspace, checkScenarioFilterMatch]);

  // Get only scenarios that have defined filters
  const filteredScenarios = scenariosWithStatus.filter(scenario => 
    scenario.hasFilters && !!scenario.filters
  );



  // Handle filter click to edit filters
  const handleFilterClick = (e: React.MouseEvent, scenarioId: string) => {
    e.stopPropagation();
    setEditingFilterId(scenarioId);
  };

  // Format time ago function
  const formatTimeAgo = (timestamp: number | undefined): string => {
    if (!timestamp) return "Recently";
    
    const now = new Date().getTime();
    const date = new Date(timestamp).getTime();
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

  // Start flow session
  const handleStartFlow = () => {
    useAppStore.getState().startFlowSession();
    setFlowPlayerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {currentWorkspace?.title || "Workspace"}
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

            <Button
              variant="secondary"
              className="gap-2"
              onClick={handleStartFlow}
              disabled={!currentScenario || !checkScenarioFilterMatch()}
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
              onClick={() => {
                // You should implement a modal dialog solution here
                // For example, set state to show your add scenario dialog:
                // setShowAddScenarioModal(true);
                console.log('Add new scenario clicked');
              }}
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
                        onClick={(e) => handleFilterClick(e, scenario.id)}
                        className="cursor-pointer"
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
                      onClick={handleStartFlow}
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
                        selectScenario(scenario.id);
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
                onClick={() => {
                  // You should implement a modal dialog solution here
                  // For example, set state to show your add scenario dialog:
                  // setShowAddScenarioModal(true);
                  console.log('Create new scenario clicked');
                }}
              >
                Create New Scenario
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
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
            {/* Render the StepModal component here since it's the actual flow player UI */}
            {flowPlayerOpen && (
              <div className="w-full h-full flex items-center justify-center">
                <StepModal onClose={() => setFlowPlayerOpen(false)} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Filters */}
      {editingFilterId && (
        <Dialog open={!!editingFilterId} onOpenChange={() => setEditingFilterId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Filters</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <FiltersList />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setEditingFilterId(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Import these components here to avoid circular dependencies
import { StepModal } from "@/modules/flow/components/StepModal";
import { FiltersList } from "@/modules/filters";

export default WorkspacePage;