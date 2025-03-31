// src/modules/filters/components/EditFilterDialog.tsx
import React from "react";
import { Filter, FilterActionParams } from "../types";
import FilterDialog from "./FilterDialog";
import { ContextItem } from "../../context/types";

interface EditFilterDialogProps {
  filter: Filter;
  contextItems: ContextItem[];
  onSubmit: (data: Partial<FilterActionParams>) => void;
  onClose: () => void;
}

const EditFilterDialog: React.FC<EditFilterDialogProps> = ({
  filter,
  contextItems,
  onSubmit,
  onClose
}) => {
  // Wykorzystujemy istniejący komponent FilterDialog, przekazując mu dane filtra do edycji
  return (
    <FilterDialog
      isOpen={true}
      title="Edytuj filtr"
      contextItems={contextItems}
      onSubmit={onSubmit}
      onClose={onClose}
      initialData={{
        name: filter.name,
        contextKey: filter.contextKey,
        operator: filter.operator,
        value: filter.value || "",
      }}
    />
  );
};

export default EditFilterDialog;