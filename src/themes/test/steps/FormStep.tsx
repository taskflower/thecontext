// src/themes/test/steps/FormStep.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { configDB } from '../../../db';

// Hardcoded ticket schema (z konfiguracji workspace)
const ticketSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      label: "Tytuł zgłoszenia",
      required: true
    },
    description: {
      type: "string",
      label: "Opis",
      widget: "textarea",
      required: true
    },
    priority: {
      type: "string",
      label: "Priorytet",
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      required: true
    },
    status: {
      type: "string",
      label: "Status",
      enum: ["new", "in_progress", "resolved", "closed"],
      default: "new",
      required: true
    },
    category: {
      type: "string",
      label: "Kategoria",
      enum: ["bug", "feature", "support", "question"],
      required: true
    },
    assignee: {
      type: "string",
      label: "Przypisany do"
    },
    reporter: {
      type: "string",
      label: "Zgłaszający",
      required: true
    },
    dueDate: {
      type: "string",
      format: "date",
      label: "Termin wykonania"
    }
  }
};

export default function FormStep({ attrs }: any) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadTicket(id);
    } else {
      // Set defaults for new ticket
      const defaults: any = {};
      Object.entries(ticketSchema.properties).forEach(([key, field]: [string, any]) => {
        if (field.default) {
          defaults[key] = field.default;
        }
      });
      setData(defaults);
    }
  }, [id]);

  const loadTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      const record = await configDB.records.get(`tickets:${ticketId}`);
      if (record) {
        setData(record.data);
      }
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const ticketId = id || Date.now().toString();
      
      await configDB.records.put({
        id: `tickets:${ticketId}`,
        data: { ...data, id: ticketId },
        updatedAt: new Date()
      });
      
      navigate(`/testApp/${attrs.onSubmit.navPath}`);
    } catch (error) {
      console.error('Failed to save ticket:', error);
      alert('Błąd podczas zapisywania zgłoszenia');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-600">Ładowanie formularza...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{attrs.title}</h2>
        
        {Object.entries(ticketSchema.properties).map(([key, field]: [string, any]) => {
          // Skip excluded fields
          if (attrs.excludeFields?.includes(key)) return null;
          
          return (
            <div key={key} className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {field.label || key}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.enum ? (
                <select 
                  value={data[key] || ''} 
                  onChange={e => setData({...data, [key]: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                >
                  <option value="">Wybierz...</option>
                  {field.enum.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {key === 'priority' ? 
                        (opt === 'low' ? 'niski' : opt === 'medium' ? 'średni' : opt === 'high' ? 'wysoki' : 'pilny') :
                       key === 'status' ?
                        (opt === 'new' ? 'nowe' : opt === 'in_progress' ? 'w trakcie' : opt === 'resolved' ? 'rozwiązane' : 'zamknięte') :
                       key === 'category' ?
                        (opt === 'bug' ? 'błąd' : opt === 'feature' ? 'funkcja' : opt === 'support' ? 'wsparcie' : 'pytanie') :
                       opt}
                    </option>
                  ))}
                </select>
              ) : field.widget === 'textarea' ? (
                <textarea 
                  value={data[key] || ''} 
                  onChange={e => setData({...data, [key]: e.target.value})}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required={field.required}
                />
              ) : field.format === 'date' ? (
                <input 
                  type="date"
                  value={data[key] || ''} 
                  onChange={e => setData({...data, [key]: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                />
              ) : (
                <input 
                  type="text"
                  value={data[key] || ''} 
                  onChange={e => setData({...data, [key]: e.target.value})}
                  placeholder={field.placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                />
              )}
            </div>
          );
        })}
        
        <div className="flex gap-3 mt-8">
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Zapisywanie...' : (id ? 'Zaktualizuj' : 'Zapisz')}
          </button>
          <button 
            type="button"
            onClick={() => navigate(`/testApp/${attrs.onSubmit.navPath}`)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}