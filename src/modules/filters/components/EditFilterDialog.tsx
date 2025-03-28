// src/modules/filters/components/EditFilterDialog.tsx
import React, { useState } from "react";
import { useAppStore } from "../../store";
import { Filter, FilterOperator } from "../types";
import FilterDialog from "./FilterDialog";

// Interfejs dla formData z poprawnym typem operatora
interface FilterFormData {
  name: string;
  contextKey: string;
  operator: FilterOperator;
  value: string;
}

interface EditFilterDialogProps {
  filter: Filter;
  handleClose: () => void;
  contextItems: {
    id: string;
    title: string;
    content: string;
  }[];
  scenarioId?: string;
}

const EditFilterDialog: React.FC<EditFilterDialogProps> = ({
  filter,
  handleClose,
  contextItems,
  scenarioId
}) => {
  const updateScenarioFilter = useAppStore((state) => state.updateScenarioFilter);
  
  // Inicjalizacja formData z właściwymi typami
  const [formData, setFormData] = useState<FilterFormData>({
    name: filter.name,
    contextKey: filter.contextKey,
    operator: filter.operator,
    value: filter.value || "",
  });
  
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    
    if (name === 'operator') {
      // Bezpieczne rzutowanie dla operatora
      if (Object.values(FilterOperator).includes(value as FilterOperator)) {
        setFormData((prev) => ({ ...prev, [name]: value as FilterOperator }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.contextKey) return;
    
    updateScenarioFilter(filter.id, {
      name: formData.name,
      contextKey: formData.contextKey,
      operator: formData.operator,
      value: formData.value,
    }, scenarioId);
    
    handleClose();
  };
  
  return (
    <FilterDialog
      isOpen={true}
      title="Edytuj filtr"
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleClose={handleClose}
      contextItems={contextItems}
    />
  );
};

export default EditFilterDialog;