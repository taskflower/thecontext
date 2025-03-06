// src/pages/scenarios/components/details/widgets/ScenarioStatusWidget.tsx
import React from 'react';
import { BarChart3, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scenario } from '@/types';

interface ScenarioStatusWidgetProps {
  scenario: Scenario;
  tasksCount: number;
}

export const ScenarioStatusWidget: React.FC<ScenarioStatusWidgetProps> = ({
  scenario,
  tasksCount
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Tasks Status</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{scenario.completedTasks}/{scenario.tasks}</div>
        <p className="text-xs text-muted-foreground">Tasks completed</p>
        {tasksCount > 0 && (
          <div className="mt-2 flex items-center space-x-2">
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-xs">
              {Math.round((scenario.completedTasks / scenario.tasks) * 100) || 0}% completion rate
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};