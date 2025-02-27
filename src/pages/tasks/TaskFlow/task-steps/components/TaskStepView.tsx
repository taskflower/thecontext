/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useTaskStepStore } from "../store";
import { Button } from "@/components/ui/button";
import { Plus, Play} from "lucide-react";
import { StepSchema } from "../types";

interface TaskStepsViewProps {
  taskId: string;
}

const TaskStepsView: React.FC<TaskStepsViewProps> = ({ taskId }) => {
  const {
    getTaskById,
    getStepsByTaskId,
    addStep,
    deleteStep,
    setEditingStep,
    runTask,
    executeStep
  } = useTaskStepStore();

  const task = getTaskById(taskId);
  const steps = getStepsByTaskId(taskId);

  if (!task) {
    return <div>Task not found</div>;
  }

  const handleAddStep = (type: string) => {
    // Create a new step schema based on the type
    const schema: StepSchema = {
      id: `schema-${Date.now()}`,
      type: type as any,
      title: `New ${type} Step`,
      description: "",
      config: {},
      inputMapping: {},
      outputMapping: {}
    };

    addStep(taskId, schema);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{task.title}</h2>
          <p className="text-muted-foreground">{task.description}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => runTask(taskId)}
          >
            <Play className="mr-1 h-4 w-4" />
            Run Task
          </Button>
          <Button onClick={() => {
            // Open dropdown or menu for step type selection
            const dropdown = document.getElementById("step-type-dropdown");
            if (dropdown) {
              dropdown.classList.toggle("hidden");
            }
          }}>
            <Plus className="mr-1 h-4 w-4" />
            Add Step
          </Button>
          
          {/* Step type dropdown */}
          <div 
            id="step-type-dropdown" 
            className="absolute right-4 top-20 z-10 hidden bg-background border rounded-md shadow-lg"
          >
            <div className="p-2">
              <button 
                className="block w-full text-left px-4 py-2 hover:bg-secondary rounded-sm"
                onClick={() => handleAddStep("form")}
              >
                Form Step
              </button>
              <button 
                className="block w-full text-left px-4 py-2 hover:bg-secondary rounded-sm"
                onClick={() => handleAddStep("createDocument")}
              >
                Create Document
              </button>
              <button 
                className="block w-full text-left px-4 py-2 hover:bg-secondary rounded-sm"
                onClick={() => handleAddStep("getDocument")}
              >
                Get Document
              </button>
              <button 
                className="block w-full text-left px-4 py-2 hover:bg-secondary rounded-sm"
                onClick={() => handleAddStep("llmProcess")}
              >
                LLM Process
              </button>
              <button 
                className="block w-full text-left px-4 py-2 hover:bg-secondary rounded-sm"
                onClick={() => handleAddStep("apiProcess")}
              >
                API Process
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-md flex-1 overflow-auto">
        {steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No steps added to this task yet.</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => handleAddStep("form")}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add First Step
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="bg-background border rounded-md p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{step.schema.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.schema.type} {step.schema.description && `- ${step.schema.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-2 py-1 text-xs rounded-full bg-muted">
                    {step.status}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => executeStep(step.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingStep(step)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteStep(step.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 border-t pt-4">
        <h3 className="font-medium mb-2">Task Scope</h3>
        <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
          {JSON.stringify(task.scope, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TaskStepsView;