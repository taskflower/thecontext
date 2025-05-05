// src/_modules/scenarioGenerator/components/StepEditor.tsx
import React from 'react';
import { StepData } from '../types';
import { 
  generateSampleSchema, 
  generateDefaultLlmPrompt,
  generateDefaultWidgets
} from '../utils/schemaUtils';

interface StepEditorProps {
  step: StepData;
  allSteps: StepData[];
  index: number;
  onUpdate: (updates: Partial<StepData>) => void;
  onClose: () => void;
}

const StepEditor: React.FC<StepEditorProps> = ({ 
  step, 
  allSteps, 
  index, 
  onUpdate, 
  onClose 
}) => {
  // Get previous step (if exists)
  const prevStep = index > 0 ? allSteps[index - 1] : undefined;
  
  // Extract step name without the order prefix
  const getStepNameFromLabel = () => {
    if (step.label.includes(':')) {
      return step.label.split(':').slice(1).join(':').trim();
    }
    return step.label.replace(/^Step \d+:?\s*/, '').trim();
  };
  
  // Handle updating step label
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = `Step ${index + 1}: ${e.target.value}`;
    onUpdate({ label: newLabel });
  };
  
  // Generate sample form schema
  const handleGenerateSchema = () => {
    const stepName = getStepNameFromLabel();
    const sampleSchema = generateSampleSchema(step.id, stepName);
    const schemaPath = step.attrs?.schemaPath || `schemas.${step.id}`;
    
    onUpdate({ 
      attrs: { ...step.attrs, schemaPath }
    });
    
    // In a real app, you would save the schema to context
    console.log(`Generated schema for step ${step.id}:`, sampleSchema);
    
    // Show feedback to user
    alert('Sample schema generated. In a real app, this would be saved to the workspace context.');
  };
  
  // Generate sample LLM prompt
  const handleGeneratePrompt = () => {
    if (!prevStep) {
      alert('No previous step to reference. Please add a form step first.');
      return;
    }
    
    const samplePrompt = generateDefaultLlmPrompt(
      prevStep.contextPath,
      [] // In a real app, you would get fields from the context
    );
    
    onUpdate({
      attrs: { 
        ...step.attrs, 
        autoStart: true,
        initialUserMessage: samplePrompt
      }
    });
  };
  
  // Generate sample widgets
  const handleGenerateWidgets = () => {
    const prevContextPath = prevStep?.contextPath;
    const stepName = getStepNameFromLabel();
    
    const sampleWidgets = generateDefaultWidgets(prevContextPath, stepName);
    
    onUpdate({
      attrs: { ...step.attrs, widgets: sampleWidgets }
    });
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Editing Step {index + 1}</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close editor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Step Name</label>
          <input
            type="text"
            value={getStepNameFromLabel()}
            onChange={handleLabelChange}
            className="w-full p-2 border rounded-md"
            placeholder="Name of this step..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Step Type</label>
          <select
            value={step.tplFile}
            onChange={(e) => onUpdate({ tplFile: e.target.value as StepData['tplFile'] })}
            className="w-full p-2 border rounded-md"
          >
            <option value="formStep">Form Input</option>
            <option value="llmStep">AI Analysis</option>
            <option value="widgetsStep">Data Display</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Context Path</label>
          <input
            type="text"
            value={step.contextPath || ''}
            onChange={(e) => onUpdate({ contextPath: e.target.value })}
            className="w-full p-2 border rounded-md"
            placeholder="Path for storing step data..."
          />
          <p className="text-xs text-gray-500 mt-1">Path where this step's data will be stored in context</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assistant Message</label>
          <textarea
            value={step.assistantMessage || ''}
            onChange={(e) => onUpdate({ assistantMessage: e.target.value })}
            className="w-full p-2 border rounded-md"
            rows={2}
            placeholder="Message shown to the user..."
          />
        </div>
        
        {/* Type-specific configuration */}
        {step.tplFile === 'formStep' && (
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">Form Configuration</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schema Path</label>
              <input
                type="text"
                value={step.attrs?.schemaPath || ''}
                onChange={(e) => onUpdate({ 
                  attrs: { ...step.attrs, schemaPath: e.target.value }
                })}
                className="w-full p-2 border rounded-md"
                placeholder="schemas.formName"
              />
              <p className="text-xs text-gray-500 mt-1">Path to form schema in context</p>
            </div>
            
            <div className="mt-3">
              <button
                onClick={handleGenerateSchema}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              >
                Generate Sample Schema
              </button>
            </div>
          </div>
        )}
        
        {step.tplFile === 'llmStep' && (
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">LLM Configuration</h4>
            
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="autoStart"
                checked={step.attrs?.autoStart || false}
                onChange={(e) => onUpdate({
                  attrs: { ...step.attrs, autoStart: e.target.checked }
                })}
                className="mr-2"
              />
              <label htmlFor="autoStart">Auto-start LLM analysis</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial User Message</label>
              <textarea
                value={step.attrs?.initialUserMessage || ''}
                onChange={(e) => onUpdate({
                  attrs: { ...step.attrs, initialUserMessage: e.target.value }
                })}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Message sent to LLM model..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use variables like {`{{`}contextPath{`}}`} to reference data from context
              </p>
            </div>
            
            <div className="mt-3">
              <button
                onClick={handleGeneratePrompt}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              >
                Generate Sample Prompt
              </button>
            </div>
          </div>
        )}
        
        {step.tplFile === 'widgetsStep' && (
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">Widgets Configuration</h4>
            
            <div className="bg-white p-3 border rounded-md">
              <p className="text-sm text-gray-600 mb-3">
                Define widgets to display data from previous steps
              </p>
              
              <button
                onClick={handleGenerateWidgets}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              >
                Generate Sample Widgets
              </button>
              
              {step.attrs?.widgets && step.attrs.widgets.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium">Current Widgets:</p>
                  <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(step.attrs.widgets, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepEditor;