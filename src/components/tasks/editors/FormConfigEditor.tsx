/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/tasks/editors/FormConfigEditor.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/components/ui/select';

import { generateId } from '@/utils/utils';
import { IFormConfig, IFormField } from '@/utils/tasks/taskTypes';

interface FormConfigEditorProps {
  value: IFormConfig;
  onChange: (config: IFormConfig) => void;
}

export const FormConfigEditor: React.FC<FormConfigEditorProps> = ({ value, onChange }) => {
  const addField = () => {
    onChange({
      ...value,
      fields: [
        ...value.fields,
        {
          id: generateId(),
          type: 'text',
          label: 'Nowe pole',
          required: false
        }
      ]
    });
  };
  
  const updateField = (index: number, updates: Partial<IFormField>) => {
    const newFields = [...value.fields];
    newFields[index] = { ...newFields[index], ...updates };
    onChange({ ...value, fields: newFields });
  };
  
  const removeField = (index: number) => {
    onChange({
      ...value,
      fields: value.fields.filter((_, i) => i !== index)
    });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Konfiguracja formularza</h3>
      
      <div className="space-y-4">
        {value.fields.map((field, index) => (
          <div key={field.id} className="p-3 border rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Pole {index + 1}</h4>
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => removeField(index)}
              >
                Usuń
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">Etykieta</label>
                <Input 
                  value={field.label} 
                  onChange={e => updateField(index, { label: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm">Typ pola</label>
                <Select 
                  value={field.type}
                  onValueChange={value => updateField(index, { type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Tekst</SelectItem>
                    <SelectItem value="textarea">Długi tekst</SelectItem>
                    <SelectItem value="select">Lista wyboru</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="number">Liczba</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox"
                id={`required-${field.id}`}
                checked={field.required}
                onChange={e => updateField(index, { required: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor={`required-${field.id}`} className="text-sm">
                Wymagane
              </label>
            </div>
            
            {field.type === 'select' && (
              <div>
                <label className="text-sm">Opcje (oddzielone przecinkiem)</label>
                <Input 
                  value={field.options?.join(', ') || ''}
                  onChange={e => updateField(index, { 
                    options: e.target.value.split(',').map(o => o.trim()) 
                  })}
                  placeholder="Opcja 1, Opcja 2, Opcja 3"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <Button onClick={addField}>Dodaj pole</Button>
      
      <div>
        <label className="text-sm">Etykieta przycisku</label>
        <Input 
          value={value.submitLabel || ''}
          onChange={e => onChange({ ...value, submitLabel: e.target.value })}
          placeholder="Zapisz"
        />
      </div>
      
      <div>
        <label className="text-sm">Akcja po zapisie</label>
        <Select 
          value={value.onSubmitAction || 'next_step'}
          onValueChange={value => onChange({ 
            ...value, 
            onSubmitAction: value as any 
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="next_step">Przejdź do następnego kroku</SelectItem>
            <SelectItem value="complete_task">Zakończ zadanie</SelectItem>
            <SelectItem value="custom">Niestandardowa akcja</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};