/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/graph/components/PluginOptionsEditor.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import useDynamicComponentStore from '../../plugins/pluginsStore';
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
} from '@/components/studio';
import { CheckboxField, ColorField } from '@/components/studio/CommonFormField';
import { SectionSettings } from '@/modules/plugins/types';
import { X } from 'lucide-react';

interface PluginOptionsEditorProps {
  nodeId: string;
  onClose: () => void;
}

const PluginOptionsEditor: React.FC<PluginOptionsEditorProps> = ({ nodeId, onClose }) => {
  const [pluginData, setPluginData] = useState<Record<string, any>>({});
  const [sectionSettings, setSectionSettings] = useState<SectionSettings>({
    replaceHeader: false,
    replaceAssistantView: false,
    replaceUserInput: false,
    hideNavigationButtons: false
  });
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
      
      // Extract section settings if they exist, or use defaults
      const currentSectionSettings = currentData._sectionSettings || {};
      
      // Create a new object without _sectionSettings instead of modifying the original
      const pluginDataWithoutSettings = { ...currentData };
      if ('_sectionSettings' in pluginDataWithoutSettings) {
        // @ts-ignore - We know this property exists because we just checked
        const { _sectionSettings, ...restData } = pluginDataWithoutSettings;
        setPluginData(restData);
      } else {
        setPluginData(pluginDataWithoutSettings);
      }
      
      setSectionSettings({
        replaceHeader: Boolean(currentSectionSettings.replaceHeader),
        replaceAssistantView: Boolean(currentSectionSettings.replaceAssistantView),
        replaceUserInput: Boolean(currentSectionSettings.replaceUserInput),
        hideNavigationButtons: Boolean(currentSectionSettings.hideNavigationButtons)
      });
      
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
    // Combine plugin data with section settings
    const combinedData = {
      ...pluginData,
      _sectionSettings: sectionSettings
    };
    useAppStore.getState().updateNodePluginData(nodeId, pluginKey, combinedData);
    setIsDirty(false);
    onClose();
  };
  
  // Reset changes
  const handleReset = () => {
    const currentData = node.pluginData?.[pluginKey] || {};
    
    // Extract section settings if they exist
    const currentSectionSettings = currentData._sectionSettings || {};
    
    // Create a new object without _sectionSettings instead of modifying the original
    const pluginDataWithoutSettings = { ...currentData };
    if ('_sectionSettings' in pluginDataWithoutSettings) {
      // @ts-ignore - We know this property exists because we just checked
      const { _sectionSettings, ...restData } = pluginDataWithoutSettings;
      setPluginData(restData);
    } else {
      setPluginData(pluginDataWithoutSettings);
    }
    
    setSectionSettings({
      replaceHeader: Boolean(currentSectionSettings.replaceHeader),
      replaceAssistantView: Boolean(currentSectionSettings.replaceAssistantView),
      replaceUserInput: Boolean(currentSectionSettings.replaceUserInput),
      hideNavigationButtons: Boolean(currentSectionSettings.hideNavigationButtons)
    });
    
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
  
  // Handle section settings changes
  const handleSectionSettingChange = (key: keyof SectionSettings, value: boolean) => {
    setSectionSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      setIsDirty(true);
      return newSettings;
    });
  };
  
  // Get plugin component schema (if available)
  const pluginComponent = useDynamicComponentStore.getState().getComponent(pluginKey);
  const hasOptionsSchema = pluginComponent && 'optionsSchema' in pluginComponent;
  
  // Render footer actions
  const renderFooter = () => (
    <>
      <CancelButton onClick={onClose} />
      <SaveButton onClick={handleSave} disabled={!isDirty} />
    </>
  );
  
  // UI section settings component
  const SectionSettingsForm: React.FC = () => (
    <div className="border-t border-border pt-4 mt-6">
      <h3 className="text-sm font-medium mb-3">UI Section Settings</h3>
      <div className="space-y-3">
        <CheckboxField
          id="section-replace-header"
          name="replaceHeader"
          label="Replace header section"
          checked={sectionSettings.replaceHeader}
          onChange={(e) => handleSectionSettingChange('replaceHeader', e.target.checked)}
          description="Plugin will replace the default header section"
        />
        
        <CheckboxField
          id="section-replace-assistant"
          name="replaceAssistantView"
          label="Replace assistant message section"
          checked={sectionSettings.replaceAssistantView}
          onChange={(e) => handleSectionSettingChange('replaceAssistantView', e.target.checked)}
          description="Plugin will replace the default assistant message section"
        />
        
        <CheckboxField
          id="section-replace-user-input"
          name="replaceUserInput"
          label="Replace user input section"
          checked={sectionSettings.replaceUserInput}
          onChange={(e) => handleSectionSettingChange('replaceUserInput', e.target.checked)}
          description="Plugin will replace the default user input section"
        />
        
        <CheckboxField
          id="section-hide-navigation"
          name="hideNavigationButtons"
          label="Hide navigation buttons"
          checked={sectionSettings.hideNavigationButtons}
          onChange={(e) => handleSectionSettingChange('hideNavigationButtons', e.target.checked)}
          description="Hide the default navigation buttons (plugin can provide custom navigation)"
        />
      </div>
    </div>
  );

  return (
    <DialogModal
      isOpen={true}
      onClose={onClose}
      title={`Plugin Options: ${pluginKey}`}
      description="Configure plugin options for this node"
      footer={renderFooter()}
    >
      {loading ? (
        <div className="p-4 text-center">
          <p>Loading plugin options...</p>
        </div>
      ) : (
        <>
          <SectionSettingsForm />
          
          <div className="border-t border-border pt-4 mt-6">
            <h3 className="text-sm font-medium mb-3">Plugin Options</h3>
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
          
          {isDirty && (
            <div className="mt-4 p-3 bg-muted/30 rounded-md">
              <button
                onClick={handleReset}
                className="text-sm text-primary hover:underline"
              >
                Reset to defaults
              </button>
            </div>
          )}
        </>
      )}
    </DialogModal>
  );
};

// Component for handling plugins with schema
interface DynamicOptionsFormProps {
  schema: any;
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const DynamicOptionsForm: React.FC<DynamicOptionsFormProps> = ({ schema, data, onChange }) => {
  return (
    <div className="space-y-4">
      {Object.entries(schema).map(([key, fieldSchema]: [string, any]) => {
        const label = fieldSchema.label || key;
        const description = fieldSchema.description || '';
        
        if (fieldSchema.type === 'number') {
          return (
            <div key={key}>
              <InputField
                id={`option-${key}`}
                name={key}
                label={label}
                value={data[key]?.toString() ?? fieldSchema.default?.toString() ?? ''}
                onChange={(e) => onChange(key, parseFloat(e.target.value))}
                placeholder={fieldSchema.placeholder || ''}
              />
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          );
        }
        
        if (fieldSchema.type === 'boolean') {
          return (
            <CheckboxField
              key={key}
              id={`option-${key}`}
              name={key}
              label={label}
              checked={data[key] ?? fieldSchema.default ?? false}
              onChange={(e) => onChange(key, e.target.checked)}
              description={description}
            />
          );
        }
        
        if (fieldSchema.type === 'color') {
          return (
            <ColorField
              key={key}
              id={`option-${key}`}
              name={key}
              label={label}
              value={data[key] ?? fieldSchema.default ?? '#000000'}
              onChange={(e) => onChange(key, e.target.value)}
            />
          );
        }
        
        // Default to text input
        return (
          <div key={key}>
            <InputField
              id={`option-${key}`}
              name={key}
              label={label}
              value={data[key]?.toString() ?? fieldSchema.default?.toString() ?? ''}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={fieldSchema.placeholder || ''}
            />
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        );
      })}
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
              <InputField
                id={`option-${key}`}
                name={key}
                label={key}
                value={value?.toString() || ''}
                onChange={(e) => onChange(key, e.target.value)}
              />
              <button
                onClick={() => {
                  const newData = { ...data };
                  delete newData[key];
                  Object.entries(newData).forEach(([k, v]) => {
                    onChange(k, v);
                  });
                }}
                className="h-9 w-9 mt-7 flex items-center justify-center text-muted-foreground hover:text-destructive"
                aria-label="Remove option"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-3">Add New Option</h4>
        <div className="flex gap-2">
          <InputField
            id="new-option-key"
            name="newKey"
            label="Option name"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <InputField
            id="new-option-value"
            name="newValue"
            label="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
        </div>
        <button
          onClick={handleAddOption}
          disabled={!newKey.trim()}
          className="mt-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2 disabled:opacity-50"
        >
          Add Option
        </button>
      </div>
    </div>
  );
};

export default PluginOptionsEditor;