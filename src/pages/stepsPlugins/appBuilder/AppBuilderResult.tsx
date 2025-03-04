/* eslint-disable @typescript-eslint/no-explicit-any */
// AppBuilderResult.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResultRendererProps } from '../types';

export function AppBuilderResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result || !result.application) {
    return <div>No application generated</div>;
  }
  
  const app = result.application;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2">
          <h3 className="text-base font-semibold">Generated Application</h3>
          <p className="text-sm text-muted-foreground">
            {app.title}
          </p>
          <p className="text-xs text-muted-foreground">
            Generated on {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Application Tasks:</h4>
          <div className="space-y-2">
            {app.tasks.map((task: any, i: number) => (
              <div key={i} className="p-3 border rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{i + 1}</Badge>
                  <h5 className="font-medium">{task.title}</h5>
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <p className="text-xs mt-1">
                  <Badge variant="secondary" className="mr-1">
                    {task.steps.length} step{task.steps.length !== 1 ? 's' : ''}
                  </Badge>
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}