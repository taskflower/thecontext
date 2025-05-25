// src/themes/test/steps/FormStep.tsx

import { useSchema, useStore } from '@/ngn2/cre';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function FormStep({ attrs }: any) {
  const navigate = useNavigate();
  const { id } = useParams();
  const store = useStore(attrs.onSubmit.collection);
  const { getSchema, loading: schemaLoading } = useSchema();
  const [data, setData] = useState<any>({});
  
  const schema = getSchema(attrs.schemaPath);
  
  useEffect(() => {
    if (id && store.initialized) {
      const existingItem = store.get(id);
      if (existingItem) {
        setData(existingItem);
      }
    } else if (schema?.properties) {
      const defaults: any = {};
      Object.entries(schema.properties).forEach(([k, v]: [string, any]) => {
        if (v.default) defaults[k] = v.default;
      });
      setData(defaults);
    }
  }, [id, schema, store.initialized]);
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    try {
      if (id) {
        await store.set(id, data);
      } else {
        await store.add(data);
      }
      navigate(`/testApp/${attrs.onSubmit.navPath}`);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save');
    }
  };
  
  if (schemaLoading || store.loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-600">Loading form...</span>
      </div>
    );
  }
  
  if (store.error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {store.error}</div>
        <button 
          onClick={store.refresh}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!schema) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">Schema not found for path: {attrs.schemaPath}</div>
        <div className="text-sm text-gray-500 mt-2">
          Check workspace configuration and schema path
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6">{attrs.title}</h2>
        
        {Object.entries(schema.properties).map(([key, field]: [string, any]) => {
          if (attrs.excludeFields?.includes(key)) return null;
          
          return (
            <div key={key} className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {field.label || key}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.enum ? (
                <select 
                  value={data[key] || ''} 
                  onChange={e => setData({...data, [key]: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required={field.required}
                />
              ) : field.type === 'number' ? (
                <input 
                  type="number"
                  value={data[key] || ''} 
                  onChange={e => setData({...data, [key]: parseFloat(e.target.value) || 0})}
                  min={field.min}
                  max={field.max}
                  step={field.step || 0.1}
                  placeholder={field.placeholder}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                />
              ) : (
                <input 
                  type={field.format === 'date' ? 'date' : 'text'}
                  value={data[key] || ''} 
                  onChange={e => setData({...data, [key]: e.target.value})}
                  placeholder={field.placeholder}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                />
              )}
              
              {field.placeholder && (
                <p className="text-xs text-gray-500 mt-1">{field.placeholder}</p>
              )}
            </div>
          );
        })}
        
        <div className="flex gap-2 mt-6">
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
            disabled={store.loading}
          >
            {store.loading ? 'Saving...' : (id ? 'Update' : 'Save')}
          </button>
          <button 
            type="button"
            onClick={() => navigate(`/testApp/${attrs.onSubmit.navPath}`)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}