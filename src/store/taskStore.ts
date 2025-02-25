// src/store/taskStore.ts
import { create } from 'zustand';
import { IAITask, IAITaskStep, IAITaskTemplate } from '../utils/tasks/types';
import { AITaskManager } from '../utils/tasks/taskUtils';
import { AIService } from '../utils/tasks/aiService';
import { useContainerStore } from './containerStore';

interface TaskState {
    tasks: IAITask[];
    templates: IAITaskTemplate[];
    selectedTaskId: string | null;
    taskManager: AITaskManager;
    aiService: AIService;
    
    // Actions
    addTask: (task: IAITask) => void;
    removeTask: (taskId: string) => void;
    updateTask: (taskId: string, updates: Partial<IAITask>) => void;
    setSelectedTask: (taskId: string | null) => void;
    addTemplate: (template: IAITaskTemplate) => void;
    removeTemplate: (templateId: string) => void;
    
    // Task Step Actions
    addStep: (taskId: string, step: Omit<IAITaskStep, 'id' | 'taskId'>) => void;
    updateStep: (taskId: string, stepId: string, updates: Partial<IAITaskStep>) => void;
    removeStep: (taskId: string, stepId: string) => void;
    reorderSteps: (taskId: string, stepIds: string[]) => void;
    
    // AI Assisted Functions
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

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    templates: [
        {
            id: 'basic-research',
            name: 'Podstawowe badanie',
            description: 'Szablon do zbierania i analizy informacji z dokumentów',
            defaultSteps: [
                {
                    order: 1,
                    type: 'retrieval',
                    description: 'Wyszukaj relewantne informacje',
                    metadata: {}
                },
                {
                    order: 2,
                    type: 'processing',
                    description: 'Przeanalizuj znalezione informacje',
                    metadata: {}
                },
                {
                    order: 3,
                    type: 'generation',
                    description: 'Wygeneruj podsumowanie',
                    metadata: {}
                }
            ],
            defaultPriority: 'medium'
        },
        {
            id: 'document-generation',
            name: 'Generowanie dokumentów',
            description: 'Szablon do tworzenia nowych dokumentów na podstawie istniejących',
            defaultSteps: [
                {
                    order: 1,
                    type: 'retrieval',
                    description: 'Wyszukaj potrzebne informacje',
                    metadata: {}
                },
                {
                    order: 2,
                    type: 'generation',
                    description: 'Stwórz szkic dokumentu',
                    metadata: {}
                },
                {
                    order: 3,
                    type: 'validation',
                    description: 'Sprawdź poprawność dokumentu',
                    metadata: {}
                }
            ],
            defaultPriority: 'high'
        }
    ],
    selectedTaskId: null,
    taskManager: new AITaskManager(),
    aiService: new AIService(),
    
    // Actions
    addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, task] 
    })),
    
    removeTask: (taskId) => set((state) => ({ 
        tasks: state.tasks.filter((t) => t.id !== taskId),
        selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId
    })),
    
    updateTask: (taskId, updates) => set((state) => ({ 
        tasks: state.tasks.map((task) => 
            task.id === taskId 
                ? { ...task, ...updates, updatedAt: new Date() } 
                : task
        ) 
    })),
    
    setSelectedTask: (taskId) => set({ 
        selectedTaskId: taskId 
    }),
    
    addTemplate: (template) => set((state) => ({ 
        templates: [...state.templates, template] 
    })),
    
    removeTemplate: (templateId) => set((state) => ({ 
        templates: state.templates.filter((t) => t.id !== templateId) 
    })),
    
    // Task Step Actions
    addStep: (taskId, stepData) => set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return state;
        
        const newStep: IAITaskStep = {
            id: state.taskManager.generateId(),
            taskId,
            status: 'pending',
            ...stepData
        };
        
        return {
            tasks: state.tasks.map(task => 
                task.id === taskId
                    ? { 
                        ...task, 
                        steps: [...task.steps, newStep],
                        updatedAt: new Date()
                    }
                    : task
            )
        };
    }),
    
    updateStep: (taskId, stepId, updates) => set((state) => ({
        tasks: state.tasks.map(task => 
            task.id === taskId
                ? {
                    ...task,
                    steps: task.steps.map(step => 
                        step.id === stepId
                            ? { ...step, ...updates }
                            : step
                    ),
                    updatedAt: new Date()
                }
                : task
        )
    })),
    
    removeStep: (taskId, stepId) => set((state) => ({
        tasks: state.tasks.map(task => 
            task.id === taskId
                ? {
                    ...task,
                    steps: task.steps.filter(step => step.id !== stepId),
                    updatedAt: new Date()
                }
                : task
        )
    })),
    
    reorderSteps: (taskId, stepIds) => set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return state;
        
        const reorderedSteps = stepIds.map((stepId, index) => {
            const step = task.steps.find(s => s.id === stepId);
            if (!step) return null;
            return { ...step, order: index + 1 };
        }).filter(Boolean) as IAITaskStep[];
        
        // Zachowaj kroki, których nie ma w nowej kolejności
        const otherSteps = task.steps.filter(step => !stepIds.includes(step.id));
        
        return {
            tasks: state.tasks.map(t => 
                t.id === taskId
                    ? {
                        ...t,
                        steps: [...reorderedSteps, ...otherSteps].sort((a, b) => a.order - b.order),
                        updatedAt: new Date()
                    }
                    : t
            )
        };
    }),
    
    // AI Assisted Functions
    createTaskWithAI: async (title, description, containerId, templateId) => {
        const { taskManager, templates, addTask } = get();
        const task = taskManager.createTask(
            title, 
            description, 
            containerId, 
            templateId,
            templates
        );
        
        addTask(task);
        
        if (containerId) {
            // Automatycznie sugeruj dokumenty
            const containers = useContainerStore.getState().containers;
            const aiService = get().aiService;
            
            try {
                const docIds = await taskManager.suggestRelatedDocuments(
                    task,
                    containers,
                    (query, documents) => aiService.retrieveRelevantDocuments(query, documents)
                );
                
                get().updateTask(task.id, { 
                    relatedDocumentIds: docIds 
                });
            } catch (error) {
                console.error("Nie udało się sugerować dokumentów:", error);
            }
        }
        
        return task.id;
    },
    
    suggestDocumentsForTask: async (taskId) => {
        const { tasks, taskManager, aiService, updateTask } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.containerId) return;
        
        const containers = useContainerStore.getState().containers;
        
        try {
            const docIds = await taskManager.suggestRelatedDocuments(
                task,
                containers,
                (query, documents) => aiService.retrieveRelevantDocuments(query, documents)
            );
            
            updateTask(taskId, { 
                relatedDocumentIds: docIds 
            });
        } catch (error) {
            console.error("Nie udało się sugerować dokumentów:", error);
        }
    },
    
    executeTaskStep: async (taskId, stepId) => {
        const { tasks, taskManager, aiService, updateStep, updateTask } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const step = task.steps.find(s => s.id === stepId);
        if (!step) return;
        
        const containers = useContainerStore.getState().containers;
        
        try {
            const updatedStep = await taskManager.executeStep(
                step,
                task,
                containers,
                (stepType, input, context) => 
                    aiService.processTaskStep(stepType, input, context)
            );
            
            updateStep(taskId, stepId, updatedStep);
            
            // Zaktualizuj status zadania
            const allStepsCompleted = task.steps.every(s => 
                s.id === stepId 
                    ? updatedStep.status === 'completed'
                    : s.status === 'completed'
            );
            
            if (allStepsCompleted) {
                updateTask(taskId, { status: 'completed' });
            } else if (updatedStep.status === 'failed') {
                updateTask(taskId, { status: 'failed' });
            } else if (task.status === 'pending') {
                updateTask(taskId, { status: 'in_progress' });
            }
        } catch (error) {
            console.error(`Błąd podczas wykonywania kroku ${stepId}:`, error);
            updateStep(taskId, stepId, { 
                status: 'failed',
                output: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    
    executeAllTaskSteps: async (taskId) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Wykonaj kroki w kolejności
        const sortedSteps = [...task.steps].sort((a, b) => a.order - b.order);
        
        for (const step of sortedSteps) {
            await get().executeTaskStep(taskId, step.id);
            
            // Sprawdź czy poprzedni krok się powiódł
            const updatedTask = get().tasks.find(t => t.id === taskId);
            const updatedStep = updatedTask?.steps.find(s => s.id === step.id);
            
            if (!updatedStep || updatedStep.status === 'failed') {
                break; // Przerwij wykonywanie kolejnych kroków jeśli obecny się nie powiódł
            }
        }
    }
}));