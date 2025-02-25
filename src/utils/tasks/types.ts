/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/tasks/types.ts
export interface IAITask {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;
    containerId?: string; // Powiązanie z kontenerem dokumentów
    relatedDocumentIds: string[]; // Dokumenty używane jako kontekst
    steps: IAITaskStep[];
    result?: string;
    metadata: Record<string, any>;
}

export interface IAITaskStep {
    id: string;
    taskId: string;
    order: number;
    type: 'retrieval' | 'processing' | 'generation' | 'validation';
    status: 'pending' | 'completed' | 'failed';
    description: string;
    input?: string;
    output?: string;
    contextDocumentIds?: string[]; // ID dokumentów używanych w tym kroku
    metadata: Record<string, any>;
}

export interface IAITaskTemplate {
    id: string;
    name: string;
    description: string;
    defaultSteps: Omit<IAITaskStep, 'id' | 'taskId' | 'status' | 'input' | 'output'>[];
    defaultPriority: IAITask['priority'];
}