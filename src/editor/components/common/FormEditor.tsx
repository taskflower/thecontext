// src/editor/components/common/FormEditor.tsx
import React from 'react';

interface FormEditorProps {
  schema: any;
  formData: any;
  onChange: (formData: any) => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({ 
  schema, 
  formData, 
  onChange 
}) => {
  // Funkcja generująca formularze na podstawie schema
  const renderFormField = (propName: string, propSchema: any, path: string = '') => {
    const currentPath = path ? `${path}.${propName}` : propName;
    const fieldValue = getValueByPath(formData, currentPath);
    
    // Renderowanie odpowiedniego typu pola
    switch (propSchema.type) {
      case 'string':
        // Wybór z listy enum
        if (propSchema.enum) {
          return (
            <div key={propName} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {propSchema.title || propName}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={fieldValue || ''}
                onChange={(e) => handleFieldChange(currentPath, e.target.value)}
              >
                <option value="">Wybierz...</option>
                {propSchema.enum.map((option: string, index: number) => (
                  <option key={option} value={option}>
                    {propSchema.enumNames ? propSchema.enumNames[index] : option}
                  </option>
                ))}
              </select>
              {propSchema.description && (
                <p className="mt-1 text-xs text-gray-500">{propSchema.description}</p>
              )}
            </div>
          );
        }
        
        // Pole tekstowe
        return (
          <div key={propName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {propSchema.title || propName}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(currentPath, e.target.value)}
            />
            {propSchema.description && (
              <p className="mt-1 text-xs text-gray-500">{propSchema.description}</p>
            )}
          </div>
        );
        
      case 'number':
      case 'integer':
        return (
          <div key={propName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {propSchema.title || propName}
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={fieldValue || ''}
              onChange={(e) => {
                const value = e.target.value !== '' ? Number(e.target.value) : '';
                handleFieldChange(currentPath, value);
              }}
              min={propSchema.minimum}
              max={propSchema.maximum}
            />
            {propSchema.description && (
              <p className="mt-1 text-xs text-gray-500">{propSchema.description}</p>
            )}
          </div>
        );
        
      case 'boolean':
        return (
          <div key={propName} className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={!!fieldValue}
                onChange={(e) => handleFieldChange(currentPath, e.target.checked)}
              />
              <label className="ml-2 text-sm text-gray-700">
                {propSchema.title || propName}
              </label>
            </div>
            {propSchema.description && (
              <p className="mt-1 text-xs text-gray-500 ml-6">{propSchema.description}</p>
            )}
          </div>
        );
        
      case 'object':
        return (
          <div key={propName} className="mb-4 border border-gray-200 rounded-md p-3 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-3">
              {propSchema.title || propName}
            </div>
            
            {propSchema.properties && Object.entries(propSchema.properties).map(([nestedPropName, nestedPropSchema]) => 
              renderFormField(nestedPropName, nestedPropSchema as any, currentPath)
            )}
          </div>
        );
        
      case 'array':
        return (
          <div key={propName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {propSchema.title || propName}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Edycja tablic nie jest wspierana w trybie formularza. Użyj trybu JSON.
            </p>
          </div>
        );
        
      default:
        return (
          <div key={propName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {propSchema.title || propName} (Nieznany typ)
            </label>
            <p className="text-xs text-gray-500">
              Ten typ pola nie jest wspierany w trybie formularza. Użyj trybu JSON.
            </p>
          </div>
        );
    }
  };
  
  // Uzyskaj wartość na podstawie ścieżki (np. "user.address.street")
  const getValueByPath = (obj: any, path: string) => {
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    
    return value;
  };
  
  // Ustaw wartość na podstawie ścieżki
  const setValueByPath = (obj: any, path: string, value: any) => {
    const parts = path.split('.');
    const lastPart = parts.pop();
    
    if (!lastPart) return obj;
    
    let current = obj;
    
    // Twórz brakujące obiekty po drodze
    for (const part of parts) {
      if (current[part] === undefined || current[part] === null) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Ustaw wartość
    current[lastPart] = value;
    
    return obj;
  };
  
  // Obsługa zmiany pola
  const handleFieldChange = (path: string, value: any) => {
    const updatedFormData = { ...formData };
    setValueByPath(updatedFormData, path, value);
    onChange(updatedFormData);
  };
  
  return (
    <div>
      {schema.properties && Object.entries(schema.properties).map(([propName, propSchema]) => 
        renderFormField(propName, propSchema as any)
      )}
    </div>
  );
};