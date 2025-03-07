/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/components/ResponsePreview.tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

interface ResponsePreviewProps {
  llmResponse: any;
  creationStatus: string;
  results: {
    scenarios: any[];
    tasks: any[];
    steps: any[];
  };
}

export function ResponsePreview({ llmResponse, creationStatus, results }: ResponsePreviewProps) {
  if (!llmResponse) return null;

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4 bg-muted/20">
        <h3 className="text-sm font-medium mb-2">LLM Generated Content Preview</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Scenarios:</span> {llmResponse.scenarios.length}
          </div>
          <div>
            <span className="font-medium">Tasks:</span> {(llmResponse.tasks || []).length}
          </div>
          <div>
            <span className="font-medium">Steps:</span> {(llmResponse.steps || []).length}
          </div>
        </div>
      </div>
      
      {creationStatus === 'completed' && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Successfully created {results.scenarios.length} scenarios, {' '}
            {results.tasks.length} tasks, and {' '}
            {results.steps.length} steps.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}