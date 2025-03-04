// src/pages/stepsPlugins/llmGenerator/LLMGeneratorResult.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { ResultRendererProps } from '../types';

export function LLMGeneratorResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result || !result.content) {
    return <div>No generated content available</div>;
  }
  
  // Function to find documents linked to this generation
  const findDocumentLink = () => {
    if (!result.documentId) return null;
    return {
      id: result.documentId,
      title: result.documentTitle || 'Generated Document'
    };
  };
  
  const documentLink = findDocumentLink();
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2">
          <h3 className="text-base font-semibold">Generated Content</h3>
          <p className="text-xs text-muted-foreground">
            Generated on {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        
        <div className="mt-2 p-3 bg-muted/50 rounded-md">
          <p className="text-xs text-muted-foreground mb-1">Prompt:</p>
          <p className="text-sm">{result.prompt}</p>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium">Content Preview</h4>
            {documentLink && (
              <Button variant="ghost" size="sm" className="h-7 flex items-center gap-2">
                <FileText size={14} />
                <span className="text-xs">View Document</span>
              </Button>
            )}
          </div>
          
          <div className="p-3 border rounded-md max-h-32 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap">{result.content.substring(0, 500)}...</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}