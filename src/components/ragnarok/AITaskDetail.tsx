/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/AITaskDetail.tsx
import { useContainerStore } from '@/store/containerStore';
import { useTaskStore } from '@/store/taskStore';
import React from 'react';


export const AITaskDetail: React.FC = () => {
    const { 
        tasks, 
        selectedTaskId, 
        updateTask, 
        executeTaskStep,
        executeAllTaskSteps,
        suggestDocumentsForTask
    } = useTaskStore();
    
    const { containers } = useContainerStore();
    
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) {
        return <div className="p-4 text-center text-gray-500">Wybierz zadanie</div>;
    }
    
    const container = task.containerId 
        ? containers.find(c => c.id === task.containerId)
        : undefined;
        
    const relatedDocuments = task.containerId && container && task.relatedDocumentIds
        ? container.documents.filter(doc => task.relatedDocumentIds.includes(doc.id))
        : [];
        
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold">{task.title}</h2>
                <p className="text-gray-700 mt-2">{task.description}</p>
                
                <div className="flex mt-4 space-x-4">
                    <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <select
                            value={task.status}
                            onChange={(e) => updateTask(task.id, { 
                                status: e.target.value as any 
                            })}
                            className="ml-2 border rounded p-1"
                        >
                            <option value="pending">Oczekujące</option>
                            <option value="in_progress">W trakcie</option>
                            <option value="completed">Zakończone</option>
                            <option value="failed">Niepowodzenie</option>
                        </select>
                    </div>
                    
                    <div>
                        <span className="text-sm text-gray-500">Priorytet:</span>
                        <select
                            value={task.priority}
                            onChange={(e) => updateTask(task.id, { 
                                priority: e.target.value as any 
                            })}
                            className="ml-2 border rounded p-1"
                        >
                            <option value="low">Niski</option>
                            <option value="medium">Średni</option>
                            <option value="high">Wysoki</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Powiązane dokumenty */}
            <div className="mt-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Powiązane dokumenty</h3>
                    <button
                        onClick={() => suggestDocumentsForTask(task.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Sugeruj dokumenty
                    </button>
                </div>
                
                {relatedDocuments.length > 0 ? (
                    <div className="mt-2 space-y-2">
                        {relatedDocuments.map(doc => (
                            <div key={doc.id} className="p-2 border rounded">
                                <h4 className="font-medium">{doc.title}</h4>
                                <p className="text-sm text-gray-600 truncate">{doc.content}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 mt-2">Brak powiązanych dokumentów</p>
                )}
            </div>
            
            {/* Kroki zadania */}
            <div>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Kroki zadania</h3>
                    <button
                        onClick={() => executeAllTaskSteps(task.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Wykonaj wszystkie kroki
                    </button>
                </div>
                
                <div className="mt-4 space-y-4">
                    {task.steps.length > 0 ? (
                        [...task.steps]
                            .sort((a, b) => a.order - b.order)
                            .map(step => (
                                <div key={step.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">
                                                {step.order}. {step.description}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Typ: {step.type}
                                            </p>
                                            <span 
                                                className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                                                    step.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    step.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {step.status === 'pending' ? 'Oczekujący' :
                                                step.status === 'completed' ? 'Zakończony' :
                                                'Niepowodzenie'}
                                            </span>
                                        </div>
                                        
                                        <button
                                            onClick={() => executeTaskStep(task.id, step.id)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            disabled={step.status === 'completed'}
                                        >
                                            {step.status === 'completed' ? 'Wykonano' : 'Wykonaj'}
                                        </button>
                                    </div>
                                    
                                    {step.input && (
                                        <div className="mt-3">
                                            <h5 className="text-sm font-medium">Wejście:</h5>
                                            <p className="text-sm bg-gray-50 p-2 rounded mt-1">{step.input}</p>
                                        </div>
                                    )}
                                    
                                    {step.output && (
                                        <div className="mt-3">
                                            <h5 className="text-sm font-medium">Wynik:</h5>
                                            <p className="text-sm bg-gray-50 p-2 rounded mt-1">{step.output}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                    ) : (
                        <p className="text-gray-500">Brak kroków w tym zadaniu</p>
                    )}
                </div>
            </div>
            
            {/* Wynik zadania */}
            {task.result && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium">Wynik</h3>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <p>{task.result}</p>
                    </div>
                </div>
            )}
        </div>
    );
};