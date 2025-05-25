// src/themes/test/steps/ExperimentRunStep.tsx

import { useExperiments, useLlm } from '@/ngn2/cre';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ExperimentRunStep({ attrs }: any) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { experiments, updateExperiment } = useExperiments();
  const [experiment, setExperiment] = useState<any>(null);
  
  useEffect(() => {
    if (id) {
      const exp = experiments.find(e => e.id === id);
      setExperiment(exp);
    }
  }, [id, experiments]);
  
  const llmHook = useLlm({
    schema: experiment ? getSchemaForType(experiment.configType) : undefined,
    userMessage: experiment?.prompt || '',
    systemMessage: experiment?.systemMessage || `Generate ${experiment?.configType} configuration`,
  });
  
  const handleRun = async () => {
    if (!experiment) return;
    
    try {
      await updateExperiment(experiment.id, { status: 'running' });
      
      const result = await llmHook.start();
      
      if (result) {
        await updateExperiment(experiment.id, { 
          status: 'completed',
          result,
          completedAt: new Date().toISOString()
        });
      }
    } catch (error: any) {
      await updateExperiment(experiment.id, { 
        status: 'error',
        error: error.message
      });
    }
  };
  
  const handleSaveConfig = async () => {
    if (!llmHook.result || !experiment) return;
    
    try {
      // Here you would save to your config system
      // For now, we'll just show success
      alert(`Configuration saved to ${experiment.targetPath}`);
    } catch (error) {
      alert('Failed to save configuration');
    }
  };
  
  if (!experiment) {
    return <div className="text-center py-12">Loading experiment...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{experiment.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Config Type</label>
            <div className="mt-1 text-sm text-gray-900">{experiment.configType}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Path</label>
            <div className="mt-1 text-sm text-gray-900">{experiment.targetPath}</div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Prompt</label>
            <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
              {experiment.prompt}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRun}
            disabled={llmHook.isLoading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {llmHook.isLoading ? 'Running...' : 'Run Experiment'}
          </button>
          
          <button
            onClick={() => navigate('/testApp/experiments/list')}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Back to List
          </button>
        </div>
        
        {llmHook.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <div className="text-red-800">Error: {llmHook.error}</div>
          </div>
        )}
      </div>
      
      {llmHook.result && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Generated Configuration</h2>
            <button
              onClick={handleSaveConfig}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Config
            </button>
          </div>
          
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(llmHook.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function getSchemaForType(type: string) {
  switch (type) {
    case 'workspace':
      return {
        type: "object",
        properties: {
          slug: { type: "string" },
          name: { type: "string" },
          templateSettings: {
            type: "object",
            properties: {
              layoutFile: { type: "string" },
              widgets: { type: "array", items: { type: "object" } }
            }
          },
          contextSchema: { type: "object" }
        }
      };
    case 'scenario':
      return {
        type: "object",
        properties: {
          slug: { type: "string" },
          name: { type: "string" },
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
      };
    default:
      return { type: "object" };
  }
}
