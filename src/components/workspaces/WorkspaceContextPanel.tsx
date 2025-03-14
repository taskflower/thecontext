/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/workspaces/WorkspaceContextPanel.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {  Edit, Save, X, Plus } from 'lucide-react';
import { JsonView } from '../shared/JsonView';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export const WorkspaceContextPanel: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspaceContext } = useWorkspaceStore();
  const workspace = getCurrentWorkspace();
  

  const [contextKey, setContextKey] = useState('');
  const [contextValue, setContextValue] = useState('');
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  if (!workspace) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-slate-500">
          No active workspace.
        </CardContent>
      </Card>
    );
  }
  
  const handleAddContext = () => {
    if (!contextKey.trim()) return;
    
    try {
      // Try to parse as JSON if possible
      let parsedValue;
      try {
        parsedValue = JSON.parse(contextValue);
      } catch {
        // If not valid JSON, use as string
        parsedValue = contextValue;
      }
      
      updateWorkspaceContext(workspace.id, {
        [contextKey]: parsedValue
      });
      
      setContextKey('');
      setContextValue('');
    } catch (error) {
      console.error('Error adding context:', error);
    }
  };
  
  const handleSaveEdit = (key: string) => {
    try {
      // Try to parse as JSON if possible
      let parsedValue;
      try {
        parsedValue = JSON.parse(editValue);
      } catch {
        // If not valid JSON, use as string
        parsedValue = editValue;
      }
      
      updateWorkspaceContext(workspace.id, {
        [key]: parsedValue
      });
      
      setEditKey(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating context:', error);
    }
  };
  
  const handleStartEdit = (key: string, value: any) => {
    setEditKey(key);
    setEditValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
  };
  
  const handleCancelEdit = () => {
    setEditKey(null);
    setEditValue('');
  };
  
  const contextEntries = Object.entries(workspace.context || {});
  
  return (
    
        <Tabs defaultValue="edit">
          <TabsList className="grid grid-cols-2 mb-4">
            
            <TabsTrigger value="edit">Edit Context</TabsTrigger>
            <TabsTrigger value="view">View Context</TabsTrigger>
          </TabsList>
          
          
          
          <TabsContent value="edit">
            <div className="space-y-4">
              {contextEntries.length === 0 ? (
                <div className="text-center py-2 text-slate-500">
                  No context data yet. Add your first context item below.
                </div>
              ) : (
                <div className="space-y-2">
                  {contextEntries.map(([key, value]) => (
                    <div key={key} className="border rounded-md p-2">
                      {editKey === key ? (
                        <div className="space-y-2">
                          <div className="font-medium text-sm">{key}</div>
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="font-mono text-sm"
                            rows={5}
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveEdit(key)}
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm px-1">{key}</div>
                            <div className="text-xs font-mono bg-slate-50 p-2 rounded mt-1 overflow-x-auto max-h-32">
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleStartEdit(key, value)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-2">Add New Context Item</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <Input
                    placeholder="Key"
                    value={contextKey}
                    onChange={(e) => setContextKey(e.target.value)}
                  />
                  <Input
                    placeholder="Value (string or JSON)"
                    value={contextValue}
                    onChange={(e) => setContextValue(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddContext}
                  disabled={!contextKey.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Context
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="view">
            {contextEntries.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                No context data yet. Add data using the Edit tab.
              </div>
            ) : (
              <JsonView data={workspace.context} />
            )}
          </TabsContent>
        </Tabs>
     
  );
};