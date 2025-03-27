// src/modules/filters/components/FiltersList.tsx
import React, { useState } from "react";
import { Edit, PlusCircle, MoreHorizontal, X, Filter, ToggleLeft, ToggleRight } from "lucide-react";
import { useAppStore } from "../../store";
import { Filter as FilterType, FilterOperator } from "../types";
import { useDialogState } from "../../common/hooks";
import { cn } from "@/utils/utils";

// Dodanie interfejsu dla props
interface FiltersListProps {
  scenarioId?: string; // Opcjonalne ID scenariusza
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
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } =
    useDialogState<{
      name: string;
      contextKey: string;
      operator: FilterOperator;
      value: string;
    }>({
      name: "",
      contextKey: "",
      operator: FilterOperator.EQUALS,
      value: "",
    });
  
  const handleAddFilter = () => {
    if (!formData.name.trim() || !formData.contextKey) return;
    
    addScenarioFilter({
      name: formData.name,
      contextKey: formData.contextKey,
      operator: formData.operator,
      value: formData.value,
    }, scenarioId); // Przekazanie scenarioId do funkcji addScenarioFilter
    
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
        <div className="px-4 py-2 border-b border-border bg-muted/10">
          <div className="flex items-center">
            <div
              className={cn(
                "w-2 h-2 rounded-full mr-2",
                filtersMatch ? "bg-green-500" : "bg-yellow-500"
              )}
            />
            <span className="text-xs text-muted-foreground">
              {filtersMatch 
                ? `${filters.filter(f => f.enabled).length} aktywny filtr${filters.filter(f => f.enabled).length !== 1 ? 'y' : ''} - Wszystkie warunki spełnione` 
                : `${filters.filter(f => f.enabled).length} aktywny filtr${filters.filter(f => f.enabled).length !== 1 ? 'y' : ''} - Niektóre warunki nie spełnione`}
            </span>
          </div>
        </div>
      )}
      
      {/* Lista filtrów */}
      <div className="flex-1 overflow-auto p-2">
        {filters.length > 0 ? (
          <ul className="space-y-0.5">
            {filters.map((filter) => (
              <FilterItemComponent
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
      {isOpen && (
        <FilterDialog
          title="Dodaj filtr"
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleAddFilter}
          handleClose={() => setIsOpen(false)}
          contextItems={contextItems}
        />
      )}
      
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

interface FilterItemProps {
  filter: FilterType;
  onEdit: (filter: FilterType) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  menuOpen: boolean;
  toggleMenu: () => void;
}

const FilterItemComponent: React.FC<FilterItemProps> = ({
  filter,
  onEdit,
  onDelete,
  onToggle,
  menuOpen,
  toggleMenu,
}) => {
  // Pobieranie etykiety operatora
  const getOperatorLabel = (operator: FilterOperator): string => {
    switch (operator) {
      case FilterOperator.EQUALS: return "równa się";
      case FilterOperator.NOT_EQUALS: return "nie równa się";
      case FilterOperator.CONTAINS: return "zawiera";
      case FilterOperator.NOT_CONTAINS: return "nie zawiera";
      case FilterOperator.EMPTY: return "jest puste";
      case FilterOperator.NOT_EMPTY: return "nie jest puste";
      case FilterOperator.GREATER_THAN: return "większe niż";
      case FilterOperator.LESS_THAN: return "mniejsze niż";
      case FilterOperator.JSON_PATH: return "ścieżka JSON";
      default: return operator;
    }
  };
  
  // Sprawdzenie, czy operator wymaga wartości
  const operatorNeedsValue = (operator: FilterOperator): boolean => {
    return ![FilterOperator.EMPTY, FilterOperator.NOT_EMPTY].includes(operator);
  };
  
  return (
    <li className={cn(
      "group flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted/50",
      filter.enabled ? "" : "opacity-60"
    )}>
      <div className="flex items-center flex-1 min-w-0">
        <button
          onClick={() => onToggle(filter.id)}
          className="mr-2 flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          {filter.enabled ? (
            <ToggleRight className="h-4 w-4 text-primary" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
        </button>
        
        <div className="mr-2">
          <Filter className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <span className="truncate text-sm font-medium">{filter.name}</span>
          <p className="text-xs text-muted-foreground truncate">
            {filter.contextKey} {getOperatorLabel(filter.operator)}
            {operatorNeedsValue(filter.operator) ? ` "${filter.value}"` : ''}
          </p>
        </div>
      </div>
      
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground",
            menuOpen
              ? "bg-muted text-foreground"
              : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-md z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(filter);
              }}
              className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-muted"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edytuj
            </button>
            <button
              onClick={() => onDelete(filter.id)}
              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted flex items-center border-t border-border"
            >
              <X className="h-4 w-4 mr-2" />
              Usuń
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

interface FilterDialogProps {
  title: string;
  formData: {
    name: string;
    contextKey: string;
    operator: FilterOperator;
    value: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmit: () => void;
  handleClose: () => void;
  contextItems: {
    id: string;
    title: string;
    content: string;
  }[];
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  title,
  formData,
  handleChange,
  handleSubmit,
  handleClose,
  contextItems,
}) => {
  // Pomocnik dla zmiany wartości select
  const handleSelectChange = (name: string, value: string) => {
    const event = {
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleChange(event);
  };
  
  // Sprawdzenie, czy operator wymaga wartości
  const operatorNeedsValue = (operator: FilterOperator): boolean => {
    return ![FilterOperator.EMPTY, FilterOperator.NOT_EMPTY].includes(operator);
  };
  
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nazwa filtra
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Wprowadź nazwę filtra"
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          
          <div>
            <label htmlFor="contextKey" className="block text-sm font-medium mb-1">
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
          
          <div>
            <label htmlFor="operator" className="block text-sm font-medium mb-1">
              Operator
            </label>
            <select
              id="operator"
              name="operator"
              value={formData.operator}
              onChange={(e) => {
                handleChange(e);
                // Wyczyść wartość, jeśli operator jej nie wymaga
                if (!operatorNeedsValue(e.target.value as FilterOperator)) {
                  handleSelectChange("value", "");
                }
              }}
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
            <div>
              <label htmlFor="value" className="block text-sm font-medium mb-1">
                Wartość
              </label>
              <input
                type="text"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="Wprowadź wartość"
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
            >
              Anuluj
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              disabled={!formData.name.trim() || !formData.contextKey}
            >
              Dodaj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rozszerzenie interfejsu EditFilterDialogProps, aby zawierał scenarioId
interface EditFilterDialogProps {
  filter: FilterType;
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
  const [formData, setFormData] = useState({
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Pomocnik dla zmiany wartości select
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.contextKey) return;
    
    updateScenarioFilter(filter.id, {
      name: formData.name,
      contextKey: formData.contextKey,
      operator: formData.operator as FilterOperator,
      value: formData.value,
    }, scenarioId);
    
    handleClose();
  };
  
  // Sprawdzenie, czy operator wymaga wartości
  const operatorNeedsValue = (operator: FilterOperator): boolean => {
    return ![FilterOperator.EMPTY, FilterOperator.NOT_EMPTY].includes(operator);
  };
  
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Edytuj filtr</h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
              Nazwa filtra
            </label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Wprowadź nazwę filtra"
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          
          <div>
            <label htmlFor="edit-contextKey" className="block text-sm font-medium mb-1">
              Element kontekstu
            </label>
            <select
              id="edit-contextKey"
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
          
          <div>
            <label htmlFor="edit-operator" className="block text-sm font-medium mb-1">
              Operator
            </label>
            <select
              id="edit-operator"
              name="operator"
              value={formData.operator}
              onChange={(e) => {
                handleChange(e);
                // Wyczyść wartość, jeśli operator jej nie wymaga
                if (!operatorNeedsValue(e.target.value as FilterOperator)) {
                  handleSelectChange("value", "");
                }
              }}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Object.entries(FilterOperator).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.replace(/_/g, ' ').toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          
          {operatorNeedsValue(formData.operator as FilterOperator) && (
            <div>
              <label htmlFor="edit-value" className="block text-sm font-medium mb-1">
                Wartość
              </label>
              <input
                type="text"
                id="edit-value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="Wprowadź wartość"
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
            >
              Anuluj
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              disabled={!formData.name.trim() || !formData.contextKey}
            >
              Aktualizuj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersList;