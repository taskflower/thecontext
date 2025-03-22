import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store';
import { cn } from '@/utils/utils';
import useDynamicComponentStore from '../../plugins/pluginsStore';

interface PluginOptionsEditorProps {
  nodeId: string;
  onClose: () => void;
}

const PluginOptionsEditor: React.FC<PluginOptionsEditorProps> = ({ nodeId, onClose }) => {
  const [pluginData, setPluginData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  
  // Direct access to state to avoid selector issues
  const state = useAppStore.getState();
  const workspace = state.items.find(w => w.id === state.selected.workspace);
  const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
  const node = scenario?.children.find(n => n.id === nodeId);
  
  useEffect(() => {
    if (node && node.pluginKey) {
      // Load the current plugin data
      const currentData = node.pluginData?.[node.pluginKey] || {};
      setPluginData(currentData);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [node]);
  
  if (!node || !node.pluginKey) {
    return null;
  }
  
  const { pluginKey } = node;
  
  // Save changes
  const handleSave = () => {
    useAppStore.getState().updateNodePluginData(nodeId, pluginKey, pluginData);
    setIsDirty(false);
    onClose();
  };
  
  // Reset changes
  const handleReset = () => {
    const currentData = node.pluginData?.[pluginKey] || {};
    setPluginData(currentData);
    setIsDirty(false);
  };
  
  // Handle input changes
  const handleInputChange = (key: string, value: any) => {
    setPluginData(prev => {
      const newData = { ...prev, [key]: value };
      setIsDirty(true);
      return newData;
    });
  };
  
  // Get plugin component schema (if available)
  const pluginComponent = useDynamicComponentStore.getState().getComponent(pluginKey);
  const hasOptionsSchema = pluginComponent && 'optionsSchema' in pluginComponent;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4 max-h-[80vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            Plugin Options: {pluginKey}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">
            <p>Loading plugin options...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {hasOptionsSchema ? (
              <DynamicOptionsForm 
                schema={(pluginComponent as any).optionsSchema}
                data={pluginData}
                onChange={handleInputChange}
              />
            ) : (
              <GenericOptionsForm 
                data={pluginData}
                onChange={handleInputChange}
              />
            )}
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-border">
          <button
            onClick={handleReset}
            disabled={!isDirty}
            className={cn(
              "px-3 py-1.5 text-sm border border-border rounded-md flex items-center",
              isDirty ? "hover:bg-muted" : "opacity-50 cursor-not-allowed"
            )}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={cn(
              "px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md flex items-center",
              isDirty ? "hover:bg-primary/90" : "opacity-50 cursor-not-allowed"
            )}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for handling plugins with schema
interface DynamicOptionsFormProps {
  schema: any;
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const DynamicOptionsForm: React.FC<DynamicOptionsFormProps> = ({ schema, data, onChange }) => {
  // This would ideally use schema defined by the plugin to generate appropriate fields
  return (
    <div className="space-y-4">
      {Object.entries(schema).map(([key, fieldSchema]: [string, any]) => (
        <div key={key}>
          <label htmlFor={key} className="block text-sm font-medium mb-1">
            {fieldSchema.label || key}
          </label>
          
          {fieldSchema.type === 'number' ? (
            <input
              type="number"
              id={key}
              value={data[key] ?? fieldSchema.default ?? ''}
              onChange={(e) => onChange(key, parseFloat(e.target.value))}
              placeholder={fieldSchema.placeholder || ''}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          ) : fieldSchema.type === 'boolean' ? (
            <div className="flex items-center">
              <input
                type="checkbox"
                id={key}
                checked={data[key] ?? fieldSchema.default ?? false}
                onChange={(e) => onChange(key, e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <label htmlFor={key} className="ml-2 text-sm">
                {fieldSchema.description || ''}
              </label>
            </div>
          ) : fieldSchema.type === 'color' ? (
            <div className="flex items-center gap-2">
              <input
                type="color"
                id={key}
                value={data[key] ?? fieldSchema.default ?? '#000000'}
                onChange={(e) => onChange(key, e.target.value)}
                className="h-8 w-10 border border-border rounded cursor-pointer"
              />
              <input
                type="text"
                value={data[key] ?? fieldSchema.default ?? ''}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder="#RRGGBB"
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ) : fieldSchema.type === 'select' ? (
            <select
              id={key}
              value={data[key] ?? fieldSchema.default ?? ''}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {fieldSchema.options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id={key}
              value={data[key] ?? fieldSchema.default ?? ''}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={fieldSchema.placeholder || ''}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
          
          {fieldSchema.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {fieldSchema.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// Fallback component for plugins without schema 
interface GenericOptionsFormProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const GenericOptionsForm: React.FC<GenericOptionsFormProps> = ({ data, onChange }) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  
  const handleAddOption = () => {
    if (!newKey.trim()) return;
    onChange(newKey, newValue);
    setNewKey('');
    setNewValue('');
  };
  
  return (
    <div className="space-y-4">
      {Object.keys(data).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          This plugin doesn't have any options configured yet. Add your first option below.
        </p>
      ) : (
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor={`option-${key}`} className="block text-xs font-medium text-muted-foreground">
                  {key}
                </label>
                <input
                  type="text"
                  id={`option-${key}`}
                  value={value?.toString() || ''}
                  onChange={(e) => onChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                onClick={() => {
                  const newData = { ...data };
                  delete newData[key];
                  Object.entries(newData).forEach(([k, v]) => {
                    onChange(k, v);
                  });
                }}
                className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-destructive"
                aria-label="Remove option"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="pt-2 border-t border-border">
        <h4 className="text-sm font-medium mb-2">Add New Option</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Option name"
            className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleAddOption}
            disabled={!newKey.trim()}
            className={cn(
              "px-3 py-2 text-sm border border-border rounded-md",
              newKey.trim() ? "hover:bg-muted" : "opacity-50 cursor-not-allowed"
            )}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default PluginOptionsEditor;