/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/llmScenarioGenerator/LLMScenarioGeneratorResult.tsx
import { Card, CardContent } from '@/components/ui/card';
import { ResultRendererProps } from '../types';
import { Badge } from '@/components/ui/badge';

export function LLMScenarioGeneratorResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result) {
    return <div>No scenarios generated</div>;
  }
  
  const { scenarios = [], tasks = [], steps = [], timestamp } = result;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2">
          <h3 className="text-base font-semibold">Generated Content</h3>
          
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium">Scenarios Generated: {scenarios.length}</h4>
              {scenarios.length > 0 && (
                <div className="mt-2 space-y-3">
                  {scenarios.map((scenario: any, index: number) => (
                    <div key={index} className="border p-3 rounded-md">
                      <div className="font-medium">{scenario.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{scenario.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Due:</span> {scenario.dueDate}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">ID:</span> {scenario.id}
                      </div>
                      <div className="flex mt-2 gap-2 flex-wrap">
                        {scenario.connections?.map((conn: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            Connected: {conn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {tasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">Tasks Generated: {tasks.length}</h4>
                <div className="mt-2 space-y-2">
                  {tasks.map((task: any, index: number) => (
                    <div key={index} className="border p-2 rounded-md bg-muted/30">
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-muted-foreground">For scenario: {task.scenarioTitle}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {steps.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">Steps Generated: {steps.length}</h4>
                <div className="text-xs text-muted-foreground mt-1">
                  Steps were added to tasks
                </div>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Completed on {new Date(timestamp).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}