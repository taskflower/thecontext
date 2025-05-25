// src/themes/test/steps/ExperimentFormStep.tsx
import { useSchema, useExperiments } from '@/ngn2/cre';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ExperimentFormStep({ attrs }: any) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { experiments, createExperiment, updateExperiment, loading: experimentsLoading } = useExperiments();
  const { getSchema, loading: schemaLoading } = useSchema();
  const [data, setData] = useState<any>({});
  
  const schema = getSchema(attrs.schemaPath);
  
  useEffect(() => {
    if (id && experiments.length > 0) {
      const existing = experiments.find(exp => exp.id === id);
      if (existing) {
        setData(existing);
      }
    }
  }, [id, experiments.length]); // Używamy tylko length, nie cały array
  
  useEffect(() => {
    if (!id && schema?.properties && Object.keys(data).length === 0) {
      const defaults: any = {};
      Object.entries(schema.properties).forEach(([k, v]: [string, any]) => {
        if (v.default) defaults[k] = v.default;
      });
      setData(defaults);
    }
  }, [schema, id, data]); // Osobny effect dla defaults
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    try {
      if (id) {
        await updateExperiment(id, data);
      } else {
        await createExperiment(data);
      }
      navigate(`/testApp/${attrs.onSubmit.navPath}`);
    } catch (error) {
      console.error('Failed to save experiment:', error);
      alert('Failed to save experiment');
    }
  };
  
  if (schemaLoading || experimentsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-600">Loading form...</span>
      </div>
    );
  }
  
  if (!schema) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">Schema not found for path: {attrs.schemaPath}</div>
        <div className="text-sm text-gray-500 mt-2">
          Check experiments workspace configuration
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">{attrs.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(schema.properties).map(([key, field]: [string, any]) => {
            if (attrs.excludeFields?.includes(key)) return null;
            
            const isFullWidth = ['description', 'prompt', 'systemMessage'].includes(key);
            
            return (
              <div key={key} className={isFullWidth ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label || key}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.enum ? (
                  <select 
                    value={data[key] || ''} 
                    onChange={e => setData({...data, [key]: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                  >
                    <option value="">Choose...</option>
                    {field.enum.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.widget === 'textarea' ? (
                  <textarea 
                    value={data[key] || ''} 
                    onChange={e => setData({...data, [key]: e.target.value})}
                    placeholder={field.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={key === 'prompt' ? 4 : 3}
                    required={field.required}
                  />
                ) : field.type === 'number' ? (
                  <input 
                    type="number"
                    value={data[key] || field.default || ''} 
                    onChange={e => setData({...data, [key]: parseFloat(e.target.value) || field.default || 0})}
                    min={field.min}
                    max={field.max}
                    step={field.step || 0.1}
                    placeholder={field.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                  />
                ) : (
                  <input 
                    type={field.format === 'date' ? 'date' : 'text'}
                    value={data[key] || ''} 
                    onChange={e => setData({...data, [key]: e.target.value})}
                    placeholder={field.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                  />
                )}
                
                {field.placeholder && (
                  <p className="text-xs text-gray-500 mt-1">{field.placeholder}</p>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
            disabled={experimentsLoading}
          >
            {experimentsLoading ? 'Saving...' : (id ? 'Update Experiment' : 'Create Experiment')}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(`/testApp/${attrs.onSubmit.navPath}`)}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}