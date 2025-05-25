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

export default function FormStep({ attrs, ticketId }: any) {
  const navigate = useNavigate();
  const params = useParams(); // Dodajemy useParams aby mieć dostęp do wszystkich parametrów
  
  // POPRAWKA: Używamy ticketId z props lub próbujemy wyciągnąć z params
  const editId = ticketId || params.id;
  
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('FormStep mounted with:', { editId, ticketId, params });
    
    if (editId) {
      loadTicket(editId);
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
  }, [editId]);

  const loadTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      console.log('Loading ticket with ID:', ticketId);
      
      const record = await configDB.records.get(`tickets:${ticketId}`);
      console.log('Loaded record:', record);
      
      if (record) {
        setData(record.data);
      } else {
        console.error('Ticket not found:', ticketId);
        alert('Zgłoszenie nie zostało znalezione');
        navigate('/exampleTicketApp/tickets/list');
      }
    } catch (error) {
      console.error('Failed to load ticket:', error);
      alert('Błąd podczas ładowania zgłoszenia');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const ticketId = editId || Date.now().toString();
      
      console.log('Saving ticket:', { ticketId, data });
      
      await configDB.records.put({
        id: `tickets:${ticketId}`,
        data: { ...data, id: ticketId },
        updatedAt: new Date()
      });
      
      console.log('Ticket saved successfully');
      navigate(`/exampleTicketApp/${attrs.onSubmit.navPath}`);
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
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {/* POPRAWKA: Dynamiczny tytuł w zależności od trybu */}
          {editId ? 'Edytuj zgłoszenie' : attrs.title}
        </h2>
        
        {/* DEBUG INFO */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            Debug: editId={editId}, mode={editId ? 'edit' : 'create'}
          </div>
        )}
        
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
            {saving ? 'Zapisywanie...' : (editId ? 'Zaktualizuj' : 'Zapisz')}
          </button>
          <button 
            type="button"
            onClick={() => navigate(`/exampleTicketApp/${attrs.onSubmit.navPath}`)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}