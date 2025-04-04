// src/modules/filters/components/FilterDialog.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import {
  CancelButton,
  InputField,
  SaveButton,
} from "@/components/studio";
import { FilterOperator, FilterActionParams } from "../types";
import { ContextItem } from "../../context/types";

// Interfejs dla formData z właściwym typem operatora
interface FilterFormData {
  name: string;
  contextKey: string;
  operator: FilterOperator;
  value: string;
}

interface FilterDialogProps {
  isOpen: boolean;
  title: string;
  contextItems: ContextItem[];
  onSubmit: (data: FilterActionParams) => void;
  onClose: () => void;
  initialData?: Partial<FilterFormData>;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  title,
  contextItems,
  onSubmit,
  onClose,
  initialData = {}
}) => {
  // Inicjalizacja formData z dostarczonymi danymi lub wartościami domyślnymi
  const [formData, setFormData] = useState<FilterFormData>({
    name: initialData.name || "",
    contextKey: initialData.contextKey || "",
    operator: initialData.operator || FilterOperator.EQUALS,
    value: initialData.value || "",
  });
  
  // Sprawdzenie, czy operator wymaga wartości
  const operatorNeedsValue = (operator: FilterOperator): boolean => {
    return ![FilterOperator.EMPTY, FilterOperator.NOT_EMPTY].includes(operator);
  };

  // Pomocnik do bezpiecznego rzutowania stringa na FilterOperator
  // const getFilterOperator = (value: string): FilterOperator => {
  //   if (Object.values(FilterOperator).includes(value as FilterOperator)) {
  //     return value as FilterOperator;
  //   }
  //   return FilterOperator.EQUALS; // Domyślna wartość
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'operator') {
      // Bezpieczne rzutowanie dla operatora
      if (Object.values(FilterOperator).includes(value as FilterOperator)) {
        setFormData((prev) => ({ ...prev, [name]: value as FilterOperator }));
        
        // Jeśli nowy operator nie wymaga wartości, wyczyść pole wartości
        if (!operatorNeedsValue(value as FilterOperator)) {
          setFormData(prev => ({ ...prev, value: "" }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.contextKey) return;
    
    onSubmit({
      name: formData.name,
      contextKey: formData.contextKey,
      operator: formData.operator,
      value: formData.value,
    });
  };

  const renderFooter = () => (
    <>
      <CancelButton onClick={onClose} />
      <SaveButton 
        onClick={handleSubmit} 
        disabled={!formData.name.trim() || !formData.contextKey} 
      />
    </>
  );
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Stwórz filtr do kontrolowania przepływu pracy na podstawie kontekstu
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <InputField
            id="name"
            name="name"
            label="Nazwa filtra"
            value={formData.name}
            onChange={handleChange}
            placeholder="Wprowadź nazwę filtra"
          />
          
          <div className="space-y-1">
            <label htmlFor="contextKey" className="block text-sm font-medium">
              Element kontekstu
            </label>
            <select
              id="contextKey"
              name="contextKey"
              value={formData.contextKey}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Wybierz element kontekstu</option>
              {contextItems.map((item) => (
                <option key={item.id} value={item.title}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="operator" className="block text-sm font-medium">
              Operator (prawda jeśli)
            </label>
            <select
              id="operator"
              name="operator"
              value={formData.operator}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Object.entries(FilterOperator).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.replace(/_/g, ' ').toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          
          {operatorNeedsValue(formData.operator) && (
            <InputField
              id="value"
              name="value"
              label="Wartość"
              value={formData.value}
              onChange={handleChange}
              placeholder="Wprowadź wartość"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          {renderFooter()}
        </div>
      </div>
    </div>
  );
};

export default FilterDialog;