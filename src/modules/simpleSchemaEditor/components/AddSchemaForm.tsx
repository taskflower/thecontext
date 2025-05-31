// src/modules/simpleSchemaEditor/components/AddSchemaForm.tsx
import React, { useState } from 'react';
import { Plus, X, User, Ticket, Package, FileText } from 'lucide-react';

interface AddSchemaFormProps {
  onAdd: (name: string) => void;
  onCancel: () => void;
}

export const AddSchemaForm: React.FC<AddSchemaFormProps> = ({ onAdd, onCancel }) => {
  const [schemaName, setSchemaName] = useState('');

  const templates = [
    { 
      id: 'user', 
      name: 'Użytkownik', 
      description: 'Imię, email, rola',
      icon: <User size={12} />
    },
    { 
      id: 'ticket', 
      name: 'Zgłoszenie', 
      description: 'Tytuł, opis, status',
      icon: <Ticket size={12} />
    },
    { 
      id: 'product', 
      name: 'Produkt', 
      description: 'Nazwa, cena, kategoria',
      icon: <Package size={12} />
    },
    { 
      id: 'empty', 
      name: 'Pusty', 
      description: 'Zacznij od zera',
      icon: <FileText size={12} />
    }
  ];

  const createSchemaFromTemplate = (templateId: string) => {
    if (!schemaName.trim()) return;
    onAdd(schemaName.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (schemaName.trim()) {
      createSchemaFromTemplate('empty');
    }
  };

  return (
    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-green-800 flex items-center gap-1">
          <Plus size={12} />
          Dodaj schemat
        </h4>
        <button
          onClick={onCancel}
          className="text-green-600 hover:text-green-800 p-0.5"
        >
          <X size={12} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
          placeholder="Nazwa schematu..."
          className="w-full px-2 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
          autoFocus
        />

        <div className="grid grid-cols-2 gap-1.5">
          {templates.map(template => (
            <button
              key={template.id}
              type="button"
              onClick={() => createSchemaFromTemplate(template.id)}
              disabled={!schemaName.trim()}
              className={`p-2 text-left border rounded text-xs transition-colors ${
                !schemaName.trim()
                  ? 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed'
                  : 'bg-white border-zinc-300 hover:border-green-400 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center gap-1 font-medium mb-0.5">
                {template.icon}
                {template.name}
              </div>
              <div className="text-xs text-zinc-500 leading-tight">{template.description}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={!schemaName.trim()}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              !schemaName.trim()
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Plus size={10} />
            Utwórz pusty
          </button>
        </div>
      </form>
    </div>
  );
};