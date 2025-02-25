// src/components/AITaskList.tsx
import { useContainerStore } from '@/store/containerStore';
import { useTaskStore } from '@/store/taskStore';
import React from 'react';

export const AITaskList: React.FC = () => {
    const { tasks, selectedTaskId, setSelectedTask, removeTask } = useTaskStore();
    const { containers } = useContainerStore();
    
    if (!tasks || tasks.length === 0) {
        return <div className="p-4 text-center text-gray-500">Brak zadań</div>;
    }
    
    return (
        <div className="space-y-2">
            {tasks.map(task => {
                if (!task || !task.id) return null;
                
                const container = task.containerId 
                    ? containers.find(c => c.id === task.containerId)
                    : undefined;
                    
                return (
                    <div 
                        key={task.id}
                        className={`p-4 border rounded-lg cursor-pointer ${
                            selectedTaskId === task.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedTask(task.id)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium">{task.title}</h3>
                                <p className="text-sm text-gray-600">{task.description}</p>
                                
                                {container && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Kontener: {container.name}
                                    </p>
                                )}
                                
                                <div className="flex mt-2 space-x-2">
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
                                    
                                    <span 
                                        className={`px-2 py-1 text-xs rounded ${
                                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}
                                    >
                                        {task.priority === 'high' ? 'Wysoki priorytet' :
                                         task.priority === 'medium' ? 'Średni priorytet' :
                                         'Niski priorytet'}
                                    </span>
                                </div>
                            </div>
                            
                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeTask(task.id);
                                }}
                                aria-label="Usuń zadanie"
                            >
                                Usuń
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};