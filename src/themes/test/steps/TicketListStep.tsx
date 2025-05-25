// src/themes/test/steps/TicketListStep.tsx
import { useStore } from '@/ngn2/cre';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TicketListStep({ attrs }: any) {
  const navigate = useNavigate();
  const store = useStore(attrs.collection);
  const [items, setItems] = useState<any[]>([]);
  
  // Update items when store changes or loading completes
  useEffect(() => {
    if (!store.isLoading) {
      setItems(store.getAll());
    }
  }, [store.isLoading, store.getAll().length]);
  
  // Show loading state
  if (store.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading tickets...</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl">{attrs.title}</h1>
        {attrs.widgets?.map((w: any, i: number) => (
          <button 
            key={i}
            onClick={() => navigate(`/testApp/${w.attrs.navPath}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {w.label}
          </button>
        ))}
      </div>
      
      {items.length === 0 ? (
        <div className="text-center p-8">
          <div className="text-gray-400 text-lg mb-4">No tickets yet</div>
          <button 
            onClick={() => navigate('/testApp/tickets/create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create Your First Ticket
          </button>
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{item.title}</div>
                    {item.description && (
                      <div className="text-sm text-gray-600 truncate max-w-xs">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                      item.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => navigate(`/testApp/tickets/edit/form/${item.id}`)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this ticket?')) {
                          store.delete(item.id);
                          setItems(store.getAll());
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

