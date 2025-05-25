// src/themes/test/steps/ExperimentTemplatesStep.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/ngn2/cre';

export default function ExperimentTemplatesStep({ attrs }: any) {
  const navigate = useNavigate();
  const store = useStore('experiments');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customVariables, setCustomVariables] = useState<any>({});
  
  const templates = attrs.templates || [];
  
  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template);
    
    // Extract variables from template prompt
    const variables = extractVariables(template.prompt);
    setCustomVariables(variables.reduce((acc, v) => ({ ...acc, [v]: '' }), {}));
  };
  
  const extractVariables = (text: string) => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(m => m.replace(/[{}]/g, '')) : [];
  };
  
  const replaceVariables = (text: string, variables: any) => {
    return Object.entries(variables).reduce((acc, [key, value]) => {
      return acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value as string);
    }, text);
  };
  
  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;
    
    const processedPrompt = replaceVariables(selectedTemplate.prompt, customVariables);
    const processedSystemMessage = replaceVariables(selectedTemplate.systemMessage, customVariables);
    
    const experiment = {
      name: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
      description: selectedTemplate.description,
      configType: selectedTemplate.configType,
      targetPath: `/src/configs/testApp/${selectedTemplate.configType}s/generated-${Date.now()}.json`,
      prompt: processedPrompt,
      systemMessage: processedSystemMessage,
      status: 'draft',
      tags: selectedTemplate.tags || [],
      temperature: 0.7
    };
    
    const created = store.add(experiment);
    navigate(`/testApp/experiments/run/execution/${created.id}`);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{attrs.title}</h1>
        <button
          onClick={() => navigate('/testApp/experiments/list')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Experiments
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates Gallery */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Templates</h2>
          <div className="space-y-4">
            {templates.map((template: any, i: number) => (
              <div 
                key={i} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTemplate === template 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleUseTemplate(template)}
              >
                <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {template.configType}
                  </span>
                  <div className="flex gap-1">
                    {template.tags.map((tag: string, j: number) => (
                      <span key={j} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Template Customization */}
        {selectedTemplate && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Customize Template</h2>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-medium mb-4">{selectedTemplate.name}</h3>
              
              {/* Variables Form */}
              {Object.keys(customVariables).length > 0 && (
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700">Template Variables:</h4>
                  {Object.keys(customVariables).map((variable: string) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {variable.charAt(0).toUpperCase() + variable.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={customVariables[variable]}
                        onChange={e => setCustomVariables({
                          ...customVariables,
                          [variable]: e.target.value
                        })}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${variable}...`}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Preview */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview Prompt:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {replaceVariables(selectedTemplate.prompt, customVariables)}
                </div>
              </div>
              
              <button
                onClick={handleCreateFromTemplate}
                disabled={Object.values(customVariables).some(v => !v)}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create & Run Experiment
              </button>
            </div>
          </div>
        )}
      </div>
      
      {!selectedTemplate && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg mb-2">Select a template to get started</div>
          <div className="text-sm">Choose from pre-built templates or create your own experiment</div>
        </div>
      )}
    </div>
  );
}