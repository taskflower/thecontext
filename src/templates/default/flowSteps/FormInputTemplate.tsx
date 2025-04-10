// src/templates/default/flowSteps/FormInputTemplate.tsx
import { useContextStore } from '@/lib/contextStore';
import React, { useState } from 'react';
import { FlowStepProps } from 'template-registry-module';


const FormInputTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  // Stan formularza
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Pobieramy funkcje kontekstu z Zustand
  const processTemplate = useContextStore(state => state.processTemplate);
  const updateContextPath = useContextStore(state => state.updateContextPath);
  
  // Przetwarzamy wiadomość asystenta z zmiennymi kontekstowymi
  const assistantMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';
  
  // Obsługa zmian pól formularza
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Obsługa zatwierdzenia formularza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Jeśli węzeł ma klucz kontekstu, aktualizuj kontekst
    if (node.contextKey && node.formFields) {
      // Dla każdego pola formularza
      node.formFields.forEach(field => {
        // Jeśli pole ma wartość
        if (formData[field.name] !== undefined) {
          // Aktualizuj kontekst za pomocą updateContextPath
          updateContextPath(
            node.contextKey as string, 
            field.name, // Używamy nazwy pola jako ścieżki JSON
            formData[field.name]
          );
        }
      });
    }
    
    // Wywołaj callback z danymi formularza
    onSubmit(formData);
  };
  
  // Renderuj pola formularza
  const renderFormFields = () => {
    if (!node.formFields) return null;
    
    return node.formFields.map(field => {
      // Domyślny input tekstowy
      if (field.type === 'text' || !field.type) {
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-gray-700 mb-2">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <input
              type="text"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full p-2 border rounded-md"
              required={field.required}
            />
          </div>
        );
      }
      
      // Input numeryczny
      if (field.type === 'number') {
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-gray-700 mb-2">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <input
              type="number"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              required={field.required}
            />
          </div>
        );
      }
      
      // Dropdown
      if (field.type === 'select' && field.options) {
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-gray-700 mb-2">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
            <select
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full p-2 border rounded-md"
              required={field.required}
            >
              <option value="">Wybierz...</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      }
      
      return null;
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Wiadomość asystenta */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="whitespace-pre-line">{assistantMessage}</p>
      </div>
      
      {/* Formularz */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderFormFields()}
        
        <div className="flex justify-between">
          {/* Przycisk powrotu */}
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
          >
            Wstecz
          </button>
          
          {/* Przycisk zatwierdzenia */}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {isLastNode ? 'Zakończ' : 'Dalej'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormInputTemplate;