// src/components/tasks/steps/GenericStepRenderer.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ITaskStep } from '@/utils/tasks/taskTypes';


interface GenericStepRendererProps {
  step: ITaskStep;
  taskId: string;
}

export const GenericStepRenderer: React.FC<GenericStepRendererProps> = ({ step }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{step.description}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Typ kroku:</h3>
            <p>{step.type}</p>
          </div>
          
          {step.input && (
            <div>
              <h3 className="text-sm font-medium">Dane wejściowe:</h3>
              <div className="bg-muted p-2 rounded-md whitespace-pre-wrap">
                {step.input}
              </div>
            </div>
          )}
          
          {step.output && (
            <div>
              <h3 className="text-sm font-medium">Wynik:</h3>
              <div className="bg-muted p-2 rounded-md whitespace-pre-wrap">
                {step.output}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium">Status:</h3>
            <div className={`inline-block px-2 py-1 text-xs rounded-full ${
              step.status === 'completed' ? 'bg-green-100 text-green-800' :
              step.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              step.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {step.status}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};