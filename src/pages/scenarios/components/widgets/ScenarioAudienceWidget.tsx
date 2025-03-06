// src/pages/scenarios/components/details/widgets/ScenarioAudienceWidget.tsx
import React from 'react';
import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scenario } from '@/types';

interface ScenarioAudienceWidgetProps {
  scenario: Scenario;
}

export const ScenarioAudienceWidget: React.FC<ScenarioAudienceWidgetProps> = ({
  scenario
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Target Audience</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {scenario.target?.audience ? (
          <>
            <div className="text-sm line-clamp-2">{scenario.target.audience}</div>
            <p className="text-xs text-muted-foreground mt-1">Primary audience</p>
          </>
        ) : (
          <>
            <div className="text-sm font-medium">Not Specified</div>
            <p className="text-xs text-muted-foreground">Add target audience in settings</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};