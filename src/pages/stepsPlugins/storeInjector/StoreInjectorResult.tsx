/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/storeInjector/StoreInjectorResult.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResultRendererProps } from '../types';
import { Check, FileText, ListTodo, ListChecks, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function StoreInjectorResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result) {
    return <div>No data injected</div>;
  }
  
  const { injectedItems, count, entityType, storeMethod, timestamp } = result;
  
  // Icons for different entity types
  const entityIcons: Record<string, React.ReactNode> = {
    scenario: <FileText className="h-4 w-4 text-blue-500" />,
    task: <ListTodo className="h-4 w-4 text-amber-500" />,
    step: <ListChecks className="h-4 w-4 text-purple-500" />,
    document: <File className="h-4 w-4 text-green-500" />
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-base font-medium">
              {count} {entityType}{count !== 1 ? 's' : ''} saved
            </h3>
          </div>
          
          <Badge variant="outline" className="font-mono text-xs">
            {storeMethod}
          </Badge>
        </div>
        
        <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
          {injectedItems?.map((item: any, index: number) => (
            <div key={index} className="p-2 border rounded-md flex items-center">
              {entityIcons[entityType] || <File className="h-4 w-4 text-muted-foreground mr-2" />}
              <span className="text-sm">
                {item.title || item.name || `${entityType} ${index + 1}`}
              </span>
            </div>
          ))}
        </div>
        
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-4">
            Injected on {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}        