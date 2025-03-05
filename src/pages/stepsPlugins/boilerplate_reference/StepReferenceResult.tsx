// src/pages/stepsPlugins/stepReference/StepReferenceResult.tsx
import { Card, CardContent } from '@/components/ui/card';
import { ResultRendererProps } from '../types';

export function StepReferenceResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result) {
    return <div>No data referenced</div>;
  }
  
  const { referencedData, referencedStepTitle, timestamp } = result;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2">
          <h3 className="text-sm font-medium">Referenced Data from: {referencedStepTitle}</h3>
          
          <div className="mt-2 border p-3 rounded-md bg-muted/50">
            {typeof referencedData === 'string' ? (
              <p className="text-sm whitespace-pre-wrap">{referencedData}</p>
            ) : (
              <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[300px]">
                {JSON.stringify(referencedData, null, 2)}
              </pre>
            )}
          </div>
        </div>
        
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-2">
            Referenced on {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}