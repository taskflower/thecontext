// src/utils/tasks/taskUtils.ts
import { IAITask, IAITaskStep, IAITaskTemplate } from './types';
import { IContainer, IContainerDocument } from '../containers/types';

export class AITaskManager {
    createTask(
        title: string, 
        description: string, 
        containerId?: string, 
        templateId?: string,
        templates?: IAITaskTemplate[]
    ): IAITask {
        const now = new Date();
        let steps: IAITaskStep[] = [];
        
        // Jeśli podano szablon, użyj jego kroków
        if (templateId && templates) {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                steps = template.defaultSteps.map((stepTemplate, idx) => ({
                    ...stepTemplate,
                    id: this.generateId(),
                    taskId: '', // Tymczasowo puste, uzupełnione po utworzeniu zadania
                    status: 'pending',
                     metadata: { ...stepTemplate.metadata }
                }));
            }
        }
        
        const task: IAITask = {
            id: this.generateId(),
            title,
            description,
            status: 'pending',
            priority: templateId && templates 
                ? templates.find(t => t.id === templateId)?.defaultPriority || 'medium'
                : 'medium',
            createdAt: now,
            updatedAt: now,
            containerId,
            relatedDocumentIds: [],
            steps: [],
            metadata: {}
        };
        
        // Uzupełnij taskId we wszystkich krokach
        task.steps = steps.map(step => ({
            ...step,
            taskId: task.id
        }));
        
        return task;
    }
    
    generateId(): string {
        return Math.random().toString(36).substring(2, 15);
    }
    
    /**
     * Pobiera dokumenty powiązane z zadaniem jako kontekst
     */
    getRelatedDocuments(task: IAITask, containers: IContainer[]): IContainerDocument[] {
        if (!task.containerId) return [];
        
        const container = containers.find(c => c.id === task.containerId);
        if (!container) return [];
        
        if (task.relatedDocumentIds.length > 0) {
            return container.documents.filter(doc => 
                task.relatedDocumentIds.includes(doc.id)
            );
        }
        
        // Jeśli nie ma konkretnych dokumentów, zwróć wszystkie z kontenera
        return container.documents;
    }
    
    /**
     * Pobiera dokumenty dla konkretnego kroku
     */
    getStepDocuments(
        step: IAITaskStep, 
        task: IAITask, 
        containers: IContainer[]
    ): IContainerDocument[] {
        if (!step.contextDocumentIds || step.contextDocumentIds.length === 0) {
            // Jeśli krok nie ma określonych dokumentów, użyj dokumentów z całego zadania
            return this.getRelatedDocuments(task, containers);
        }
        
        if (!task.containerId) return [];
        
        const container = containers.find(c => c.id === task.containerId);
        if (!container) return [];
        
        return container.documents.filter(doc => 
            step.contextDocumentIds?.includes(doc.id)
        );
    }
    
    /**
     * Automatycznie dobiera dokumenty do zadania na podstawie tytułu i opisu
     */
    async suggestRelatedDocuments(
        task: IAITask,
        containers: IContainer[],
        aiFunction: (query: string, documents: IContainerDocument[]) => Promise<string[]>
    ): Promise<string[]> {
        if (!task.containerId) return [];
        
        const container = containers.find(c => c.id === task.containerId);
        if (!container || container.documents.length === 0) return [];
        
        const query = `${task.title}. ${task.description}`;
        return aiFunction(query, container.documents);
    }
    
    /**
     * Wykonuje krok zadania
     */
    async executeStep(
        step: IAITaskStep,
        task: IAITask,
        containers: IContainer[],
        aiProcessFunction: (stepType: IAITaskStep['type'], input: string, context: IContainerDocument[]) => Promise<string>
    ): Promise<IAITaskStep> {
        try {
            const contextDocs = this.getStepDocuments(step, task, containers);
            const input = step.input || task.description;
            
            const output = await aiProcessFunction(
                step.type,
                input,
                contextDocs
            );
            
            return {
                ...step,
                status: 'completed',
                output
            };
        } catch (error) {
            return {
                ...step,
                status: 'failed',
                output: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}