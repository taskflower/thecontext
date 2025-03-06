// src/pages/scenarios/components/widgets/ScenarioStatusWidget.tsx
import React from 'react';
import { BarChart3, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scenario } from '@/types';
import { useTaskStore } from '@/store';

interface ScenarioStatusWidgetProps {
  scenario: Scenario;
}

export const ScenarioStatusWidget: React.FC<ScenarioStatusWidgetProps> = ({
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Tasks Status</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
        <p className="text-xs text-muted-foreground">Tasks completed</p>
        {totalTasks > 0 && (
          <div className="mt-2 flex items-center space-x-2">
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-xs">
              {progress}% completion rate
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};