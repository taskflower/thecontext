// src/components/ContainerAITaskIntegration.tsx
import { useContainerStore } from '@/store/containerStore';
import { useTaskStore } from '@/store/taskStore';
import React from 'react';
import { AITaskForm } from './AITaskForm';


interface ContainerAITaskIntegrationProps {
    containerId: string;
}

export const ContainerAITaskIntegration: React.FC<ContainerAITaskIntegrationProps> = ({ 
    containerId 
}) => {
    const { tasks, selectedTaskId, setSelectedTask } = useTaskStore();
    const { containers } = useContainerStore();
    
    // Filtruj zadania dla tego kontenera
    const containerTasks = tasks.filter(task => task.containerId === containerId);
    const container = containers.find(c => c.id === containerId);
    
    if (!container) return null;
    
    return (
        <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Zadania AI dla kontenera {container.name}</h3>
            
            {containerTasks.length > 0 ? (
                <div className="space-y-2">
                    {containerTasks.map(task => (
                        <div 
                            key={task.id}
                            className={`p-3 border rounded cursor-pointer ${
                                selectedTaskId === task.id ? 'border-blue-500 bg-blue-50' : ''
                            }`}
                            onClick={() => setSelectedTask(task.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">{task.title}</h4>
                                    <p className="text-sm text-gray-600 truncate">{task.description}</p>
                                </div>
                                <span 
                                    className={`px-2 py-1 text-xs rounded ${
                                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        task.status === 'failed' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {task.status === 'pending' ? 'Oczekujące' :
                                    task.status === 'in_progress' ? 'W trakcie' :
                                    task.status === 'completed' ? 'Zakończone' :
                                    'Niepowodzenie'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">Brak zadań AI dla tego kontenera</p>
            )}
            
            <div className="mt-4">
                <AITaskForm containerId={containerId} />
            </div>
        </div>
    );
};
