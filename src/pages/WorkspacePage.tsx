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
import { useAppStore } from "@/modules/store";
import {
  Play,
  CheckCircle,
  Clock,
  Book,
  ArrowRight,
  Github,
  Twitter,
  FilterIcon,
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

const WorkspacePage: React.FC = () => {
  const [flowPlayerOpen, setFlowPlayerOpen] = useState(false);
  const [editingFilters, setEditingFilters] = useState<string | null>(null);
  
  const { slug } = useParams<{ slug: string }>();
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
  }, [getScenariosWithFilterStatus, useAppStore((state) => state.stateVersion)]);

  // Check if scenario active (matches filters)
  const isScenarioActive = (scenarioId: string) => {
    const contextItems = currentWorkspace?.contextItems || [];
    return checkScenarioFilterMatch(scenarioId, contextItems);
  };

  const openFlowPlayer = () => {
    setFlowPlayerOpen(true);
  };

  // Filter management functions
  const handleFilterClick = (e: React.MouseEvent, scenarioId: string) => {
    e.stopPropagation();
    setEditingFilters(scenarioId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {currentWorkspace?.title || "Workspace"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {currentScenario
                  ? `Current scenario: ${currentScenario.name}`
                  : "No scenario selected"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Workspace Navigation */}
              <div className="flex bg-muted rounded-md overflow-hidden mr-2">
                {workspaces.map((workspace) => (
                  <Button
                    key={workspace.id}
                    variant={
                      currentWorkspace?.id === workspace.id
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    className="rounded-none h-9 px-3"
                    onClick={() => {
                      selectWorkspace(workspace.id);
                      window.history.pushState({}, "", `/${workspace.slug}`);
                    }}
                  >
                    {workspace.title}
                  </Button>
                ))}
              </div>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={openFlowPlayer}
                disabled={!currentScenario || !isScenarioActive(currentScenario.id)}
              >
                <Play className="h-4 w-4" />
                Run Flow
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-8">
        <h2 className="text-2xl font-semibold mb-6">Available Scenarios</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Display all scenarios */}
          {scenariosWithStatus.map((scenario) => {
            const isActive = scenario.matchesFilter;
            const isCurrentScenario = currentScenario?.id === scenario.id;
            
            return (
              <Card 
                key={scenario.id}
                className={`overflow-hidden hover:shadow-md transition-shadow ${
                  !isActive ? 'opacity-50' : ''
                } ${
                  isCurrentScenario ? 'border-blue-500 border-2' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      {scenario.name}
                    </CardTitle>
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
                      <span>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Updated{" "}
                        {new Date(
                          scenario.updatedAt || Date.now()
                        ).toLocaleDateString()}
                      </span>
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
                        const workspace = useAppStore.getState().items.find(w => w.id === currentWorkspace?.id);
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

          {/* Mock cards */}
          <Card className="overflow-hidden bg-muted/40 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Customer Support</CardTitle>
              <CardDescription>
                Handle common customer inquiries and support requests
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Book className="h-3.5 w-3.5" />
                  <span>12 nodes</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3">
              <Button variant="secondary" className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                Select
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden bg-muted/40 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Product Onboarding</CardTitle>
              <CardDescription>
                Guide new users through product features and setup
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Book className="h-3.5 w-3.5" />
                  <span>8 nodes</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3">
              <Button variant="secondary" className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                Select
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto py-6">
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
              <Button
                variant="secondary"
                size="sm"
                className="text-xs"
                onClick={() => navigate("/studio")}
              >
                Studio
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