// plugins/example-input/ExampleResult.tsx

import { Card, CardContent } from "@/components/ui";
import { StepResultProps } from "../../modules/pluginSystem/types";


export function ExampleResult({ step }: StepResultProps) {
  const result = step.result;
  
  if (!result) {
    return <div>No data entered</div>;
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium mb-2">Entered Value</h3>
        <p className="text-sm whitespace-pre-wrap border p-3 rounded-md bg-muted/50">
          {result.value}
        </p>
        
        {result.timestamp && (
          <p className="text-xs text-muted-foreground mt-2">
            Submitted: {new Date(result.timestamp).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}