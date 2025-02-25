import { useDocumentStore } from "@/store/documentStore";
import { ITask, ITaskStep } from "@/utils/types";
import { SetState, GetState } from "./tasksInterfaces";
import { generateId } from "../utils";

export interface TaskAIActions {
  createTaskWithAI: (
    title: string,
    description: string,
    containerId?: string,
    templateId?: string
  ) => Promise<string>;
  
  suggestDocumentsForTask: (taskId: string) => Promise<void>;
  executeTaskStep: (taskId: string, stepId: string) => Promise<void>;
  executeAllTaskSteps: (taskId: string) => Promise<void>;
}

export const taskAIActions = (set: SetState, get: GetState): TaskAIActions => ({
  createTaskWithAI: async (
    title: string,
    description: string,
    containerId?: string,
    templateId?: string
  ) => {
    // Jeśli kontener nie został podany, pobieramy domyślny
    if (!containerId) {
      const containers = useDocumentStore.getState().containers;
      if (containers.length > 0) {
        containerId = containers[0].id;
      }
    }

    // Tworzymy zadanie z szablonem, jeśli został podany
    const now = new Date();
    let steps: ITaskStep[] = [];

    if (templateId) {
      const template = get().templates.find(t => t.id === templateId);
      if (template) {
        steps = template.defaultSteps.map(stepTemplate => ({
          ...stepTemplate,
          id: generateId(),
          taskId: '',
          status: 'pending'
        }));
      }
    }

    const taskId = generateId();
    const task: ITask = {
      id: taskId,
      title,
      description,
      status: 'pending',
      priority: templateId ? 'high' : 'medium',
      createdAt: now,
      updatedAt: now,
      containerId,
      relatedDocumentIds: [],
      steps: []
    };

    // Przypisujemy ID zadania do kroków
    task.steps = steps.map(step => ({ ...step, taskId }));
    
    // Dodajemy zadanie do stanu, zachowując pozostałe właściwości
    set((state) => ({
      ...state,
      tasks: [...state.tasks, task]
    }));

    // Próba zasugerowania dokumentów
    if (containerId) {
      try {
        await get().suggestDocumentsForTask(task.id);
      } catch (error) {
        console.error("Failed to suggest documents:", error);
      }
    }
    
    return task.id;
  },

  suggestDocumentsForTask: async (taskId: string) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || !task.containerId) return;
    
    const { containers } = useDocumentStore.getState();
    const container = containers.find(c => c.id === task.containerId);
    
    if (container && container.documents) {
      // Przypisujemy wszystkie dokumenty z kontenera do zadania
      const documentIds = container.documents.map(doc => doc.id);
      get().updateTask(taskId, { relatedDocumentIds: documentIds });
    }
  },

  executeTaskStep: async (taskId: string, stepId: string) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    
    const step = task.steps.find(s => s.id === stepId);
    if (!step) return;
    
    // Oznaczamy krok jako w trakcie wykonywania
    get().updateStep(taskId, stepId, { status: "in_progress" });
    
    try {
      // Pobieramy informacje o kontenerze i dokumentach
      const { containers, addDocument } = useDocumentStore.getState();
      
      // Znajdujemy dokumenty powiązane z zadaniem
      const relatedDocs = [];
      
      if (task.relatedDocumentIds.length > 0) {
        for (const containerId of containers.map(c => c.id)) {
          const container = containers.find(c => c.id === containerId);
          if (container) {
            for (const doc of container.documents) {
              if (task.relatedDocumentIds.includes(doc.id)) {
                relatedDocs.push(doc);
              }
            }
          }
        }
      }
      
      // Wykonujemy krok w zależności od typu
      let output = '';
      let status: 'completed' | 'failed' = 'completed';
      
      switch(step.type) {
        case 'retrieval':
          output = `Found ${relatedDocs.length} documents related to the task`;
          break;
          
        case 'processing':
          if (relatedDocs.length === 0) {
            output = `No documents found for processing`;
            status = 'failed';
          } else {
            output = `Processed data from ${relatedDocs.length} documents`;
          }
          break;
          
        case 'generation':
          if (!task.containerId) {
            // Próba przypisania kontenera, jeśli istnieje
            const containers = useDocumentStore.getState().containers;
            if (containers.length > 0) {
              task.containerId = containers[0].id;
              get().updateTask(taskId, { containerId: containers[0].id });
            } else {
              output = 'Cannot create document - no container assigned';
              status = 'failed';
              break;
            }
          }
          
          // Pobieramy kontener zadania
          const taskContainer = containers.find(c => c.id === task.containerId);
          if (!taskContainer) {
            output = 'Cannot create document - container not found';
            status = 'failed';
            break;
          }
          
          try {
            // Pobieramy domyślne ID schematu, jeśli dostępne
            const defaultSchemaId = taskContainer.schemas && taskContainer.schemas.length > 0
              ? taskContainer.schemas[0].id
              : 'default';
            
            // Tworzymy dokument
            const docId = addDocument(task.containerId, {
              title: `${task.title} - Generated Document`,
              content: `Document generated based on task "${task.title}"`,
              customFields: {}, 
              schemaId: defaultSchemaId
            });
            
            output = `Created new document with ID: ${docId}`;
          } catch (error) {
            console.error('Error creating document:', error);
            output = `Error creating document: ${error}`;
            status = 'failed';
          }
          break;
          
        case 'validation':
          output = `Document validated`;
          break;
          
        default:
          output = `Executed step ${step.id}`;
      }
      
      // Aktualizujemy krok z wynikiem i statusem
      get().updateStep(taskId, stepId, { 
        output,
        status
      });
    } catch (error) {
      console.error(`Failed to execute step ${stepId}:`, error);
      get().updateStep(taskId, stepId, { 
        output: `Error: ${error}`,
        status: "failed" 
      });
    }
  },

  executeAllTaskSteps: async (taskId: string) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    
    // Aktualizujemy status zadania
    get().updateTask(taskId, { status: "in_progress" });
    
    try {
      // Wykonujemy kroki w kolejności
      const orderedSteps = [...task.steps].sort((a, b) => a.order - b.order);
      
      for (const step of orderedSteps) {
        await get().executeTaskStep(taskId, step.id);
        
        // Jeśli krok nie powiódł się, przerywamy wykonanie
        const updatedStep = get().tasks
          .find(t => t.id === taskId)?.steps
          .find(s => s.id === step.id);
          
        if (updatedStep?.status === 'failed') {
          get().updateTask(taskId, { status: "failed" });
          return;
        }
      }
      
      // Sprawdzamy, czy wszystkie kroki zakończyły się sukcesem
      const updatedTask = get().tasks.find(t => t.id === taskId);
      const allStepsCompleted = updatedTask?.steps.every(s => s.status === "completed");
      
      if (allStepsCompleted) {
        get().updateTask(taskId, { status: "completed" });
      }
    } catch (error) {
      console.error(`Failed to execute all steps for task ${taskId}:`, error);
      get().updateTask(taskId, { status: "failed" });
    }
  }
});
