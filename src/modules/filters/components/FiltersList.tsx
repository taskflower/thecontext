// src/modules/filters/components/FiltersList.tsx
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useAppStore } from "../../store";
import { Filter as FilterType, FilterOperator } from "../types";
import { useDialogState } from "../../common/hooks";
import FilterItem from "./FilterItem";
import FilterDialog from "./FilterDialog";
import EditFilterDialog from "./EditFilterDialog";
import FilterStatusBanner from "./FilterStatusBanner";

// Dodanie interfejsu dla props
interface FiltersListProps {
  scenarioId?: string; // Opcjonalne ID scenariusza
}

// Interfejs dla formData z poprawnym typem operatora
interface FilterFormData {
  name: string;
  contextKey: string;
  operator: FilterOperator;
  value: string;
}

const FiltersList: React.FC<FiltersListProps> = ({ scenarioId }) => {
  const getScenarioFilters = useAppStore((state) => state.getScenarioFilters);
  const getContextItems = useAppStore((state) => state.getContextItems);
  const addScenarioFilter = useAppStore((state) => state.addScenarioFilter);
  const deleteScenarioFilter = useAppStore((state) => state.deleteScenarioFilter);
  const toggleScenarioFilter = useAppStore((state) => state.toggleScenarioFilter);
  const checkScenarioFilterMatch = useAppStore((state) => state.checkScenarioFilterMatch);
  
  // Wymuszenie aktualizacji komponentu przy zmianie stanu
  useAppStore((state) => state.stateVersion);
  
  // Pobieranie filtrów z określonego scenariusza, jeśli ID zostało podane
  const filters = scenarioId 
    ? getScenarioFilters(scenarioId) 
    : getScenarioFilters();
    
  const contextItems = getContextItems();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingFilter, setEditingFilter] = useState<FilterType | null>(null);
  
  // Użycie właściwego typu dla formData
  const { isOpen, formData, openDialog, handleChange, setIsOpen } =
    useDialogState<FilterFormData>({
      name: "",
      contextKey: "",
      operator: FilterOperator.EQUALS, // Użycie enum zamiast stringa
      value: "",
    });
  
  const handleAddFilter = () => {
    if (!formData.name.trim() || !formData.contextKey) return;
    
    addScenarioFilter({
      name: formData.name,
      contextKey: formData.contextKey,
      operator: formData.operator, // Teraz operator jest właściwego typu
      value: formData.value,
    }, scenarioId);
    
    setIsOpen(false);
  };
  
  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };
  
  const handleEditFilter = (filter: FilterType) => {
    setEditingFilter(filter);
    setMenuOpen(null);
  };
  
  const hasActiveFilters = filters.some(f => f.enabled);
  const filtersMatch = checkScenarioFilterMatch(scenarioId);
  
  return (
    <div className="h-full flex flex-col">
      {/* Nagłówek filtrów */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-base font-medium">Filtry</h2>
        <button
          onClick={() => openDialog()}
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Dodaj filtr"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>
      
      {/* Status filtrów */}
      {hasActiveFilters && (
        <FilterStatusBanner
          filtersMatch={filtersMatch}
          activeFiltersCount={filters.filter(f => f.enabled).length}
        />
      )}
      
      {/* Lista filtrów */}
      <div className="flex-1 overflow-auto p-2">
        {filters.length > 0 ? (
          <ul className="space-y-0.5">
            {filters.map((filter) => (
              <FilterItem
                key={filter.id}
                filter={filter}
                onEdit={handleEditFilter}
                onDelete={(id) => deleteScenarioFilter(id, scenarioId)}
                onToggle={(id) => toggleScenarioFilter(id, scenarioId)}
                menuOpen={menuOpen === filter.id}
                toggleMenu={() => toggleMenu(filter.id)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            <p className="text-sm">Brak zdefiniowanych filtrów</p>
            <p className="text-xs mt-1">
              Dodaj filtry, aby kontrolować przepływ pracy na podstawie kontekstu
            </p>
          </div>
        )}
      </div>
      
      {/* Dialog dodawania filtra */}
      <FilterDialog
        isOpen={isOpen}
        title="Dodaj filtr"
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleAddFilter}
        handleClose={() => setIsOpen(false)}
        contextItems={contextItems}
      />
      
      {/* Dialog edycji filtra */}
      {editingFilter && (
        <EditFilterDialog
          filter={editingFilter}
          handleClose={() => setEditingFilter(null)}
          contextItems={contextItems}
          scenarioId={scenarioId}
        />
      )}
    </div>
  );
};

export default FiltersList;