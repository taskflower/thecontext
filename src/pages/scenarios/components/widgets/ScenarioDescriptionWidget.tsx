// src/pages/scenarios/components/details/widgets/ScenarioDescriptionWidget.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scenario } from '@/types';

interface ScenarioDescriptionWidgetProps {
  scenario: Scenario;
}

export const ScenarioDescriptionWidget: React.FC<ScenarioDescriptionWidgetProps> = ({
  scenario
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        {scenario.description 
          ? <p>{scenario.description}</p>
          : <p className="text-muted-foreground">No description provided</p>
        }
        
        {scenario.objective && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700">Objective</h4>
            <p className="text-gray-600">{scenario.objective}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};