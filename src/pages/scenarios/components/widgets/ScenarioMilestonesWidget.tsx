import React from 'react';
import { Clock, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scenario } from '@/types';
import { Task } from '@/types';

interface ScenarioMilestonesWidgetProps {
  scenario: Scenario;
  tasks: Task[];
}

export const ScenarioMilestonesWidget: React.FC<ScenarioMilestonesWidgetProps> = ({
  scenario,
  tasks
}) => {
  // Generowanie danych kamieni milowych na podstawie zadań
  const milestones = tasks.length > 0 
    ? [
        { id: 1, title: 'Project Setup', date: scenario.startDate || scenario.dueDate, status: 'completed' },
        { id: 2, title: 'Halfway Point', date: scenario.dueDate, status: tasks.filter(t => t.status === 'completed').length >= tasks.length / 2 ? 'completed' : 'upcoming' },
        { id: 3, title: 'Project Completion', date: scenario.dueDate, status: scenario.progress === 100 ? 'completed' : 'upcoming' }
      ]
    : [];
    
  if (milestones.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  milestone.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {milestone.status === 'completed' ? (
                    <CheckSquare size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                </div>
                {index < milestones.length - 1 && (
                  <div className="w-0.5 h-10 bg-gray-200"></div>
                )}
              </div>
              <div className="pt-1">
                <p className="font-medium">{milestone.title}</p>
                <p className="text-sm text-muted-foreground">{milestone.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};