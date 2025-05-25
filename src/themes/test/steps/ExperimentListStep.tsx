// src/themes/test/steps/ExperimentListStep.tsx
import { useStore } from '@/ngn2/cre';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExperimentListStep({ attrs }: any) {
  const navigate = useNavigate();
  const store = useStore(attrs.collection);
  const [items, setItems] = useState<any[]>([]);
  
  // Update items when store changes or loading completes
  useEffect(() => {
    if (!store.isLoading) {
      setItems(store.getAll());
    }
  }, [store.isLoading, store.getAll().length]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Show loading state
  if (store.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading experiments...</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{attrs.title}</h1>
        <div className="flex gap-2">
          {attrs.widgets?.map((w: any, i: number) => (
            <button 
              key={i}
              onClick={() => {
                if (w.attrs?.navPath) {
                  navigate(`/testApp/${w.attrs.navPath}`);
                } else if (w.attrs?.action === 'import_templates') {
                  navigate('/testApp/experiments/templates');
                }
              }}
              className={`px-4 py-2 rounded font-medium ${
                w.variant === 'primary' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No experiments yet</div>
          <button 
            onClick={() => navigate('/testApp/experiments/create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create Your First Experiment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg truncate">{item.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>
              
              <div className="text-xs text-gray-500 mb-3">
                <div>Type: <span className="font-medium">{item.configType}</span></div>
                <div>Target: <span className="font-medium">{item.targetPath}</span></div>
              </div>
              
              {item.tags && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/testApp/experiments/run/execution/${item.id}`)}
                  disabled={item.status === 'running'}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {item.status === 'running' ? 'Running...' : 'Run'}
                </button>
                
                <button 
                  onClick={() => navigate(`/testApp/experiments/edit/form/${item.id}`)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this experiment?')) {
                      store.delete(item.id);
                      setItems(store.getAll());
                    }
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}