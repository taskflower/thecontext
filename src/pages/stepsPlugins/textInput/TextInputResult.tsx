// src/pages/stepsPlugins/textInput/TextInputResult.tsx
import { Card, CardContent } from '@/components/ui/card';
import { ResultRendererProps } from '../types';

export function TextInputResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result) {
    return <div>No input provided</div>;
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium mb-2">Text Input</h3>
        <p className="text-sm whitespace-pre-wrap border p-3 rounded-md bg-muted/50">
          {result.value}
        </p>
        
        {result.timestamp && (
          <p className="text-xs text-muted-foreground mt-2">
            Submitted on {new Date(result.timestamp).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}