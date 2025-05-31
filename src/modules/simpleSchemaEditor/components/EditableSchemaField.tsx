// src/modules/simpleSchemaEditor/components/EditableSchemaField.tsx
import React, { useState } from 'react';
import { Edit3, Trash2, Type, Hash, CheckSquare, Mail, Calendar, User, List, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { SchemaField } from '../types';

interface EditableSchemaFieldProps {
  fieldName: string;
  fieldData: SchemaField;
  onUpdate: (fieldData: SchemaField) => void;
  onRemove: () => void;
  onRename: (newName: string) => void;
}

export const EditableSchemaField: React.FC<EditableSchemaFieldProps> = ({
  fieldName,
  fieldData,
  onUpdate,
  onRemove,
  onRename
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFieldName, setLocalFieldName] = useState(fieldName);

  const updateField = (updates: Partial<SchemaField>) => {
    onUpdate({ ...fieldData, ...updates });
  };

  const getFieldIcon = () => {
    switch (fieldData.fieldType || fieldData.type) {
      case 'text': return <Type size={12} />;
      case 'textarea': return <FileText size={12} />;
      case 'select': return <List size={12} />;
      case 'checkbox': return <CheckSquare size={12} />;
      case 'email': return <Mail size={12} />;
      case 'date': return <Calendar size={12} />;
      case 'number': return <Hash size={12} />;
      case 'userSelect': return <User size={12} />;
      default: return <Type size={12} />;
    }
  };

  const getFieldTypeBadge = () => {
    switch (fieldData.fieldType || fieldData.type) {
      case 'text': return 'Tekst';
      case 'textarea': return 'Długi';
      case 'select': return 'Lista';
      case 'checkbox': return 'Tak/Nie';
      case 'email': return 'Email';
      case 'date': return 'Data';
      case 'number': return 'Liczba';
      case 'userSelect': return 'User';
      default: return 'Tekst';
    }
  };

  const getBadgeColor = () => {
    const type = fieldData.fieldType || fieldData.type;
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-700';
      case 'textarea': return 'bg-indigo-100 text-indigo-700';
      case 'select': return 'bg-orange-100 text-orange-700';
      case 'checkbox': return 'bg-purple-100 text-purple-700';
      case 'email': return 'bg-cyan-100 text-cyan-700';
      case 'date': return 'bg-pink-100 text-pink-700';
      case 'number': return 'bg-green-100 text-green-700';
      case 'userSelect': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  const fieldTypeOptions = [
    { value: 'text', label: 'Tekst' },
    { value: 'textarea', label: 'Długi tekst' },
    { value: 'select', label: 'Lista' },
    { value: 'checkbox', label: 'Tak/Nie' },
    { value: 'email', label: 'Email' },
    { value: 'date', label: 'Data' },
    { value: 'number', label: 'Liczba' },
    { value: 'userSelect', label: 'Użytkownik' }
  ];

  const handleFieldNameBlur = () => {
    if (localFieldName !== fieldName && localFieldName.trim()) {
      onRename(localFieldName.trim());
    } else if (!localFieldName.trim()) {
      setLocalFieldName(fieldName);
    }
  };

  return (
    <div className="border border-zinc-200 rounded overflow-hidden bg-white">
      {/* Compact Field Row */}
      <div className="p-2 flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-zinc-400 hover:text-zinc-600 p-0.5"
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        
        <div className="text-zinc-500 flex-shrink-0">
          {getFieldIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={localFieldName}
              onChange={(e) => setLocalFieldName(e.target.value)}
              onBlur={handleFieldNameBlur}
              className="text-xs font-medium text-zinc-900 bg-transparent border-0 focus:outline-none focus:bg-zinc-50 focus:border focus:border-blue-500 focus:rounded px-1 py-0.5 min-w-0 flex-1"
            />
            {fieldData.required && (
              <span className="text-red-500 text-xs">*</span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-xs px-1.5 py-0.5 rounded ${getBadgeColor()}`}>
              {getFieldTypeBadge()}
            </span>
            {fieldData.description && (
              <span className="text-xs text-zinc-500 truncate">
                {fieldData.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => {
              if (confirm(`Usunąć pole "${fieldName}"?`)) {
                onRemove();
              }
            }}
            className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Usuń"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Expanded Editor */}
      {isExpanded && (
        <div className="bg-zinc-50 border-t border-zinc-200 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Field Type */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Typ
              </label>
              <select
                value={fieldData.fieldType || fieldData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  updateField({ 
                    fieldType: newType as any,
                    type: newType === 'number' ? 'number' : newType === 'checkbox' ? 'boolean' : 'string'
                  });
                }}
                className="w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {fieldTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Required */}
            <div className="flex items-center pt-4">
              <input
                type="checkbox"
                id={`${fieldName}-required`}
                checked={fieldData.required || false}
                onChange={(e) => updateField({ required: e.target.checked })}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 mr-1.5 w-3 h-3"
              />
              <label htmlFor={`${fieldName}-required`} className="text-xs text-zinc-700">
                Wymagane
              </label>
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Etykieta
            </label>
            <input
              type="text"
              value={fieldData.label || ''}
              onChange={(e) => updateField({ label: e.target.value })}
              placeholder={localFieldName}
              className="w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Opis
              </label>
              <input
                type="text"
                value={fieldData.description || ''}
                onChange={(e) => updateField({ description: e.target.value })}
                placeholder="Opis dla użytkownika..."
                className="w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* AI Hint */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                AI Hint
              </label>
              <input
                type="text"
                value={fieldData.aiHint || ''}
                onChange={(e) => updateField({ aiHint: e.target.value })}
                placeholder="Wskazówka dla AI..."
                className="w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Default Value */}
          {fieldData.fieldType !== 'checkbox' && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Wartość domyślna
              </label>
              <input
                type={fieldData.fieldType === 'number' ? 'number' : 'text'}
                value={fieldData.default || ''}
                onChange={(e) => updateField({ 
                  default: fieldData.fieldType === 'number' ? Number(e.target.value) : e.target.value 
                })}
                placeholder="Opcjonalna..."
                className="w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Select Options */}
          {fieldData.fieldType === 'select' && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Opcje
              </label>
              <div className="space-y-1.5">
                {(fieldData.enum || []).map((value, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const newEnum = [...(fieldData.enum || [])];
                        newEnum[index] = e.target.value;
                        updateField({ enum: newEnum });
                      }}
                      placeholder="Wartość"
                      className="flex-1 px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={fieldData.enumLabels?.[value] || ''}
                      onChange={(e) => {
                        const newLabels = { ...fieldData.enumLabels };
                        newLabels[value] = e.target.value;
                        updateField({ enumLabels: newLabels });
                      }}
                      placeholder="Etykieta"
                      className="flex-1 px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newEnum = (fieldData.enum || []).filter((_, i) => i !== index);
                        const newLabels = { ...fieldData.enumLabels };
                        delete newLabels[value];
                        updateField({ enum: newEnum, enumLabels: newLabels });
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newEnum = [...(fieldData.enum || []), ''];
                    updateField({ enum: newEnum });
                  }}
                  className="w-full px-2 py-1 text-xs border border-dashed border-zinc-300 rounded text-zinc-500 hover:bg-zinc-50 transition-colors"
                >
                  + Opcja
                </button>
              </div>
            </div>
          )}

          {/* Number constraints */}
          {fieldData.fieldType === 'number' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Min
                </label>
                <input
                  type="number"
                  value={fieldData.minimum || ''}
                  onChange={(e) => updateField({ minimum: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Max
                </label>
                <input
                  type="number"
                  value={fieldData.maximum || ''}
                  onChange={(e) => updateField({ maximum: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};