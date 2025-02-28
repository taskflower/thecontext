/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/components/navigator/TaskDetailView.tsx
import React from "react";
import { PlayCircle, Folder, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataStore } from "@/store/dataStore";
import { useStepStore } from "@/store/stepStore";
import { useWizardStore } from "@/store/wizardStore";
import {
  StepEditor,
  getAllPlugins,
  getDefaultConfig,
} from "@/pages/stepsPlugins";
import { StepType } from "@/types";
import { StepResult } from "@/pages/steps/StepResult";

export function TaskDetailView() {
  const [isAddingStep, setIsAddingStep] = React.useState(false);
  const [isEditingStep, setIsEditingStep] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number | null>(
    null
  );
  const [newStepType, setNewStepType] = React.useState("");
  const [newStepTitle, setNewStepTitle] = React.useState("");

  // Pobierz wszystkie dostępne wtyczki
  const plugins = getAllPlugins();

  // Ustaw domyślnie pierwszą wtyczkę, jeśli jest dostępna
  React.useEffect(() => {
    if (plugins.length > 0 && !newStepType) {
      setNewStepType(plugins[0].type);
    }
  }, [plugins, newStepType]);

  // Pobierz dane ze sklepów
  const { tasks, projects } = useDataStore();
  const { getTaskSteps, updateStep, addStep } = useStepStore();
  const { activeTaskId, openWizard } = useWizardStore();
  
  console.log("TaskDetailView - activeTaskId:", activeTaskId); // Log dla debugowania

  // Pobierz wybrane zadanie
  const task = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  
  if (task) {
    console.log("Znaleziono zadanie:", task.title);
  } else {
    console.log("Nie znaleziono zadania dla ID:", activeTaskId);
  }
  
  const steps = activeTaskId ? getTaskSteps(activeTaskId).sort((a, b) => a.order - b.order) : [];

  // Pobierz nazwę projektu dla zadania
  const projectName = task?.projectId
    ? projects.find((p) => p.id === task.projectId)?.title || task.projectId
    : "Brak projektu";

  if (!task) {
    return (
      <div className="h-full">
        <div className="px-6 py-4">
          <h2 className="text-base font-semibold">Szczegóły zadania</h2>
        </div>
        <div className="flex h-[calc(100vh-240px)] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Wybierz zadanie, aby zobaczyć szczegóły
          </p>
        </div>
      </div>
    );
  }

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;

    const defaultConfig = getDefaultConfig(newStepType);

    addStep(task.id, {
      title: newStepTitle,
      description: newStepTitle,
      type: newStepType as StepType,
      config: defaultConfig,
      options: {},
    });

    // Resetuj i zamknij dialog
    setNewStepTitle("");
    setIsAddingStep(false);
  };

  const handleEditStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    setIsEditingStep(true);
  };

  const handleUpdateStep = (updates: Partial<any>) => {
    if (currentStepIndex === null) return;

    const step = steps[currentStepIndex];
    updateStep(step.id, updates);
  };

  const handleExecuteStep = (stepId: string) => {
    if (task) {
      openWizard(task.id, stepId);
    }
  };

  const handleExecuteAllSteps = () => {
    if (task) {
      openWizard(task.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Oczekujący</Badge>;
      case "in-progress":
      case "in_progress":
        return <Badge variant="secondary">W trakcie</Badge>;
      case "completed":
        return <Badge>Ukończony</Badge>;
      case "failed":
        return <Badge variant="destructive">Nieudany</Badge>;
      case "skipped":
        return <Badge variant="outline">Pominięty</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline">Niski priorytet</Badge>;
      case "medium":
        return <Badge variant="secondary">Średni priorytet</Badge>;
      case "high":
        return <Badge variant="destructive">Wysoki priorytet</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="h-full bg-background">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mt-2">{task.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
          </div>
          <Button onClick={handleExecuteAllSteps}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Wykonaj wszystkie kroki
          </Button>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {task.description || "Brak opisu."}
          </p>

          {task.projectId && (
            <div>
              <div className="flex items-center gap-2 text-sm">
                <Folder className="h-4 w-4" />
                Projekt: {projectName}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Kroki</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingStep(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Dodaj krok
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-3">
                {steps.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground border rounded-md">
                    Brak zdefiniowanych kroków. Dodaj kroki, aby wykonać to zadanie.
                  </div>
                ) : (
                  steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="overflow-hidden border rounded-md"
                    >
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="h-6 w-6 p-0 flex items-center justify-center rounded-full"
                            >
                              {index + 1}
                            </Badge>
                            {step.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(step.status)}
                            <Badge variant="outline">{step.type}</Badge>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditStep(index)}
                              title="Edytuj krok"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleExecuteStep(step.id)}
                              title="Wykonaj krok"
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {step.result && (
                        <div className="px-4 py-3 bg-muted/50 border-t">
                          <StepResult step={step} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Dialog dodawania kroku */}
      <Dialog open={isAddingStep} onOpenChange={setIsAddingStep}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj krok do zadania</DialogTitle>
            <DialogDescription>
              Utwórz nowy krok dla tego zadania.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="step-type"
                className="text-sm font-medium mb-1 block"
              >
                Typ kroku
              </label>
              <Select
                value={newStepType}
                onValueChange={(value) => setNewStepType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz typ kroku" />
                </SelectTrigger>
                <SelectContent>
                  {plugins.map((plugin) => (
                    <SelectItem key={plugin.type} value={plugin.type}>
                      {plugin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="step-title"
                className="text-sm font-medium mb-1 block"
              >
                Nazwa kroku
              </label>
              <Input
                id="step-title"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                placeholder="Nazwa kroku"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingStep(false)}>
              Anuluj
            </Button>
            <Button onClick={handleAddStep} disabled={!newStepTitle.trim()}>
              Dodaj krok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog edycji kroku */}
      <Dialog open={isEditingStep} onOpenChange={setIsEditingStep}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Edytuj krok:{" "}
              {currentStepIndex !== null && steps[currentStepIndex]
                ? steps[currentStepIndex].title
                : ""}
            </DialogTitle>
          </DialogHeader>

          {currentStepIndex !== null && steps[currentStepIndex] && (
            <div className="py-4">
              <StepEditor
                step={steps[currentStepIndex]}
                onChange={handleUpdateStep}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingStep(false)}>
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TaskDetailView;