// src/modules/workspaces_module/WorkspaceContext.tsx
import React, { useState } from 'react';
import { useWorkspaceStore, WorkspaceContext as WorkspaceContextType } from './workspaceStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Users, 
  Target, 
  PencilIcon, 
  Check, 
  X, 
  Plus, 
  Trash2,
  Info
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
// No tooltips import

interface WorkspaceContextProps {
  workspaceId: string;
}

const WorkspaceContext: React.FC<WorkspaceContextProps> = ({ workspaceId }) => {
  const { workspaces, updateWorkspaceContext } = useWorkspaceStore();
  const workspace = workspaces[workspaceId];
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContext, setEditedContext] = useState<WorkspaceContextType>(workspace?.context || {});
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [addingNewKey, setAddingNewKey] = useState(false);
  
  if (!workspace) {
    return <div className="p-4 text-center text-slate-500 border border-dashed rounded-md">Workspace nie znaleziony</div>;
  }
  
  const handleSaveContext = () => {
    updateWorkspaceContext(workspaceId, editedContext);
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditedContext(workspace.context);
    setIsEditing(false);
    setAddingNewKey(false);
  };
  
  const handleAddNewKey = () => {
    if (!addingNewKey) {
      setAddingNewKey(true);
    } else if (newKeyName.trim()) {
      setEditedContext(prev => ({
        ...prev,
        [newKeyName.trim()]: newKeyValue
      }));
      setNewKeyName('');
      setNewKeyValue('');
      setAddingNewKey(false);
    }
  };
  
  const handleRemoveKey = (key: string) => {
    setEditedContext(prev => {
      const newContext = { ...prev };
      delete newContext[key];
      return newContext;
    });
  };

  const renderContextIcon = (key: string) => {
    switch (key) {
      case 'url':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'audience':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'businessGoal':
        return <Target className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
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
                  <div className="flex items-center gap-1 mb-2">
                    {renderContextIcon(key)}
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
                      placeholder="Wprowadź listę wartości oddzielonych przecinkami"
                      className="min-h-20"
                    />
                  ) : (
                    <Input 
                      value={JSON.stringify(value)} 
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
                    />
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveKey(key)}
                  className="h-8 w-8 text-slate-400 hover:text-red-500"
                  aria-label="Usuń klucz"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add new key form */}
        {addingNewKey ? (
          <Card className="border border-blue-200 shadow-sm bg-blue-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <Input 
                    value={newKeyName} 
                    onChange={(e) => setNewKeyName(e.target.value)} 
                    placeholder="Nazwa klucza"
                    className="flex-grow"
                    autoFocus
                  />
                  <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setAddingNewKey(false)}
                  className="h-9 w-9 text-slate-400 hover:text-red-500"
                  aria-label="Anuluj"
                >
                  <X className="h-5 w-5" />
                </Button>
                </div>
                <Input 
                  value={newKeyValue} 
                  onChange={(e) => setNewKeyValue(e.target.value)} 
                  placeholder="Wartość"
                />
                <Button 
                  onClick={handleAddNewKey}
                  className="w-full"
                  disabled={!newKeyName.trim()}
                  variant="default"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Dodaj klucz
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button 
            variant="outline" 
            onClick={handleAddNewKey}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj nowy klucz kontekstu
          </Button>
        )}
        
        <div className="flex gap-2 pt-4 justify-end">
          <Button variant="outline" onClick={handleCancelEdit}>
            Anuluj
          </Button>
          <Button onClick={handleSaveContext}>
            Zapisz zmiany
          </Button>
        </div>
      </div>
    );
  };
  
  const renderReadOnlyContext = () => {
    if (Object.keys(workspace.context).length === 0) {
      return (
        <div className="text-center py-10 px-6 text-slate-500 space-y-4 border border-dashed rounded-md">
          <div className="flex flex-col items-center gap-2">
            <Info className="h-12 w-12 text-slate-300" />
            <p className="text-slate-600 font-medium">Brak zdefiniowanego kontekstu workspace</p>
            <p className="text-slate-500 text-sm">Dodaj informacje o projekcie, które będą dostępne dla wszystkich scenariuszy</p>
          </div>
          <Button 
            variant="default" 
            onClick={() => setIsEditing(true)}
            className="mt-4"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Dodaj kontekst
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <ScrollArea className="max-h-80">
          <div className="space-y-3 pr-3">
            {Object.entries(workspace.context).map(([key, value]) => (
              <Card key={key} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-2 text-slate-700">
                    {renderContextIcon(key)}
                    <span className="text-sm font-medium">{key}</span>
                  </div>
                  {typeof value === 'string' ? (
                    <div className="whitespace-pre-wrap text-slate-700 bg-slate-50 p-3 rounded-md">
                      {value}
                    </div>
                  ) : Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-1.5 bg-slate-50 p-3 rounded-md">
                      {value.map((item, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200">
                          {item}
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
          Edytuj kontekst
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