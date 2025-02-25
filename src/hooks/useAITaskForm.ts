// src/hooks/useAITaskForm.ts
import React from 'react';
import { useTaskStore } from '../store/taskStore';

export const useAITaskForm = (containerId?: string) => {
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [templateId, setTemplateId] = React.useState<string>('');
    const [priority, setPriority] = React.useState<'low' | 'medium' | 'high'>('medium');
    
    const { templates, createTaskWithAI } = useTaskStore();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) return;
        
        try {
            await createTaskWithAI(title, description, containerId, templateId);
            // Wyczyść formularz
            setTitle('');
            setDescription('');
            setTemplateId('');
            setPriority('medium');
        } catch (error) {
            console.error("Błąd podczas tworzenia zadania:", error);
        }
    };
    
    return {
        title,
        setTitle,
        description,
        setDescription,
        templateId,
        setTemplateId,
        priority,
        setPriority,
        templates,
        handleSubmit
    };
};
