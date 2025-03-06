// src/pages/scenarios/components/details/widgets/ScenarioChannelsWidget.tsx
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui';
import { Scenario } from '@/types';

interface ScenarioChannelsWidgetProps {
  scenario: Scenario;
}

export const ScenarioChannelsWidget: React.FC<ScenarioChannelsWidgetProps> = ({
  scenario
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Channels</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {scenario.channels && scenario.channels.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-1">
              {scenario.channels.map(channel => (
                <Badge key={channel} variant="outline" className="capitalize">
                  {channel}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Marketing channels</p>
          </>
        ) : (
          <>
            <div className="text-sm font-medium">None</div>
            <p className="text-xs text-muted-foreground">No channels defined</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};