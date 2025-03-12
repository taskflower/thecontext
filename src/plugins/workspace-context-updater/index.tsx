/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/workspace_context_updater/index.tsx
import React, { useState, useEffect } from 'react';
import { PluginBase, PluginProps } from '../../modules/plugins_system/PluginInterface';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Database } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContextUpdaterConfig {
  contextKey: string;
  valueType: 'string' | 'array' | 'object';
  defaultValue?: string;
  description?: string;
}

class WorkspaceContextUpdaterPlugin extends PluginBase {
  constructor() {
    super('workspace-context-updater', 'Workspace Context Updater', 
      'Aktualizuje lub dodaje dane do kontekstu workspace');
    
    this.defaultConfig = {
      contextKey: 'customData',
      valueType: 'string',
      defaultValue: '',
      description: 'Dane dodane przez plugin'
    };
  }
  
  // Komponent konfiguracyjny
  ConfigComponent: React.FC<PluginProps> = ({ config = {}, onConfigChange = () => {} }) => {
    const pluginConfig = { ...this.defaultConfig, ...config };
    
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="contextKey">Nazwa klucza w workspace</Label>
          <Input 
            id="contextKey"
            value={pluginConfig.contextKey} 
            onChange={(e) => onConfigChange({ contextKey: e.target.value })}
            placeholder="np. keywords, audience, customData"
          />
        </div>
        
        <div>
          <Label htmlFor="valueType">Typ wartości</Label>
          <Select 
            value={pluginConfig.valueType} 
            onValueChange={(value) => onConfigChange({ valueType: value })}
          >
            <SelectTrigger id="valueType">
              <SelectValue placeholder="Wybierz typ wartości" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">Tekst</SelectItem>
              <SelectItem value="array">Lista (rozdzielana przecinkami)</SelectItem>
              <SelectItem value="object">Obiekt JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="defaultValue">Domyślna wartość</Label>
          <Textarea 
            id="defaultValue"
            value={pluginConfig.defaultValue} 
            onChange={(e) => onConfigChange({ defaultValue: e.target.value })}
            placeholder={
              pluginConfig.valueType === 'array' ? 'element1, element2, element3' : 
              pluginConfig.valueType === 'object' ? '{"key": "value"}' : 
              'wartość tekstowa'
            }
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="description">Opis klucza</Label>
          <Input 
            id="description"
            value={pluginConfig.description} 
            onChange={(e) => onConfigChange({ description: e.target.value })}
            placeholder="Opis tego, co zawiera ten klucz"
          />
        </div>
      </div>
    );
  };
  
  // Główny komponent widoku
  ViewComponent: React.FC<PluginProps> = ({ 
    config = {}, 
   
    onResponseChange = () => {}
  }) => {
    const pluginConfig = { ...this.defaultConfig, ...config } as ContextUpdaterConfig;
    const [currentValue, setCurrentValue] = useState(pluginConfig.defaultValue || '');
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [status, setStatus] = useState<{message: string, type: 'success' | 'error' | 'info' | null}>({
      message: '', type: null
    });
    
    // Pobierz ID aktualnego workspace
    useEffect(() => {
      if (typeof window !== 'undefined' && (window as any).workspaceStore) {
        const currentId = (window as any).workspaceStore.getState().currentWorkspaceId;
        setWorkspaceId(currentId);
        
        // Sprawdź, czy wartość już istnieje w workspace
        if (currentId) {
          const workspace = (window as any).workspaceStore.getState().workspaces[currentId];
          if (workspace && workspace.context && pluginConfig.contextKey in workspace.context) {
            const existingValue = workspace.context[pluginConfig.contextKey];
            
            // Konwertuj wartość do formatu dla textarea
            if (typeof existingValue === 'string') {
              setCurrentValue(existingValue);
            } else if (Array.isArray(existingValue)) {
              setCurrentValue(existingValue.join(', '));
            } else if (typeof existingValue === 'object') {
              setCurrentValue(JSON.stringify(existingValue, null, 2));
            }
            
            setStatus({
              message: 'Załadowano istniejącą wartość z workspace',
              type: 'info'
            });
          }
        }
      }
    }, [pluginConfig.contextKey]);
    
    // Funkcja aktualizująca kontekst workspace
    const updateWorkspaceContext = () => {
      if (!workspaceId) {
        setStatus({
          message: 'Nie znaleziono aktywnego workspace',
          type: 'error'
        });
        return;
      }
      
      try {
        // Przekształć wartość do odpowiedniego formatu
        let valueToSave: string | string[] | object = currentValue;
        
        if (pluginConfig.valueType === 'array') {
          valueToSave = currentValue.split(',').map(item => item.trim()).filter(Boolean);
        } else if (pluginConfig.valueType === 'object') {
          try {
            valueToSave = JSON.parse(currentValue);
          } catch  {
            setStatus({
              message: 'Błąd parsowania JSON. Sprawdź format.',
              type: 'error'
            });
            return;
          }
        }
        
        // Aktualizuj kontekst workspace
        const { updateWorkspaceContext } = (window as any).workspaceStore.getState();
        updateWorkspaceContext(workspaceId, {
          [pluginConfig.contextKey]: valueToSave
        });
        
        // Ustaw odpowiedź dla sekwencji
        const responseText = `Zaktualizowano klucz "${pluginConfig.contextKey}" w kontekście workspace.`;
        onResponseChange(responseText);
        
        setStatus({
          message: 'Zapisano pomyślnie do kontekstu workspace',
          type: 'success'
        });
      } catch (error) {
        console.error('Błąd aktualizacji kontekstu:', error);
        setStatus({
          message: 'Wystąpił błąd podczas aktualizacji kontekstu',
          type: 'error'
        });
      }
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5 " />
          <h3 className="text-lg font-medium">Aktualizacja kontekstu workspace</h3>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 border border-blue-500 rounded p-3">
          <span>Klucz kontekstu:</span>
          <span className="font-semibold">{pluginConfig.contextKey}</span>
          <span>({
            pluginConfig.valueType === 'string' ? 'tekst' : 
            pluginConfig.valueType === 'array' ? 'lista' : 'obiekt JSON'
          })</span>
        </div>
        
        <div>
          <Label htmlFor="valueInput">
            {pluginConfig.description || 'Wprowadź wartość do zapisania w kontekście'}
          </Label>
          <Textarea 
            id="valueInput"
            className="mt-1 font-mono"
            value={currentValue} 
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder={
              pluginConfig.valueType === 'array' ? 'element1, element2, element3' : 
              pluginConfig.valueType === 'object' ? '{"key": "value"}' : 
              'wartość tekstowa'
            }
            rows={6}
          />
        </div>
        
        {status.type && (
          <Alert className={
            status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            status.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end">
          <Button 
            type="button" 
            onClick={updateWorkspaceContext}
            disabled={!workspaceId}
          >
            <Save className="h-4 w-4 mr-2" />
            Zapisz do workspace
          </Button>
        </div>
      </div>
    );
  };
  
  // Komponent wyników
  ResultComponent: React.FC<PluginProps> = ({ 
    config = {}, 
   
  }) => {
    const pluginConfig = { ...this.defaultConfig, ...config } as ContextUpdaterConfig;
    const [workspaceContext, setWorkspaceContext] = useState<any>(null);
    
    useEffect(() => {
      if (typeof window !== 'undefined' && (window as any).workspaceStore) {
        const { currentWorkspaceId, workspaces } = (window as any).workspaceStore.getState();
        
        if (currentWorkspaceId && workspaces[currentWorkspaceId]?.context) {
          const context = workspaces[currentWorkspaceId].context;
          setWorkspaceContext(context[pluginConfig.contextKey]);
        }
      }
    }, [pluginConfig.contextKey]);
    
    if (!workspaceContext) {
      return (
        <div className="p-4 text-slate-500 bg-slate-50 rounded-md border border-slate-200 text-sm">
          Brak danych dla klucza <span className="font-mono">{pluginConfig.contextKey}</span> w kontekście workspace.
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Database className="h-4 w-4 text-blue-500" />
          Zapisano w kontekście: <span className="font-mono">{pluginConfig.contextKey}</span>
        </h3>
        
        {typeof workspaceContext === 'string' ? (
          <div className="p-3 bg-slate-50 rounded-md border text-sm">
            {workspaceContext}
          </div>
        ) : Array.isArray(workspaceContext) ? (
          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-md border">
            {workspaceContext.map((item, i) => (
              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-xs">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <pre className="p-3 bg-slate-50 rounded-md border text-xs font-mono overflow-x-auto">
            {JSON.stringify(workspaceContext, null, 2)}
          </pre>
        )}
      </div>
    );
  };
  
  // Przetwarzanie węzła
  processNode = (node: any, response: any) => {
    return { 
      node, 
      result: response || "Zaktualizowano kontekst workspace"
    };
  };
}

export default new WorkspaceContextUpdaterPlugin();