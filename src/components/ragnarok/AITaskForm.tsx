/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/AITaskForm.tsx
import { useAITaskForm } from '@/hooks/useAITaskForm';
import React from 'react';


interface AITaskFormProps {
    containerId?: string;
}

export const AITaskForm: React.FC<AITaskFormProps> = ({ containerId }) => {
    const {
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
    } = useAITaskForm(containerId);
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Tytuł zadania
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Opis zadania
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            
            <div>
                <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                    Szablon
                </label>
                <select
                    id="template"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                    <option value="">Wybierz szablon</option>
                    {templates.map(template => (
                        <option key={template.id} value={template.id}>
                            {template.name}
                        </option>
                    ))}
                </select>
                
                {templateId && (
                    <p className="mt-1 text-sm text-gray-500">
                        {templates.find(t => t.id === templateId)?.description}
                    </p>
                )}
            </div>
            
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priorytet
                </label>
                <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                    <option value="low">Niski</option>
                    <option value="medium">Średni</option>
                    <option value="high">Wysoki</option>
                </select>
            </div>
            
            <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
                Utwórz zadanie
            </button>
        </form>
    );
};