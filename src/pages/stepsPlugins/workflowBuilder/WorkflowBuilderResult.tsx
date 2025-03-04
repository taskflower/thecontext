/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/workflowBuilder/WorkflowBuilderResult.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResultRendererProps } from '../types';

export function WorkflowBuilderResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result || !result.workflow) {
    return <div>No workflow generated</div>;
  }
  
  const workflow = result.workflow;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2">
          <h3 className="text-base font-semibold">Generated Workflow</h3>
          <p className="text-sm text-muted-foreground">
            {workflow.title}
          </p>
          <p className="text-xs text-muted-foreground">
            Generated on {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Workflow Steps:</h4>
          <div className="space-y-2">
            {workflow.steps.map((step: any, i: number) => (
              <div key={i} className="p-3 border rounded-md">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{i + 1}</Badge>
                    <h5 className="font-medium">{step.title}</h5>
                  </div>
                  <Badge>{step.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}