// src/pages/stepsPlugins/llmResponse/LLMResponseResult.tsx
import { Card, CardContent } from '@/components/ui/card';
import { ResultRendererProps } from '../types';

export function LLMResponseResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result) {
    return <div>No response generated</div>;
  }
  
  const { response, timestamp, prompt } = result;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2">
          {prompt && (
            <div className="mb-3">
              <h4 className="text-sm font-medium">Prompt:</h4>
              <p className="text-sm text-muted-foreground">{prompt}</p>
            </div>
          )}
          
          <h3 className="text-sm font-medium">Response:</h3>
          
          <div className="mt-2 border p-3 rounded-md bg-muted/50">
            {typeof response === 'string' ? (
              <p className="text-sm whitespace-pre-wrap">{response}</p>
            ) : (
              <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[300px]">
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </div>
        </div>
        
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-2">
            Generated on {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}