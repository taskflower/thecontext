// src/pages/scenarios/components/widgets/ScenarioProgressWidget.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scenario } from '@/types';
import { useTaskStore } from '@/store';

interface ScenarioProgressWidgetProps {
  scenario: Scenario;
}

export const ScenarioProgressWidget: React.FC<ScenarioProgressWidgetProps> = ({ 
  scenario 
}) => {
  const { tasks } = useTaskStore();
  
  // Dynamicznie obliczamy statystyki zadań
  const scenarioTasks = tasks.filter(task => task.scenarioId === scenario.id);
  const completedTasks = scenarioTasks.filter(task => task.status === 'completed').length;
  const totalTasks = scenarioTasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm mb-2">
          <span className="font-medium">Overall Completion:</span>
          <span className="ml-2">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
          <div 
            className={`h-2 rounded-full ${
              progress === 100
                ? "bg-green-500"
                : progress > 60
                ? "bg-indigo-600"
                : progress > 30
                ? "bg-blue-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Tasks</p>
            <p className="font-bold">{completedTasks}/{totalTasks}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Connected Scenarios</p>
            <p className="font-bold">{scenario.connections?.length || 0}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Days Remaining</p>
            <p className="font-bold">
              {scenario.dueDate
                ? Math.max(0, Math.floor((new Date(scenario.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};