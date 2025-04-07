// components/nodes/NodeEditor.tsx
import React, { ChangeEvent } from 'react';
import { FormField } from '../theme';
import useStore from '@/store';


const NodeEditor: React.FC = () => {
  const nodeForm = useStore(state => state.nodeForm);
  const updateNode = useStore(state => state.updateNode);
  const setView = useStore(state => state.setView);
  
  if (!nodeForm) return null;
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    useStore.setState({ nodeForm: { ...nodeForm, [name]: value } });
  };
  
  const handleCancel = () => {
    useStore.setState({ nodeForm: null });
    setView('flow');
  };
  
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Edycja węzła: {nodeForm.label}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={(e) => { e.preventDefault(); updateNode(); }}>
          <FormField
            label="Etykieta"
            name="label"
            value={nodeForm.label}
            onChange={handleChange}
            placeholder="Etykieta węzła"
            required
          />
          
          <FormField
            label="Opis"
            name="description"
            value={nodeForm.description}
            onChange={handleChange}
            placeholder="Opcjonalny opis"
          />
          
          <FormField
            label="Wiadomość asystenta"
            name="assistantMessage"
            value={nodeForm.assistantMessage}
            onChange={handleChange}
            placeholder="Wiadomość wyświetlana użytkownikowi"
            rows={6}
            hint="Użyj {{nazwa_zmiennej}} aby wstawić wartość z kontekstu."
          />
          
          <FormField
            label="Klucz kontekstu"
            name="contextKey"
            value={nodeForm.contextKey}
            onChange={handleChange}
            placeholder="Nazwa zmiennej kontekstowej (opcjonalnie)"
            hint="Jeśli wypełnione, odpowiedź użytkownika będzie zapisana pod tą nazwą."
          />
          
          <FormField
            label="Ścieżka JSON"
            name="contextJsonPath"
            value={nodeForm.contextJsonPath || ''}
            onChange={handleChange}
            placeholder="Ścieżka JSON dla zagnieżdżonych danych (opcjonalnie)"
            hint="Przykład: user.preferences.theme"
          />
          
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >Anuluj</button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >Zapisz</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeEditor;