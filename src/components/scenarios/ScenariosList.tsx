// src/components/scenarios/ScenariosList.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Clock, Cog, Terminal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useScenarioStore } from "@/stores/scenarioStore";
import { NewScenarioDialog } from "./NewScenarioDialog";
import { ScenarioEditor } from "./ScenarioEditor";
import { 
  FilterDropdown, 
  FilterToggle, 
  useFilterStore,
} from "./FilterComponents";
import { ScenarioCard } from "./ScenarioCard";

export const ScenariosList: React.FC = () => {
  const { getCurrentWorkspace, getWorkspaceContext, updateWorkspaceContext } =
    useWorkspaceStore();
  const {
    scenarios,
    templates,
  } = useScenarioStore();
  const {
    activeFilters,
    filteringEnabled,
    setActiveFilters,
    setFilteringEnabled
  } = useFilterStore();

  const workspace = getCurrentWorkspace();
  const [activeTab, setActiveTab] = useState("scenarios");
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(
    null
  );

  const isInitialMount = useRef(true);
  const isUpdatingFromWorkspace = useRef(false);

  // Load workspace filters on mount or workspace change
  useEffect(() => {
    if (workspace) {
      isUpdatingFromWorkspace.current = true;
      const workspaceContext = getWorkspaceContext(workspace.id);
      if (workspaceContext && workspaceContext.activeFilters) {
        setActiveFilters(workspaceContext.activeFilters);
        setFilteringEnabled(workspaceContext.filteringEnabled || false);
      } else {
        setActiveFilters([]);
        setFilteringEnabled(false);
      }
      // Allow time for state updates to complete before allowing saves
      setTimeout(() => {
        isUpdatingFromWorkspace.current = false;
      }, 0);
    }
  }, [workspace, getWorkspaceContext, setActiveFilters, setFilteringEnabled]);

  // Save filter state when changed, but not on initial mount or when loading from workspace
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip if we're currently updating from workspace context
    if (isUpdatingFromWorkspace.current) {
      return;
    }

    if (workspace) {
      updateWorkspaceContext(workspace.id, {
        activeFilters,
        filteringEnabled,
      });
    }
  }, [activeFilters, filteringEnabled, workspace, updateWorkspaceContext]);

  if (!workspace) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center text-slate-500">
          No active workspace. Please select or create a workspace.
        </CardContent>
      </Card>
    );
  }

  const workspaceScenarios = Object.values(scenarios)
    .filter((scenario) => scenario.workspaceId === workspace.id)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const allTemplates = Object.values(templates).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  // Handle editing a scenario
  const handleEditScenario = (scenarioId: string) => {
    setEditingScenarioId(scenarioId);
  };

  // Handle closing the editor
  const handleCloseEditor = () => {
    setEditingScenarioId(null);
  };

  return (
    <div className="space-y-6">
      {editingScenarioId ? (
        <ScenarioEditor
          scenarioId={editingScenarioId}
          onClose={handleCloseEditor}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center flex-1">
              <FilterDropdown />
              <FilterToggle />
            </div>

            {workspace && <NewScenarioDialog workspaceId={workspace.id} />}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4 w-max">
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="scenarios">
              {workspaceScenarios.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-slate-500">
                    <Cog className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                    <p>
                      No scenarios in this workspace yet. Create your first
                      scenario to get started.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workspaceScenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onEdit={handleEditScenario}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates">
              {allTemplates.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-slate-500">
                    <Terminal className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                    <p>
                      No templates available. Save a scenario as a template to
                      reuse it later.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTemplates.map((template) => (
                    <Card key={template.id} className="border-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-black" />
                          {template.name}
                        </CardTitle>
                        <CardDescription>
                          {template.description || "No description"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-slate-500 space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Created{" "}
                            {formatDistanceToNow(template.createdAt, {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};