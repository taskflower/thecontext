/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/ScenarioCreatorLLMResult.tsx
import { Card, CardContent } from '@/components/ui/card';
import { ResultRendererProps } from '../types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ScenarioCreatorLLMResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result) {
    return <div>No scenarios created</div>;
  }
  
  const { createdScenarios, createdTasks, createdSteps, timestamp } = result;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="scenarios">
          <TabsList className="mb-4">
            <TabsTrigger value="scenarios">Scenarios ({createdScenarios?.length || 0})</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({createdTasks?.length || 0})</TabsTrigger>
            <TabsTrigger value="steps">Steps ({createdSteps?.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scenarios">
            <h3 className="text-base font-semibold mb-3">Created Scenarios</h3>
            {createdScenarios && createdScenarios.length > 0 ? (
              <div className="space-y-3">
                {createdScenarios.map((scenario: any, index: number) => (
                  <div key={index} className="border p-3 rounded-md">
                    <div className="font-medium">{scenario.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{scenario.description || 'No description'}</div>
                    {scenario.objective && (
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Objective:</span> {scenario.objective}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Due:</span> {scenario.dueDate}
                    </div>
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
              <p className="text-sm text-muted-foreground">No scenarios were created</p>
            )}
          </TabsContent>
          
          <TabsContent value="tasks">
            <h3 className="text-base font-semibold mb-3">Created Tasks</h3>
            {createdTasks && createdTasks.length > 0 ? (
              <div className="space-y-3">
                {createdTasks.map((task: any, index: number) => (
                  <div key={index} className="border p-3 rounded-md">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{task.description || 'No description'}</div>
                    <div className="text-xs mt-2 flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        Priority: {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Status: {task.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Scenario: {task.scenarioTitle || task.scenarioId}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks were created</p>
            )}
          </TabsContent>
          
          <TabsContent value="steps">
            <h3 className="text-base font-semibold mb-3">Created Steps</h3>
            {createdSteps && createdSteps.length > 0 ? (
              <div className="space-y-3">
                {createdSteps.map((step: any, index: number) => (
                  <div key={index} className="border p-3 rounded-md">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{step.description || 'No description'}</div>
                    <div className="text-xs mt-2 flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        Type: {step.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Task: {step.taskTitle || step.taskId}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No steps were created</p>
            )}
          </TabsContent>
        </Tabs>
        
        <p className="text-xs text-muted-foreground mt-4">
          Created on {new Date(timestamp).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}