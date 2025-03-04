// SimplePluginResult.tsx
import { Card, CardContent } from '@/components/ui/card';
import { ResultRendererProps } from '../types';

export function SimplePluginResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result) {
    return <div>No result available</div>;
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2">
          <h3 className="text-base font-semibold">{result.title || 'Simple Plugin'}</h3>
          <p className="text-xs text-muted-foreground">
            Completed on {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
