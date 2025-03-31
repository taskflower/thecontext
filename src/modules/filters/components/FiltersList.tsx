// src/modules/filters/components/FiltersList.tsx
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { FiltersListProps } from "../types";
import { useFilters } from "../hooks/useFilters";
import FilterItem from "./FilterItem";
import FilterDialog from "./FilterDialog";
import EditFilterDialog from "./EditFilterDialog";
import FilterStatusBanner from "./FilterStatusBanner";

const FiltersList: React.FC<FiltersListProps> = ({ scenarioId }) => {
  // Wykorzystanie hooka useFilters - pobieranie wszystkich funkcjonalności z jednego miejsca
  const {
    filters,
    activeFilters,
    filtersMatch,
    hasActiveFilters,
    contextItems,
    menuOpen,
    editingFilter,
    toggleMenu,
    handleEditFilter,
    handleDeleteFilter,
    handleToggleFilter,
    clearEditingFilter,
    handleAddFilter,
    handleUpdateFilter
  } = useFilters(scenarioId);
  
  // Lokalny stan UI - dialog dodawania
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  return (
    <div className="h-full flex flex-col">
      {/* Nagłówek filtrów */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-base font-medium">Filtry</h2>
        <button
          onClick={() => setIsAddDialogOpen(true)}
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
          activeFiltersCount={activeFilters.length}
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
                onDelete={handleDeleteFilter}
                onToggle={handleToggleFilter}
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
      {isAddDialogOpen && (
        <FilterDialog
          isOpen={true}
          title="Dodaj filtr"
          contextItems={contextItems}
          onSubmit={handleAddFilter}
          onClose={() => setIsAddDialogOpen(false)}
        />
      )}
      
      {/* Dialog edycji filtra */}
      {editingFilter && (
        <EditFilterDialog
          filter={editingFilter}
          contextItems={contextItems}
          onSubmit={(data) => handleUpdateFilter(editingFilter.id, data)}
          onClose={clearEditingFilter}
        />
      )}
    </div>
  );
};

export default FiltersList;