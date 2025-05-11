// src/themes/energygrant/widgets/FiltersWidget.tsx
import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

type FiltersWidgetProps = {
  title?: string;
  onFilterChange?: (filters: any) => void;
};

export default function FiltersWidget({ 
  title = "Filtry wyszukiwania", 
  onFilterChange 
}: FiltersWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    postalCode: '',
    city: '',
    hasAudit: false,
    isVerified: false,
    dateFrom: '',
    dateTo: ''
  });

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const emptyFilters = {
      postalCode: '',
      city: '',
      hasAudit: false,
      isVerified: false,
      dateFrom: '',
      dateTo: ''
    };
    setFilters(emptyFilters);
    if (onFilterChange) {
      onFilterChange(emptyFilters);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div 
        className="border-b border-gray-200 px-6 py-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-sm text-gray-500">
          {isExpanded ? 'Zwiń filtry' : 'Rozwiń filtry'}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kod pocztowy
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.postalCode}
                  onChange={(e) => handleFilterChange('postalCode', e.target.value)}
                  placeholder="np. 00-001"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miejscowość
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="np. Warszawa"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data dodania od
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data dodania do
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="hasAudit"
                  type="checkbox"
                  checked={filters.hasAudit}
                  onChange={(e) => handleFilterChange('hasAudit', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="hasAudit" className="ml-2 block text-sm text-gray-700">
                  Z audytem
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isVerified"
                  type="checkbox"
                  checked={filters.isVerified}
                  onChange={(e) => handleFilterChange('isVerified', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-700">
                  Zweryfikowane
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="mr-2 h-4 w-4" /> 
              Wyczyść filtry
            </button>
            <button
              type="button"
              onClick={() => onFilterChange && onFilterChange(filters)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Search className="mr-2 h-4 w-4" /> 
              Zastosuj filtry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}