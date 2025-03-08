/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/components/AppPlugins.tsx
import { useEffect, useState } from "react";
import { StepConfig } from "../types";
import { loadAllPlugins } from "../registry";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StepsList } from "./StepsList";
import { TaskWizard } from "./TaskWizard";
import { PluginAddDialog } from "./PluginAddDialog";
import { PluginManagerProvider } from "../pluginContext";
import { usePluginStore } from "../store/pluginStore";

// Demo task ID
const DEMO_TASK_ID = 'task-demo-1';

export default function AppPlugins() {
  // Application state
  const [steps, setSteps] = useState<StepConfig[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [pluginDialogOpen, setPluginDialogOpen] = useState(false);
  
  // Get plugins loading state from store instead of local state
  const pluginsLoaded = usePluginStore(state => 
    Object.keys(state.registeredPlugins).length > 0 && !state.isLoading
  );
  
  // Add steps to window for plugin access
  useEffect(() => {
    window.appSteps = steps;
    return () => {
      window.appSteps = undefined;
    };
  }, [steps]);
  
  // Load all plugins on application start
  useEffect(() => {
    loadAllPlugins();
  }, []);
  
  // Function to add a new step
  const handleAddStep = (taskId: string, stepData: any) => {
    const newStep: StepConfig = {
      id: `step-${Date.now()}`,
      type: stepData.type,
      title: stepData.title,
      description: stepData.description || '',
      taskId,
      order: steps.length,
      status: 'pending',
      data: stepData.data || {},
      result: null
    };
    
    setSteps(prevSteps => [...prevSteps, newStep]);
  };
  
  // Update a step
  const updateStep = (stepId: string, updates: Partial<StepConfig>) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    );
  };
  
  // Complete a step
  const handleStepComplete = (stepId: string, result: Record<string, any>) => {
    updateStep(stepId, { 
      status: 'completed',
      result
    });
  };
  
  // Skip a step
  const handleStepSkip = (stepId: string) => {
    updateStep(stepId, { status: 'skipped' });
  };
  
  // Complete a task
  const handleTaskComplete = () => {
    alert('Task has been completed!');
  };
  
  // Execute a step
  const executeStep = (stepIndex: number) => {
    setActiveStepIndex(stepIndex);
    setWizardOpen(true);
  };
  
  return (
    <PluginManagerProvider>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Plugin System Demo</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setPluginDialogOpen(true)}
              disabled={!pluginsLoaded}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
            {steps.length > 0 && (
              <Button 
                variant="default" 
                onClick={() => {
                  setActiveStepIndex(0);
                  setWizardOpen(true);
                }}
              >
                Run Task
              </Button>
            )}
          </div>
        </div>
        
        {!pluginsLoaded ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading plugins...
          </div>
        ) : steps.length === 0 ? (
          <div className="p-8 text-center border rounded-md">
            <p className="mb-4 text-muted-foreground">
              No steps in the task. Add your first step to get started.
            </p>
            <Button onClick={() => setPluginDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>
        ) : (
          <div className="border rounded-md">
            <StepsList 
              steps={steps}
              onExecuteStep={executeStep}
              onEditStep={(stepId) => {
                // Edit step implementation
                alert(`Editing step: ${stepId}`);
              }}
            />
          </div>
        )}
        
        {/* Add step dialog */}
        <PluginAddDialog
          taskId={DEMO_TASK_ID}
          open={pluginDialogOpen}
          onClose={() => setPluginDialogOpen(false)}
          onAddStep={handleAddStep}
        />
        
        {/* Task wizard */}
        <TaskWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          taskId={DEMO_TASK_ID}
          steps={steps}
          onStepComplete={handleStepComplete}
          onStepSkip={handleStepSkip}
          onTaskComplete={handleTaskComplete}
          initialStepIndex={activeStepIndex}
        />
      </div>
    </PluginManagerProvider>
  );
}