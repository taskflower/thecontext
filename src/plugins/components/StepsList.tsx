// src/components/StepsList.tsx
import React from 'react';
import { StepConfig } from '@/plugins/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, PlayCircle, CheckCircle, SkipForward, AlertCircle } from 'lucide-react';

interface StepsListProps {
  steps: StepConfig[];
  onExecuteStep: (index: number) => void;
  onEditStep: (stepId: string) => void;
}

export function StepsList({ 
  steps, 
  onExecuteStep, 
  onEditStep 
}: StepsListProps) {
  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ukończony
          </Badge>
        );
      case 'skipped':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <SkipForward className="h-3 w-3 mr-1" />
            Pominięty
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Błąd
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            W trakcie
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Oczekujący
          </Badge>
        );
    }
  };
  
  // Posortuj kroki według kolejności
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  
  return (
    <div className="divide-y">
      {sortedSteps.map((step, index) => (
        <div 
          key={step.id} 
          className="p-4 hover:bg-muted/10 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                {index + 1}
              </div>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                {step.description && (
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(step.status)}
              <Badge variant="outline">{step.type}</Badge>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEditStep(step.id)}
                title="Edytuj krok"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onExecuteStep(index)}
                title="Wykonaj krok"
                disabled={step.status === 'completed'}
              >
                <PlayCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Wynik kroku, jeśli istnieje */}
          {step.result && (
            <div className="mt-2 pl-11 border-l-2 border-primary/30">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Wynik:
              </div>
              <div className="text-sm border rounded p-2 bg-muted/30 max-h-32 overflow-auto">
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(step.result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}