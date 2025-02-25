// src/hooks/useAITaskWithDocumentGeneration.ts
import{ useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useContainerStore } from '../store/containerStore';
import { IContainerDocument } from '../utils/containers/types';

export const useAITaskWithDocumentGeneration = (containerId: string) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDocument, setGeneratedDocument] = useState<Partial<IContainerDocument> | null>(null);
    
    const { createTaskWithAI, tasks, executeAllTaskSteps } = useTaskStore();
    const { addDocument } = useContainerStore();
    
    const generateDocumentFromContext = async (
        title: string, 
        description: string,
        schemaId: string
    ) => {
        setIsGenerating(true);
        try {
            // Utwórz zadanie AI z szablonu do generowania dokumentów
            const taskId = await createTaskWithAI(
                `Generowanie dokumentu: ${title}`,
                description,
                containerId,
                'document-generation' // ID szablonu do generowania dokumentów
            );
            
            // Wykonaj wszystkie kroki zadania
            await executeAllTaskSteps(taskId);
            
            // Pobierz wyniki zadania
            const task = tasks.find(t => t.id === taskId);
            if (!task) throw new Error("Nie znaleziono zadania");
            
            // Znajdź krok generacji
            const generationStep = task.steps.find(s => s.type === 'generation');
            if (!generationStep || !generationStep.output) {
                throw new Error("Brak wygenerowanej zawartości");
            }
            
            // Przygotuj dokument
            const newDocument: Partial<IContainerDocument> = {
                title,
                content: generationStep.output,
                customFields: {},
                schemaId
            };
            
            setGeneratedDocument(newDocument);
            return newDocument;
        } catch (error) {
            console.error("Błąd podczas generowania dokumentu:", error);
            throw error;
        } finally {
            setIsGenerating(false);
        }
    };
    
    const saveGeneratedDocument = () => {
        if (!generatedDocument || !generatedDocument.title || !generatedDocument.content) {
            return;
        }
        
        const newDocument: IContainerDocument = {
            id: Math.random().toString(36).substr(2, 9),
            title: generatedDocument.title,
            content: generatedDocument.content,
            customFields: generatedDocument.customFields || {},
            schemaId: generatedDocument.schemaId || ''
        };
        
        addDocument(containerId, newDocument);
        setGeneratedDocument(null);
        
        return newDocument.id;
    };
    
    return {
        isGenerating,
        generatedDocument,
        generateDocumentFromContext,
        saveGeneratedDocument
    };
};