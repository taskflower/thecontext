// src/pages/scenarios/components/widgets/ScenarioStatusWidget.tsx
import { BarChart3, CheckCircle } from 'lucide-react';
import scenarioService from '../../services/ScenarioService';
import { Scenario } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface ScenarioStatusWidgetProps {
  scenario: Scenario;
}

export const ScenarioStatusWidget: React.FC<ScenarioStatusWidgetProps> = ({
  scenario
}) => {
  // Pobieranie statystyk przez serwis
  const { completedTasks, totalTasks, progress } = scenarioService.getScenarioStats(scenario.id);

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