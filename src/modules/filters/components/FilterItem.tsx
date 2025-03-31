// src/modules/filters/components/FilterItem.tsx
import React from "react";
import { Edit, MoreHorizontal, X, Filter, ToggleLeft, ToggleRight } from "lucide-react";
import { FilterItemProps, FilterOperator } from "../types";
import { cn } from "@/utils/utils";

const FilterItem: React.FC<FilterItemProps> = ({
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

export default FilterItem;