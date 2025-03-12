// src/modules/workspaces_module/WorkspaceScenarios.tsx
import React, { useState } from 'react';
import { useWorkspaceStore } from './workspaceStore';
import { useScenariosMultiStore } from '../scenarios_module/scenariosMultiStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  PlusCircle, 
  FileText, 
  Trash2, 
  Layers, 
  ChevronRight 
} from "lucide-react";
import MCard from "@/components/MCard";
import MDialog from "@/components/MDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WorkspaceScenariosProps {
  workspaceId: string;
}

const WorkspaceScenarios: React.FC<WorkspaceScenariosProps> = ({ workspaceId }) => {
  const { workspaces, createScenarioInWorkspace, removeScenarioFromWorkspace } = useWorkspaceStore();
  const { scenarios, setCurrentScenario, syncCurrentScenarioToActive, currentScenarioId } = useScenariosMultiStore();
  
  const [showCreateScenarioModal, setShowCreateScenarioModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);
  
  const workspace = workspaces[workspaceId];
  if (!workspace) return null;
  
  // Fix for the TypeScript error - don't include 'id' explicitly as it's already in scenarios[id]
  const workspaceScenarios = workspace.scenarioIds
    .filter(id => scenarios[id])
    .map(id => ({
      ...scenarios[id],
      isActive: id === currentScenarioId
    }));
  
  const handleCreateScenario = () => {
    if (newScenarioName.trim()) {
      const scenarioId = createScenarioInWorkspace(workspaceId, newScenarioName);
      if (scenarioId) {
        setCurrentScenario(scenarioId);
        syncCurrentScenarioToActive();
      }
      setNewScenarioName('');
      setShowCreateScenarioModal(false);
    }
  };
  
  const handleSelectScenario = (scenarioId: string) => {
    setCurrentScenario(scenarioId);
    syncCurrentScenarioToActive();
  };
  
  const handleDeleteScenario = () => {
    if (scenarioToDelete) {
      removeScenarioFromWorkspace(workspaceId, scenarioToDelete);
      
      // If we're deleting the active scenario, clear the current scenario
      if (currentScenarioId === scenarioToDelete) {
        setCurrentScenario(null);
      }
      
      setScenarioToDelete(null);
    }
  };
  
  return (
    <>
      <MCard
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-green-500" />
              <span>Scenarios in Workspace</span>
            </div>
            <Button
              onClick={() => setShowCreateScenarioModal(true)}
              size="sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Scenario
            </Button>
          </div>
        }
        description="Manage scenarios in this workspace"
      >
        {workspaceScenarios.length === 0 ? (
          <div className="text-center py-8 px-6 text-slate-500 bg-slate-50/50 rounded-md border border-dashed">
            <div className="flex flex-col items-center gap-2">
              <Layers className="h-12 w-12 text-slate-300" />
              <p className="text-slate-600 font-medium">No scenarios in this workspace</p>
              <p className="text-slate-500 text-sm">Create your first scenario to get started.</p>
            </div>
            <Button 
              onClick={() => setShowCreateScenarioModal(true)}
              className="mt-4"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Scenario
            </Button>
          </div>
        ) : (
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Nodes</TableHead>
                  <TableHead>Connections</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaceScenarios.map(scenario => (
                  <TableRow 
                    key={scenario.id}
                    className={scenario.isActive ? 'bg-blue-50' : 'bg-white'}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>{scenario.name || scenario.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>
                          {scenario.createdAt
                            ? new Date(scenario.createdAt).toLocaleDateString()
                            : 'No date'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {Object.keys(scenario.nodes).length}
                    </TableCell>
                    <TableCell className="text-sm">
                      {scenario.edges.length}
                    </TableCell>
                    <TableCell>
                      {scenario.isActive && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleSelectScenario(scenario.id)}
                          variant={scenario.isActive ? "secondary" : "outline"}
                          size="sm"
                        >
                          {scenario.isActive ? 'Active' : 'Select'}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setScenarioToDelete(scenario.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                          aria-label="Delete scenario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </MCard>
      
      {/* Create scenario modal */}
      <MDialog
        title="Create New Scenario"
        description="Add a scenario to this workspace"
        isOpen={showCreateScenarioModal}
        onOpenChange={setShowCreateScenarioModal}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowCreateScenarioModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateScenario}
              disabled={!newScenarioName.trim()}
            >
              Create Scenario
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Scenario Name
            </label>
            <Input
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              placeholder="e.g., SEO Analysis"
              autoFocus
            />
          </div>
          
          <div className="rounded-md bg-blue-50 p-4 text-sm border border-blue-100 text-blue-700">
            <p>
              The new scenario will be created in the "{workspace.name}" workspace and
              will automatically receive access to this workspace's context.
            </p>
          </div>
        </div>
      </MDialog>
      
      {/* Delete confirmation */}
      <MDialog
        title="Remove Scenario from Workspace?"
        description="Are you sure you want to remove this scenario from the workspace? The scenario will not be completely deleted from the system."
        isOpen={!!scenarioToDelete}
        onOpenChange={(open) => !open && setScenarioToDelete(null)}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setScenarioToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteScenario}
            >
              Remove from Workspace
            </Button>
          </>
        }
      >
        <div className="p-4 bg-amber-50 rounded-md border border-amber-100 text-amber-700">
          <p>
            The scenario will be detached from this workspace but will still be available in the system.
            However, you will lose the connection to this workspace's context.
          </p>
        </div>
      </MDialog>
    </>
  );
};

export default WorkspaceScenarios;