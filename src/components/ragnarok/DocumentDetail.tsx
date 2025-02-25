import { useState, useEffect } from 'react';

import { IContainer, IContainerDocument } from '@/utils/ragnarok/types';
import {  Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useDocumentStore } from '@/store/docStore';

interface DocumentDetailProps {
  container: IContainer | null;
  document: IContainerDocument | null;
}

export function DocumentDetail({ container, document }: DocumentDetailProps) {
  const { updateDocument } = useDocumentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
    }
  }, [document]);
  
  const handleSave = () => {
    if (!container || !document) return;
    
    updateDocument(container.id, document.id, {
      title,
      content
    });
    
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
    }
    setIsEditing(false);
  };
  
  if (!container || !document) {
    return (
      <div className="h-full">
        <div className="px-6 py-4">
          <h2 className="text-base font-semibold">Document Detail</h2>
        </div>
        <div className="flex h-[calc(100vh-240px)] items-center justify-center">
          <p className="text-sm text-muted-foreground">Select a document to view details</p>
        </div>
      </div>
    );
  }
  
  // Find the schema for this document
  const schema = container.schemas.find(s => s.id === document.schemaId);
  
  return (
    <div className="h-full">
      <div className="flex flex-row items-center justify-between px-6 py-4">
        <h2 className="text-base font-semibold">
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="max-w-md"
            />
          ) : (
            document.title
          )}
        </h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>
      <div className="px-6">
        <Tabs defaultValue="content">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="h-[calc(100vh-300px)] overflow-auto">
            {isEditing ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Document content"
              />
            ) : (
              <div className="whitespace-pre-wrap">
                {document.content}
              </div>
            )}
          </TabsContent>
          <TabsContent value="metadata" className="h-[calc(100vh-300px)] overflow-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Document Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">ID</div>
                  <div className="font-mono">{document.id}</div>
                  <div className="text-muted-foreground">Schema</div>
                  <div>{schema ? schema.name : 'Default'}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Custom Fields</h3>
                {Object.keys(document.customFields).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No custom fields defined</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(document.customFields).map(([key, value]) => (
                      <>
                        <div className="text-muted-foreground">{key}</div>
                        <div>{String(value)}</div>
                      </>
                    ))}
                  </div>
                )}
              </div>
              
              {schema && schema.fields.length > 0 && (
                <>
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Schema Definition</h3>
                    <div className="space-y-2">
                      {schema.fields.map((field) => (
                        <div key={field.name} className="rounded-md border p-3">
                          <div className="font-medium">{field.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Type: {field.type}
                            {field.required && ' (Required)'}
                            {field.defaultValue !== undefined && ` (Default: ${field.defaultValue})`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}