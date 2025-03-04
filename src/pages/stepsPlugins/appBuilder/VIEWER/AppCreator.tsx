/* eslint-disable @typescript-eslint/no-explicit-any */
// AppCreator.tsx - Handles creating application in the system
import { useState, useEffect, useRef } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Task } from "@/types";

import { useDataStore } from "@/store/dataStore";
import { useStepStore } from "@/store/stepStore";
import { useWizardStore } from "@/store/wizardStore";

interface AppCreatorProps {
  generatedApp: any;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onComplete: () => void;
}

export function AppCreator({
  generatedApp,
  loading,
  setLoading,
  onComplete,
}: AppCreatorProps) {
  const [error, setError] = useState<string | null>(null);
  const [appCreated, setAppCreated] = useState(false);
  const [createdTaskIds, setCreatedTaskIds] = useState<string[]>([]);

  // Use a ref to track if we've started creating the app
  const isCreatingRef = useRef(false);

  // Use hooks properly
  const { addTask, updateTask, addProject } = useDataStore();
  const { addStep } = useStepStore();
  const { setActiveTask } = useWizardStore();

  const createApplication = async () => {
    // Guard clause - only run this once
    if (!generatedApp || isCreatingRef.current) return;

    // Set flag to prevent duplicate execution
    isCreatingRef.current = true;

    try {
      setLoading(true);

      // Create a project for the application
      const projectId = `proj-${Date.now()}`;
      const folderId = `folder-${Date.now()}`;

      // Add the project
      addProject({
        id: projectId,
        title: generatedApp.title,
        description: generatedApp.description,
        progress: 0,
        tasks: generatedApp.tasks.length,
        completedTasks: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        folderId,
      });

      const taskIds: string[] = [];

      // Process each task
      for (let i = 0; i < generatedApp.tasks.length; i++) {
        const taskConfig = generatedApp.tasks[i];

        // Create unique task ID with timestamp to avoid duplicates
        const taskId = `task-${Date.now()}-${i}-${Math.floor(
          Math.random() * 10000
        )}`;
        taskIds.push(taskId);

        // Add the task
        const newTask: Task = {
          id: taskId,
          title: taskConfig.title,
          description: taskConfig.description,
          status: "todo",
          priority: "medium",
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          projectId,
          currentStepId: null,
          data: {},
        };

        // Add task to store
        addTask(newTask);

        // Add first task as active
        if (i === 0) {
          setActiveTask(taskId);
        }

        // Create steps
        let firstStepId = null;

        // Add steps for the task
        for (let j = 0; j < taskConfig.steps.length; j++) {
          const stepConfig = taskConfig.steps[j];

          // Create step
          const stepId = addStep(taskId, {
            title: stepConfig.title,
            description: stepConfig.description,
            type: stepConfig.type,
            config: stepConfig.config || {},
            options: stepConfig.options || {},
            status: "pending",
            result: null,
          });

          if (firstStepId === null) {
            firstStepId = stepId;
          }
        }

        // Update task with first step
        if (firstStepId) {
          updateTask(taskId, { currentStepId: firstStepId });
        }
      }

      setCreatedTaskIds(taskIds);
      setAppCreated(true);
      onComplete();
    } catch (err) {
      console.error("Error creating application:", err);
      setError(`Failed to create application: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect to create the application after mount - only once
  useEffect(() => {
    if (!appCreated && !loading && !isCreatingRef.current) {
      console.log("Starting app creation process");
      createApplication();
    }

    // Cleanup function
    return () => {
      console.log("AppCreator component unmounting");
    };
  }, []);

  return (
    <div className="border rounded-md p-4 mt-4">
      {error && (
        <div className="p-3 border border-destructive/50 bg-destructive/10 rounded-md flex items-start gap-2 mb-4">
          <AlertCircle
            size={16}
            className="text-destructive mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Creating application in system...</p>
        </div>
      )}

      {appCreated && (
        <div>
          <div className="flex items-center gap-2 text-green-600 font-medium mb-4">
            <Check size={20} />
            <span>Application created successfully!</span>
          </div>

          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Created Tasks:</h4>
            <ul className="space-y-1 text-sm">
              {createdTaskIds.map((id, index) => (
                <li key={id}>
                  {index + 1}. Task ID:{" "}
                  <code className="bg-muted-foreground/20 px-1 rounded">
                    {id}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
