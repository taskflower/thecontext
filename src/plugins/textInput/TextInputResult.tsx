// src/plugins/textInput/TextInputResult.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StepResultProps } from '../types';

export function TextInputResult({ step }: StepResultProps) {
  const result = step.result;
  
  if (!result) {
    return <div>Brak wprowadzonych danych</div>;
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium mb-2">Wprowadzony tekst</h3>
        <p className="text-sm whitespace-pre-wrap border p-3 rounded-md bg-muted/50">
          {result.value}
        </p>
        
        {result.timestamp && (
          <p className="text-xs text-muted-foreground mt-2">
            Wprowadzono: {new Date(result.timestamp).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}