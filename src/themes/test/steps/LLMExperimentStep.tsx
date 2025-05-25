// src/themes/test/steps/LLMExperimentStep.tsx
import { useState } from 'react';
import { useLLMExperiments, useConfigManager } from '@/ngn2/cre';
import { z } from 'zod';
import { useLlm } from '@/core/hooks/useLlm';

const ConfigSchema = z.object({
  name: z.string(),
  slug: z.string(),
  templateSettings: z.object({
    layoutFile: z.string(),
    widgets: z.array(z.any()).optional()
  }).optional(),
  contextSchema: z.record(z.any()).optional(),
  nodes: z.array(z.object({
    slug: z.string(),
    label: z.string(),
    tplFile: z.string(),
    attrs: z.record(z.any())
  })).optional()
});

export default function LLMExperimentStep({ attrs }: any) {
  const { experiments, createExperiment, updateExperiment } = useLLMExperiments();
  const { saveConfig } = useConfigManager();
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    systemMessage: '',
    targetConfigPath: '',
    configType: 'workspace'
  });

  const llmHook = useLlm({
    schema: ConfigSchema,
    jsonSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        slug: { type: "string" },
        templateSettings: {
          type: "object",
          properties: {
            layoutFile: { type: "string" },
            widgets: { type: "array", items: { type: "object" } }
          }
        },
        contextSchema: { type: "object" },
        nodes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              slug: { type: "string" },
              label: { type: "string" },
              tplFile: { type: "string" },
              attrs: { type: "object" }
            }
          }
        }
      }
    },
    userMessage: formData.prompt,
    systemMessage: formData.systemMessage || `Wygeneruj konfigurację ${formData.configType} dla silnika aplikacji. Zwróć prawidłowy JSON zgodny ze schematem.`,
    autoStart: false,
    getToken: async () => 'mock-token', // Replace with real token
    user: { uid: 'user123' } // Replace with real user
  });

  const handleCreateExperiment = async () => {
    if (!formData.name || !formData.prompt) return;
    
    const id = await createExperiment({
      name: formData.name,
      prompt: formData.prompt,
      systemMessage: formData.systemMessage,
      targetConfigPath: formData.targetConfigPath,
      status: 'pending'
    });
    
    setFormData({ name: '', prompt: '', systemMessage: '', targetConfigPath: '', configType: 'workspace' });
    setShowForm(false);
  };

  const handleRunExperiment = async (experiment: any) => {
    setSelectedExperiment(experiment);
    
    // Update form data for LLM hook
    setFormData({
      ...formData,
      prompt: experiment.prompt,
      systemMessage: experiment.systemMessage
    });
    
    await updateExperiment(experiment.id, { status: 'running' });
    
    try {
      await llmHook.startLlmProcess();
      
      if (llmHook.result) {
        // Save generated config to database
        await saveConfig(
          experiment.targetConfigPath,
          llmHook.result,
          formData.configType as any
        );
        
        await updateExperiment(experiment.id, {
          status: 'completed',
          result: llmHook.result
        });
      }
    } catch (error: any) {
      await updateExperiment(experiment.id, {
        status: 'error',
        error: error.message
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">LLM Experiments</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Experiment'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Experiment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., Generate Dashboard Workspace"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Config Type</label>
              <select
                value={formData.configType}
                onChange={(e) => setFormData({...formData, configType: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="workspace">Workspace</option>
                <option value="scenario">Scenario</option>
                <option value="app">App</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Target Config Path</label>
            <input
              type="text"
              value={formData.targetConfigPath}
              onChange={(e) => setFormData({...formData, targetConfigPath: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., /src/configs/testApp/workspaces/dashboard.json"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Prompt</label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({...formData, prompt: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded h-32"
              placeholder="Describe what you want to generate..."
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">System Message (Optional)</label>
            <textarea
              value={formData.systemMessage}
              onChange={(e) => setFormData({...formData, systemMessage: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded h-20"
              placeholder="Additional instructions for the AI..."
            />
          </div>
          
          <button
            onClick={handleCreateExperiment}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Experiment
          </button>
        </div>
      )}

      {/* Experiments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((exp) => (
          <div key={exp.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{exp.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                exp.status === 'completed' ? 'bg-green-100 text-green-800' :
                exp.status === 'running' ? 'bg-blue-100 text-blue-800' :
                exp.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {exp.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {exp.prompt}
            </p>
            
            <div className="text-xs text-gray-500 mb-3">
              Target: {exp.targetConfigPath}
            </div>
            
            {exp.status === 'error' && (
              <div className="text-xs text-red-600 mb-3">
                Error: {exp.error}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => handleRunExperiment(exp)}
                disabled={exp.status === 'running'}
                className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {exp.status === 'running' ? 'Running...' : 'Run'}
              </button>
              
              {exp.result && (
                <button
                  onClick={() => setSelectedExperiment(exp)}
                  className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  View Result
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Result Modal */}
      {selectedExperiment?.result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-3/4 overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Result: {selectedExperiment.name}
              </h3>
              <button
                onClick={() => setSelectedExperiment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(selectedExperiment.result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}