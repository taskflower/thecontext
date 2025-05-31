// src/themes/default/steps/ListTableStep.tsx - Modern Dropbox Style
import { useState, useEffect, useMemo } from "react";
import { useWorkspaceSchema, useEngineStore, useAppNavigation } from "@/core";
import { useCollections } from "@/core/hooks/useCollections";
import ButtonWidget from "../widgets/ButtonWidget";

// Define the filter option type
interface FilterOption {
  key: string;
  label: string;
  field?: string;
  value?: string;
  showAll?: boolean;
}

interface ListTableStepProps {
  attrs: {
    title?: string;
    description?: string;
    schemaPath: string;
    collection: string;
    columns?: Array<{
      key: string;
      label?: string;
      type?: "text" | "badge" | "date" | "enum";
      width?: string;
      sortable?: boolean;
    }>;
    actions?: Array<{
      type: "edit" | "delete" | "custom";
      label?: string;
      navURL?: string;
      confirm?: string;
      variant?: "default" | "danger";
    }>;
    emptyState?: {
      icon?: string;
      title?: string;
      description?: string;
      actionButton?: { title: string; navURL: string };
    };
    headerWidgets?: Array<{
      tplFile: string;
      title: string;
      attrs: Record<string, any>;
    }>;
    roleFilters?: {
      enabled?: boolean;
      options?: FilterOption[];
    };
  };
}

export default function ListTableStep({ attrs }: ListTableStepProps) {
  const { go } = useAppNavigation();
  const { get } = useEngineStore();
  const currentUser = get("currentUser");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    schema,
    loading: schemaLoading,
    error: schemaError,
  } = useWorkspaceSchema(attrs?.schemaPath || "");

  // Przygotuj opcje filtrów
  const filterOptions = useMemo((): FilterOption[] => {
    if (!attrs?.roleFilters?.enabled || !currentUser) {
      return [];
    }

    if (!attrs.roleFilters.options) {
      const role = currentUser.role;
      const defaultFilters: FilterOption[] = [
        { key: "all", label: "All Items", showAll: true },
      ];

      if (role === "reporter") {
        defaultFilters.push({
          key: "mine",
          label: "My Items",
          field: "reporterId",
          value: currentUser.id,
        });
      } else if (role === "support") {
        defaultFilters.push({
          key: "assigned",
          label: "Assigned to Me",
          field: "assigneeId",
          value: currentUser.id,
        });
      }

      return defaultFilters;
    }

    return attrs.roleFilters.options;
  }, [attrs?.roleFilters, currentUser]);

  // Query options for useCollections
  const queryOptions = useMemo(() => {
    const activeFilterConfig = filterOptions.find(f => f.key === activeFilter);

    if (!activeFilterConfig || activeFilterConfig.showAll) {
      return {};
    }

    let filterValue = activeFilterConfig.value || "";
    if (filterValue.includes("{{currentUser.id}}")) {
      filterValue = currentUser?.id || "";
    }

    return {
      where: [
        {
          field: activeFilterConfig.field || "id",
          operator: "==" as const,
          value: filterValue,
        },
      ],
    };
  }, [activeFilter, filterOptions, currentUser]);

  const { items, loading, deleteItem } = useCollections(
    attrs?.collection || "",
    queryOptions
  );

  // Filter items by search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    return items.filter((item: any) => {
      return Object.values(item).some((value: any) => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [items, searchTerm]);

  const handleEdit = (item: any) => {
    const editAction = attrs?.actions?.find((a) => a.type === "edit");
    if (editAction?.navURL) {
      go(`${editAction.navURL}/${item.id}`);
    }
  };

  const handleDelete = async (item: any) => {
    const deleteAction = attrs?.actions?.find((a) => a.type === "delete");
    if (deleteAction?.confirm) {
      if (!confirm(deleteAction.confirm)) return;
    }
    await deleteItem(item.id);
  };

  const getBadgeColor = (value: string, field: string) => {
    const colors: Record<string, Record<string, string>> = {
      priority: {
        low: "bg-green-100 text-green-800 border-green-200",
        medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        high: "bg-red-100 text-red-800 border-red-200",
        urgent: "bg-purple-100 text-purple-800 border-purple-200",
      },
      status: {
        new: "bg-blue-100 text-blue-800 border-blue-200",
        in_progress: "bg-orange-100 text-orange-800 border-orange-200",
        resolved: "bg-green-100 text-green-800 border-green-200",
        closed: "bg-gray-100 text-gray-800 border-gray-200",
      },
    };

    return colors[field]?.[value] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const renderCellValue = (item: any, column: any) => {
    const value = item[column.key];

    if (column.type === "badge") {
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor(value, column.key)}`}>
          {schema?.properties?.[column.key]?.enumLabels?.[value] || value}
        </span>
      );
    }

    if (column.type === "date" && value) {
      return (
        <span className="text-sm text-slate-600">
          {new Date(value).toLocaleDateString()}
        </span>
      );
    }

    return (
      <span className="text-sm text-slate-900 font-medium">
        {value || "-"}
      </span>
    );
  };

  if (schemaLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading data...
          </div>
        </div>
      </div>
    );
  }

  if (schemaError || !schema) {
    return (
      <div className="text-center py-24">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Configuration Error</h3>
        <p className="text-slate-600 text-sm">{schemaError || `Schema not found: ${attrs?.schemaPath}`}</p>
      </div>
    );
  }

  const columns = attrs?.columns || Object.keys(schema.properties).map((key) => ({
    key,
    label: schema.properties[key].label || key,
    type: "text" as const,
    width: undefined,
    sortable: undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {attrs?.title || "Data Overview"}
        </h1>
        {attrs?.description && (
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {attrs.description}
          </p>
        )}
      </div>

      {/* Header Widgets */}
      {attrs?.headerWidgets && attrs.headerWidgets.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center">
          {attrs.headerWidgets.map((widget, index) => (
            <div key={index} className="flex-shrink-0">
              {widget.tplFile === "ButtonWidget" && (
                <ButtonWidget title={widget.title} attrs={widget.attrs} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
            />
          </div>

          {/* Filters */}
          {filterOptions.length > 0 && (
            <div className="flex items-center space-x-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeFilter === filter.key
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">
              {searchTerm ? "No matching records" : (attrs?.emptyState?.title || "No records found")}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm 
                ? `No records match "${searchTerm}". Try adjusting your search.`
                : (attrs?.emptyState?.description || "Get started by creating your first record.")
              }
            </p>
            {attrs?.emptyState?.actionButton && !searchTerm && (
              <button
                onClick={() => go(attrs.emptyState!.actionButton!.navURL)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-200"
              >
                {attrs.emptyState.actionButton.title}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-200/60">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      style={column.width ? { width: column.width } : undefined}
                    >
                      {column.label || column.key}
                    </th>
                  ))}
                  {attrs?.actions && attrs.actions.length > 0 && (
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {filteredItems.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {renderCellValue(item, column)}
                      </td>
                    ))}
                    {attrs?.actions && attrs.actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          {attrs.actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => {
                                if (action.type === "edit") handleEdit(item);
                                else if (action.type === "delete") handleDelete(item);
                              }}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                                action.variant === "danger"
                                  ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                              }`}
                            >
                              {action.label || action.type}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer info */}
      {filteredItems.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Showing {filteredItems.length} of {items.length} records
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}
    </div>
  );
}