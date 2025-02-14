/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { PluginRuntimeProps } from '../base';
import { PickerDocConfig, PickerDocRuntimeData } from './types';
import { Document } from '@/types/document';
import { useDocumentsStore } from '@/store/documentsStore';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

export const RuntimeComponent: React.FC<PluginRuntimeProps> = ({
  config,
  data,
  onDataChange,
  onStatusChange,
}) => {
  const pickerConfig = config as PickerDocConfig;
  const { documents } = useDocumentsStore();
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  // Filter documents based on container if specified
  const filteredDocuments = documents.filter((doc) => 
    pickerConfig.containerId === 'all' || doc.documentContainerId === pickerConfig.containerId
  );

  useEffect(() => {
    // Initialize selected documents from data if it exists
    if (data?.selectedDocuments) {
      setSelectedDocs(new Set(data.selectedDocuments.map((doc: { id: string; }) => doc.id)));
    }
  }, [data?.selectedDocuments]);

  useEffect(() => {
    // Always valid if at least one document is selected
    onStatusChange(selectedDocs.size > 0);
  }, [selectedDocs, onStatusChange]);

  const handleDocumentToggle = (document: Document) => {
    const newSelectedDocs = new Set(selectedDocs);
    
    if (newSelectedDocs.has(document.id)) {
      newSelectedDocs.delete(document.id);
    } else {
      newSelectedDocs.add(document.id);
    }
    
    setSelectedDocs(newSelectedDocs);

    // Update runtime data
    const newData: PickerDocRuntimeData = {
      selectedDocuments: filteredDocuments
        .filter(doc => newSelectedDocs.has(doc.id))
        .map(doc => ({
          id: doc.id,
          content: doc.content
        }))
    };
    
    onDataChange(newData);
  };

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={document.id}
                checked={selectedDocs.has(document.id)}
                onCheckedChange={() => handleDocumentToggle(document)}
              />
              <label
                htmlFor={document.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {document.title}
              </label>
            </div>
          </Card>
        ))}
        {filteredDocuments.length === 0 && (
          <div className="text-center text-muted-foreground">
            No documents available in the selected container
          </div>
        )}
      </div>
    </ScrollArea>
  );
};