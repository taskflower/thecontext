// src/modules/workspaces_module/WorkspaceScenarios.tsx
import React, { useState } from 'react';
import { useWorkspaceStore } from './workspaceStore';
import { useScenariosMultiStore } from '../scenarios_module/scenariosMultiStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusCircle, FileText, ArrowRight, Trash2, Layers, ChevronRight } from "lucide-react";
import MCard from "@/components/MCard";
import MDialog from "@/components/MDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

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
  
  const workspaceScenarios = workspace.scenarioIds
    .filter(id => scenarios[id])
    .map(id => ({
      id,
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
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-500" />
            <span>Scenariusze w workspace</span>
          </div>
        }
        description="Zarządzaj scenariuszami w tej przestrzeni roboczej"
        footer={
          <Button
            onClick={() => setShowCreateScenarioModal(true)}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Utwórz nowy scenariusz
          </Button>
        }
      >
        {workspaceScenarios.length === 0 ? (
          <div className="text-center py-8 px-6 text-slate-500 bg-slate-50/50 rounded-md border border-dashed">
            <div className="flex flex-col items-center gap-2">
              <Layers className="h-12 w-12 text-slate-300" />
              <p className="text-slate-600 font-medium">Brak scenariuszy w tym workspace</p>
              <p className="text-slate-500 text-sm">Utwórz pierwszy scenariusz, aby rozpocząć.</p>
            </div>
            <Button 
              onClick={() => setShowCreateScenarioModal(true)}
              className="mt-4"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Utwórz scenariusz
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3 p-1">
              {workspaceScenarios.map(scenario => (
                <Card
                  key={scenario.id}
                  className={`border overflow-hidden transition-all ${
                    scenario.isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white hover:bg-slate-50/70'
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span>{scenario.name || scenario.id}</span>
                          {scenario.isActive && (
                            <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 text-xs">
                              Aktywny
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>
                            {scenario.createdAt
                              ? new Date(scenario.createdAt).toLocaleDateString()
                              : 'Brak daty'}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setScenarioToDelete(scenario.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        aria-label="Usuń scenariusz"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-4 py-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Węzły: {Object.keys(scenario.nodes).length}</span>
                      </div>
                      <ArrowRight className="h-3 w-3" />
                      <div className="flex items-center gap-1">
                        <span>Połączenia: {scenario.edges.length}</span>
                      </div>
                    </div>
                    
                    {scenario.workspaceContext && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(scenario.workspaceContext).slice(0, 3).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs bg-slate-50">
                            {key}: {typeof value === 'string' ? (value.length > 15 ? value.substring(0, 15) + '...' : value) : 'complex value'}
                          </Badge>
                        ))}
                        {Object.keys(scenario.workspaceContext).length > 3 && (
                          <Badge variant="outline" className="text-xs bg-slate-50">
                            +{Object.keys(scenario.workspaceContext).length - 3} więcej
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-3 pt-2 bg-slate-50/80">
                    <Button
                      onClick={() => handleSelectScenario(scenario.id)}
                      variant={scenario.isActive ? "default" : "outline"}
                      className="w-full"
                      size="sm"
                    >
                      {scenario.isActive ? 'Aktywny scenariusz' : 'Wybierz scenariusz'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </MCard>
      
      {/* Create scenario modal */}
      <MDialog
        title="Utwórz nowy scenariusz"
        description="Dodaj scenariusz do tego workspace"
        isOpen={showCreateScenarioModal}
        onOpenChange={setShowCreateScenarioModal}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowCreateScenarioModal(false)}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleCreateScenario}
              disabled={!newScenarioName.trim()}
            >
              Utwórz scenariusz
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Nazwa scenariusza
            </label>
            <Input
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              placeholder="Np. Analiza SEO"
              autoFocus
            />
          </div>
          
          <div className="rounded-md bg-blue-50 p-4 text-sm border border-blue-100 text-blue-700">
            <p>
              Nowy scenariusz zostanie utworzony w workspace "{workspace.name}" i
              automatycznie otrzyma dostęp do kontekstu tego workspace.
            </p>
          </div>
        </div>
      </MDialog>
      
      {/* Delete confirmation */}
      <MDialog
        title="Usunąć scenariusz z workspace?"
        description="Czy na pewno chcesz usunąć ten scenariusz z workspace? Scenariusz nie zostanie całkowicie usunięty z systemu."
        isOpen={!!scenarioToDelete}
        onOpenChange={(open) => !open && setScenarioToDelete(null)}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setScenarioToDelete(null)}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteScenario}
            >
              Usuń z workspace
            </Button>
          </>
        }
      >
        <div className="p-4 bg-amber-50 rounded-md border border-amber-100 text-amber-700">
          <p>
            Scenariusz zostanie odłączony od workspace, ale nadal będzie dostępny w systemie.
            Utracisz jednak powiązanie z kontekstem tego workspace.
          </p>
        </div>
      </MDialog>
    </>
  );
};

export default WorkspaceScenarios;