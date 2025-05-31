// src/themes/default/commons/TableFilters.tsx

interface FilterOption {
    key: string;
    label: string;
    field?: string;
    value?: string;
    showAll?: boolean;
  }
  
  interface ListTableFiltersProps {
    filters: FilterOption[];
    activeFilter: string;
    onFilterChange: (key: string) => void;
    label?: string;
    className?: string;
  }
  
  export default function ListTableFilters({
    filters,
    activeFilter,
    onFilterChange,
    label = "Show:",
    className = "",
  }: ListTableFiltersProps) {
    if (!filters || filters.length === 0) {
      return null;
    }
  
    return (
      <div className={`mb-4 p-3 bg-gray-50 rounded-lg border ${className}`}>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 mr-3 py-2">
            {label}
          </span>
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeFilter === filter.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    );
  }