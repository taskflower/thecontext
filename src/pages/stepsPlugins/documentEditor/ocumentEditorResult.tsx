// src/pages/stepsPlugins/documentEditor/DocumentEditorResult.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { ResultRendererProps } from '../types';
import { useDataStore } from '@/store';

export function DocumentEditorResult({ step }: ResultRendererProps) {
  const result = step.result;
  const { getDocItem } = useDataStore();
  
  if (!result || !result.documentId) {
    return <div>No document created</div>;
  }
  
  // Try to get latest document data
  const document = getDocItem(result.documentId);
  
  // Use document from data store if available, otherwise use result data
  const title = document?.title || result.title;
  const content = document?.content || result.content;
  const tags = document?.metaKeys || result.tags || [];
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(document?.updatedAt || result.timestamp).toLocaleString()}
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText size={14} />
            <span>View Document</span>
          </Button>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 my-2">
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
        
        <div className="mt-4 p-3 border rounded-md max-h-32 overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap">{
            content.length > 300 
              ? content.substring(0, 300) + '...'
              : content
          }</pre>
        </div>
      </CardContent>
    </Card>
  );
}