/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreator/ScenarioCreatorResult.tsx
import { Card, CardContent } from '@/components/ui/card';
import { ResultRendererProps } from '../types';
import { Badge } from '@/components/ui/badge';

export function ScenarioCreatorResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result) {
    return <div>No scenarios created</div>;
  }
  
  const { createdScenarios, timestamp } = result;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2">
          <h3 className="text-base font-semibold">Scenarios Created</h3>
          {createdScenarios && createdScenarios.length > 0 ? (
            <div className="mt-4 space-y-3">
              {createdScenarios.map((scenario: any, index: number) => (
                <div key={index} className="border p-3 rounded-md">
                  <div className="font-medium">{scenario.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{scenario.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Due:</span> {scenario.dueDate}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">ID:</span> {scenario.id}
                  </div>
                  {scenario.folderId && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Folder:</span> {scenario.folderId}
                    </div>
                  )}
                  <div className="flex mt-2 gap-2 flex-wrap">
                    {scenario.connections?.map((conn: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        Connection: {conn}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">No scenarios were created</p>
          )}
          
          <p className="text-xs text-muted-foreground mt-4">
            Completed on {new Date(timestamp).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
