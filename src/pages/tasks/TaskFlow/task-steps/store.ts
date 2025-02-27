/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/task-steps/store.ts
import { create } from 'zustand';
import { Task, TaskStep, StepSchema } from './types';

interface TaskStepState {
  tasks: Task[];
  steps: TaskStep[];
  activeTaskId: string | null;
  showStepEditor: boolean;
  editingStep: TaskStep | null;
  
  // Task actions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'currentStepIndex' | 'status'>) => string;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setActiveTask: (taskId: string | null) => void;
  updateTaskScope: (taskId: string, scopeUpdates: Record<string, any>) => void;
  
  // Step actions
  addStep: (taskId: string, schema: StepSchema, order?: number) => string;
  updateStep: (stepId: string, updates: Partial<TaskStep>) => void;
  reorderSteps: (taskId: string, stepIds: string[]) => void;
  deleteStep: (stepId: string) => void;
  setEditingStep: (step: TaskStep | null) => void;
  toggleStepEditor: () => void;
  
  // Task flow actions
  executeStep: (stepId: string) => Promise<void>;
  runTask: (taskId: string) => Promise<void>;
  
  // Getters
  getTaskById: (taskId: string) => Task | undefined;
  getStepsByTaskId: (taskId: string) => TaskStep[];
}

export const useTaskStepStore = create<TaskStepState>((set, get) => ({
  tasks: [],
  steps: [],
  activeTaskId: null,
  showStepEditor: false,
  editingStep: null,
  
  // Task actions
  createTask: (taskData) => {
    const id = `task-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newTask: Task = {
      id,
      ...taskData,
      status: 'draft',
      currentStepIndex: 0,
      scope: taskData.scope || {},
      createdAt: now,
      updatedAt: now
    };
    
    set(state => ({
      tasks: [...state.tasks, newTask],
      activeTaskId: id
    }));
    
    return id;
  },
  
  updateTask: (taskId, updates) => {
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() } 
          : task
      )
    }));
  },
  
  deleteTask: (taskId) => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== taskId),
      steps: state.steps.filter(step => step.taskId !== taskId),
      activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId
    }));
  },
  
  setActiveTask: (taskId) => {
    set({ activeTaskId: taskId });
  },
  
  updateTaskScope: (taskId, scopeUpdates) => {
    set(state => ({
      tasks: state.tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            scope: { ...task.scope, ...scopeUpdates },
            updatedAt: new Date().toISOString()
          };
        }
        return task;
      })
    }));
  },
  
  // Step actions
  addStep: (taskId, schema, order) => {
    const steps = get().getStepsByTaskId(taskId);
    const newOrder = order !== undefined ? order : steps.length;
    const id = `step-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newStep: TaskStep = {
      id,
      taskId,
      schema,
      status: 'pending',
      order: newOrder,
      createdAt: now,
      updatedAt: now
    };
    
    set(state => ({
      steps: [...state.steps, newStep]
    }));
    
    return id;
  },
  
  updateStep: (stepId, updates) => {
    set(state => ({
      steps: state.steps.map(step => 
        step.id === stepId 
          ? { ...step, ...updates, updatedAt: new Date().toISOString() } 
          : step
      )
    }));
  },
  
  reorderSteps: (taskId, stepIds) => {
    set(state => ({
      steps: state.steps.map(step => {
        if (step.taskId === taskId) {
          const newOrder = stepIds.indexOf(step.id);
          if (newOrder !== -1) {
            return { ...step, order: newOrder };
          }
        }
        return step;
      })
    }));
  },
  
  deleteStep: (stepId) => {
    set(state => ({
      steps: state.steps.filter(step => step.id !== stepId),
      editingStep: state.editingStep?.id === stepId ? null : state.editingStep
    }));
  },
  
  setEditingStep: (step) => {
    set({ editingStep: step });
  },
  
  toggleStepEditor: () => {
    set(state => ({ showStepEditor: !state.showStepEditor }));
  },
  
  // Task flow actions
  executeStep: async (stepId) => {
    const step = get().steps.find(s => s.id === stepId);
    if (!step) return;
    
    const task = get().getTaskById(step.taskId);
    if (!task) return;
    
    // Update step status to running
    get().updateStep(stepId, { status: 'running' });
    
    try {
      // Prepare input data by mapping from task scope
      const input: Record<string, any> = {};
      if (step.schema.inputMapping) {
        Object.entries(step.schema.inputMapping).forEach(([stepProp, scopeProp]) => {
          input[stepProp] = task.scope[scopeProp];
        });
      }
      
      // Update step with input
      get().updateStep(stepId, { input });
      
      // Execute step based on its type
      let output: Record<string, any> = {};
      
      switch (step.schema.type) {
        case 'form':
          // Form steps are handled by the UI, no execution needed
          output = { formCompleted: true };
          break;
          
        case 'createDocument':
          // Code to create a document in the document system
          // This would call your document creation logic
          output = {
            documentId: `doc-${Date.now()}`,
            title: input.title || 'New Document',
            content: input.content || ''
          };
          break;
          
        case 'getDocument':
          // Code to fetch a document
          // This would call your document retrieval logic
          output = {
            documentId: input.documentId,
            title: 'Retrieved Document',
            content: 'Document content would be fetched here'
          };
          break;
          
        case 'llmProcess':
          // Simulate LLM processing
          output = {
            result: `Processed content: ${input.content?.substring(0, 50)}...`,
            confidence: 0.89
          };
          break;
          
        case 'apiProcess':
          // Simulate API call
          output = {
            status: 'success',
            data: { processed: true, timestamp: new Date().toISOString() }
          };
          break;
          
        default:
          throw new Error(`Unknown step type: ${step.schema.type}`);
      }
      
      // Update step with output
      get().updateStep(stepId, { 
        output, 
        status: 'completed' 
      });
      
      // Update task scope with output data using output mapping
      if (step.schema.outputMapping) {
        const scopeUpdates: Record<string, any> = {};
        Object.entries(step.schema.outputMapping).forEach(([outputProp, scopeProp]) => {
          scopeUpdates[scopeProp] = output[outputProp];
        });
        get().updateTaskScope(task.id, scopeUpdates);
      }
      
    } catch (error) {
      // Handle error
      get().updateStep(stepId, { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  
  runTask: async (taskId) => {
    const task = get().getTaskById(taskId);
    if (!task) return;
    
    // Update task status to active
    get().updateTask(taskId, { status: 'active' });
    
    // Get ordered steps
    const steps = get().getStepsByTaskId(taskId)
      .sort((a, b) => a.order - b.order);
    
    // Start from current step index
    for (let i = task.currentStepIndex; i < steps.length; i++) {
      const step = steps[i];
      
      // Update current step index
      get().updateTask(taskId, { currentStepIndex: i });
      
      // Execute step
      await get().executeStep(step.id);
      
      // If step errored, stop execution
      const updatedStep = get().steps.find(s => s.id === step.id);
      if (updatedStep?.status === 'error') {
        get().updateTask(taskId, { status: 'error' });
        break;
      }
      
      // If step is a form, stop and wait for user input
      if (step.schema.type === 'form' && updatedStep?.status !== 'completed') {
        break;
      }
    }
    
    // Check if all steps are completed
    const allStepsCompleted = get().getStepsByTaskId(taskId)
      .every(step => step.status === 'completed');
    
    if (allStepsCompleted) {
      get().updateTask(taskId, { status: 'completed' });
    }
  },
  
  // Getters
  getTaskById: (taskId) => {
    return get().tasks.find(task => task.id === taskId);
  },
  
  getStepsByTaskId: (taskId) => {
    return get().steps
      .filter(step => step.taskId === taskId)
      .sort((a, b) => a.order - b.order);
  }
}));