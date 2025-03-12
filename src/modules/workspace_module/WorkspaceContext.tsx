/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/workspaces_module/WorkspaceContext.tsx
import React, { useState, useEffect } from 'react';
import { useWorkspaceStore, WorkspaceContext as WorkspaceContextType } from './workspaceStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  PencilIcon, 
  Plus, 
  Trash2,
  Info,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getContextIconComponent, 
  registerContextIcon, 
  availableIcons 
} from './components/contextIconService';
import ContextKeyIconSelector from './components/ContextKeyIconSelector';

interface WorkspaceContextProps {
  workspaceId: string;
}

const WorkspaceContext: React.FC<WorkspaceContextProps> = ({ workspaceId }) => {
  const { workspaces, updateWorkspaceContext } = useWorkspaceStore();
  const workspace = workspaces[workspaceId];
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContext, setEditedContext] = useState<WorkspaceContextType>({});
  const [contextMetadata, setContextMetadata] = useState<Record<string, string>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyIcon, setNewKeyIcon] = useState('box');
  const [valueType, setValueType] = useState<'string' | 'array' | 'object'>('string');
  const [addKeyDialogOpen, setAddKeyDialogOpen] = useState(false);
  
  // Initialize editedContext from workspace
  useEffect(() => {
    if (workspace) {
      setEditedContext(workspace.context || {});
    }
  }, [workspace]);
  
  // Initialize context metadata from existing context
  useEffect(() => {
    const initialMetadata: Record<string, string> = {};
    
    if (workspace && workspace.context) {
      Object.keys(workspace.context).forEach(key => {
        // Use the existing icon mapping if available
        const IconComponent = getContextIconComponent(key);
        // Find the icon key by comparing components
        const iconKey = Object.entries(availableIcons).find(
          ([_, Component]) => Component === IconComponent
        )?.[0] || 'box';
        
        initialMetadata[key] = iconKey;
      });
    }
    
    setContextMetadata(initialMetadata);
  }, [workspace, isEditing]);
  
  if (!workspace) {
    return <div className="p-4 text-center text-slate-500 border border-dashed rounded-md">Workspace not found</div>;
  }
  
  const handleSaveContext = () => {
    // Also save the icon mappings
    Object.entries(contextMetadata).forEach(([key, iconKey]) => {
      registerContextIcon(key, iconKey);
    });
    
    updateWorkspaceContext(workspaceId, editedContext);
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditedContext(workspace.context || {});
    setIsEditing(false);
  };
  
  const handleAddKey = () => {
    if (newKeyName.trim()) {
      let parsedValue: string | string[] | object = newKeyValue;
      
      if (valueType === 'array') {
        parsedValue = newKeyValue.split(',').map(item => item.trim()).filter(Boolean);
      } else if (valueType === 'object') {
        try {
          parsedValue = JSON.parse(newKeyValue);
        } catch {
          // If parsing fails, keep as string
        }
      }
      
      setEditedContext(prev => ({
        ...prev,
        [newKeyName.trim()]: parsedValue
      }));
      
      // Save the icon selection for this key
      setContextMetadata(prev => ({
        ...prev,
        [newKeyName.trim()]: newKeyIcon
      }));
      
      // Reset the form
      setNewKeyName('');
      setNewKeyValue('');
      setNewKeyIcon('box');
      setValueType('string');
      setAddKeyDialogOpen(false);
    }
  };
  
  const handleRemoveKey = (key: string) => {
    setEditedContext(prev => {
      const newContext = { ...prev };
      delete newContext[key];
      return newContext;
    });
    
    setContextMetadata(prev => {
      const newMetadata = { ...prev };
      delete newMetadata[key];
      return newMetadata;
    });
  };
  
  const handleChangeKeyIcon = (key: string, iconKey: string) => {
    setContextMetadata(prev => ({
      ...prev,
      [key]: iconKey
    }));
  };

  const renderValueInput = () => {
    switch (valueType) {
      case 'array':
        return (
          <Textarea 
            value={newKeyValue} 
            onChange={(e) => setNewKeyValue(e.target.value)} 
            placeholder="Enter comma-separated values"
            className="min-h-20"
          />
        );
      case 'object':
        return (
          <Textarea 
            value={newKeyValue} 
            onChange={(e) => setNewKeyValue(e.target.value)} 
            placeholder='{"key": "value"}'
            className="min-h-20 font-mono text-sm"
          />
        );
      default:
        return (
          <Input 
            value={newKeyValue} 
            onChange={(e) => setNewKeyValue(e.target.value)} 
            placeholder="Value"
          />
        );
    }
  };
  
  const renderEditableContext = () => {
    return (
      <div className="space-y-4 p-1">
        {Object.entries(editedContext).map(([key, value]) => (
          <Card key={key} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-32">
                      <ContextKeyIconSelector
                        selectedIcon={contextMetadata[key] || 'box'}
                        onSelectIcon={(iconKey) => handleChangeKeyIcon(key, iconKey)}
                      />
                    </div>
                    <span className="text-sm font-medium">{key}</span>
                  </div>
                  {typeof value === 'string' ? (
                    <Input 
                      value={value} 
                      onChange={(e) => setEditedContext(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))} 
                    />
                  ) : Array.isArray(value) ? (
                    <Textarea 
                      value={value.join(', ')} 
                      onChange={(e) => setEditedContext(prev => ({
                        ...prev,
                        [key]: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                      }))} 
                      placeholder="Enter comma-separated values"
                      className="min-h-20"
                    />
                  ) : (
                    <Textarea 
                      value={JSON.stringify(value, null, 2)} 
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setEditedContext(prev => ({
                            ...prev,
                            [key]: parsed
                          }));
                        } catch {
                          setEditedContext(prev => ({
                            ...prev,
                            [key]: e.target.value
                          }));
                        }
                      }}
                      className="min-h-20 font-mono text-sm" 
                    />
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveKey(key)}
                  className="h-8 w-8 text-slate-400 hover:text-red-500"
                  aria-label="Remove key"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button 
          variant="outline" 
          onClick={() => setAddKeyDialogOpen(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Context Key
        </Button>
        
        <div className="flex gap-2 pt-4 justify-end">
          <Button variant="outline" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button onClick={handleSaveContext}>
            Save Changes
          </Button>
        </div>

        {/* Add Key Dialog */}
        <Dialog open={addKeyDialogOpen} onOpenChange={setAddKeyDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Context Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                <div className="w-12 flex justify-center">
                  <span className="text-sm text-slate-500">Icon</span>
                </div>
                <div className="flex-1">
                  <ContextKeyIconSelector
                    selectedIcon={newKeyIcon}
                    onSelectIcon={setNewKeyIcon}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                <div className="w-12 flex justify-center">
                  <span className="text-sm text-slate-500">Key</span>
                </div>
                <Input 
                  value={newKeyName} 
                  onChange={(e) => setNewKeyName(e.target.value)} 
                  placeholder="Key name"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                <div className="w-12 flex justify-center">
                  <span className="text-sm text-slate-500">Type</span>
                </div>
                <Select value={valueType} onValueChange={(val) => setValueType(val as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Value type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                <div className="w-12 flex justify-center">
                  <span className="text-sm text-slate-500 pt-2">Value</span>
                </div>
                <div className="flex-1">
                  {renderValueInput()}
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button 
                variant="ghost" 
                onClick={() => setAddKeyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddKey} 
                disabled={!newKeyName.trim()}
              >
                Add Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  
  const renderReadOnlyContext = () => {
    if (Object.keys(workspace.context || {}).length === 0) {
      return (
        <div className="text-center py-10 px-6 text-slate-500 space-y-4 border border-dashed rounded-md">
          <div className="flex flex-col items-center gap-2">
            <Info className="h-12 w-12 text-slate-300" />
            <p className="text-slate-600 font-medium">No workspace context defined</p>
            <p className="text-slate-500 text-sm">Add project information that will be available to all scenarios</p>
          </div>
          <Button 
            variant="default" 
            onClick={() => setIsEditing(true)}
            className="mt-4"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Add Context
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <ScrollArea className="max-h-80">
          <div className="space-y-3 pr-3">
            {Object.entries(workspace.context || {}).map(([key, value]) => (
              <Card key={key} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-2 text-slate-700">
                    {React.createElement(getContextIconComponent(key), { className: "h-4 w-4" })}
                    <span className="text-sm font-medium">{key}</span>
                  </div>
                  {typeof value === 'string' ? (
                    <div className="whitespace-pre-wrap text-slate-700 bg-slate-50 p-3 rounded-md">
                      {value}
                    </div>
                  ) : Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-1.5 bg-slate-50 p-3 rounded-md">
                      {value.map((item, index) => (
                        <Badge key={index} variant="outline" className="bg-slate-100 border-slate-200">
                          {String(item)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-xs overflow-x-auto p-3 bg-slate-50 rounded-md">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(true)}
          className="w-full"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Context
        </Button>
      </div>
    );
  };
  
  return (
    <div className="py-2">
      {isEditing ? renderEditableContext() : renderReadOnlyContext()}
    </div>
  );
};

export default WorkspaceContext;