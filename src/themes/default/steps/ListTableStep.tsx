// src/themes/default/steps/ListTableStep.tsx - ENHANCED with Filters
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceSchema, useEngineStore, useAppNavigation } from "@/core";
import { useCollections } from "@/core/hooks/useCollections";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";

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
    pagination?: { pageSize?: number; showTotal?: boolean };
    search?: { enabled?: boolean; placeholder?: string; fields?: string[] };
    sorting?: { enabled?: boolean; defaultField?: string; defaultDirection?: "asc" | "desc" };
    // NEW: Filter configuration
    roleFilters?: {
      enabled?: boolean;
      options?: Array<{
        key: string;
        label: string;
        field?: string; // pole do filtrowania, domyślnie z permissions
        value?: string; // wartość filtra, może zawierać {{currentUser.id}}
        showAll?: boolean; // czy ten filter pokazuje wszystkie rekordy
      }>;
    };
  };
}

// Komponent filtrów
function TableFilters({ 
  filters, 
  activeFilter, 
  onFilterChange, 
  currentUser 
}: {
  filters: any[];
  activeFilter: string;
  onFilterChange: (key: string) => void;
  currentUser: any;
}) {
  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 mr-3 py-2">
          Show:
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

export default function ListTableStep({ attrs }: ListTableStepProps) {
  const { go } = useAppNavigation();
  const { get } = useEngineStore();
  const currentUser = get("currentUser");
  
  // Stan filtrowania
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  const { schema, loading: schemaLoading, error: schemaError } = useWorkspaceSchema(
    attrs?.schemaPath || ""
  );

  // Przygotuj opcje filtrów
  const filterOptions = useMemo(() => {
    if (!attrs?.roleFilters?.enabled || !currentUser) {
      return [];
    }

    // Domyślne opcje filtrów jeśli nie podano custom
    if (!attrs.roleFilters.options) {
      const role = currentUser.role;
      const defaultFilters = [
        { key: "all", label: "All Tickets", showAll: true },
      ];

      // Dodaj filter specyficzny dla roli
      if (role === "reporter") {
        defaultFilters.push({
          key: "mine",
          label: "My Tickets", 
          field: "reporterId",
          value: currentUser.id
        });
      } else if (role === "support") {
        defaultFilters.push({
          key: "assigned",
          label: "Assigned to Me",
          field: "assigneeId", 
          value: currentUser.id
        });
      }

      return defaultFilters;
    }

    return attrs.roleFilters.options;
  }, [attrs?.roleFilters, currentUser]);

  // Przygotuj opcje query dla useCollections na podstawie aktywnego filtra
  const queryOptions = useMemo(() => {
    const activeFilterConfig = filterOptions.find(f => f.key === activeFilter);
    
    if (!activeFilterConfig || activeFilterConfig.showAll) {
      return {}; // Brak filtrowania - pokaż wszystkie
    }

    // Zastąp placeholdery w value
    let filterValue = activeFilterConfig.value || "";
    if (filterValue.includes("{{currentUser.id}}")) {
      filterValue = currentUser?.id || "";
    }

    return {
      where: [
        {
          field: activeFilterConfig.field || "id",
          operator: "==" as const,
          value: filterValue
        }
      ]
    };
  }, [activeFilter, filterOptions, currentUser]);

  const { items, loading, deleteItem } = useCollections(
    attrs?.collection || "",
    queryOptions
  );

  // Ustaw domyślny filtr przy pierwszym załadowaniu
  useEffect(() => {
    if (filterOptions.length > 0 && activeFilter === "all") {
      // Sprawdź czy jest dostępny filtr "mine" lub "assigned" dla danej roli
      const roleSpecificFilter = filterOptions.find(f => 
        f.key === "mine" || f.key === "assigned"
      );
      if (roleSpecificFilter) {
        setActiveFilter(roleSpecificFilter.key);
      }
    }
  }, [filterOptions]);

  const handleEdit = (item: any) => {
    const editAction = attrs?.actions?.find(a => a.type === "edit");
    if (editAction?.navURL) {
      go(`${editAction.navURL}/${item.id}`);
    }
  };

  const handleDelete = async (item: any) => {
    const deleteAction = attrs?.actions?.find(a => a.type === "delete");
    if (deleteAction?.confirm) {
      if (!confirm(deleteAction.confirm)) return;
    }
    await deleteItem(item.id);
  };

  const handleCustomAction = (action: any, item: any) => {
    if (action.navURL) {
      go(`${action.navURL}/${item.id}`);
    }
  };

  const getBadgeColor = (value: string, field: string) => {
    const colors: Record<string, Record<string, string>> = {
      priority: {
        low: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800", 
        high: "bg-red-100 text-red-800"
      },
      status: {
        new: "bg-blue-100 text-blue-800",
        in_progress: "bg-purple-100 text-purple-800",
        resolved: "bg-green-100 text-green-800"
      },
      role: {
        admin: "bg-red-100 text-red-800",
        support: "bg-blue-100 text-blue-800", 
        reporter: "bg-green-100 text-green-800"
      },
      isActive: {
        true: "bg-green-100 text-green-800",
        false: "bg-gray-100 text-gray-800"
      }
    };
    
    return colors[field]?.[value] || "bg-gray-100 text-gray-800";
  };

  const renderCellValue = (item: any, column: any) => {
    const value = item[column.key];
    
    if (column.type === "badge") {
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(value, column.key)}`}>
          {schema?.properties?.[column.key]?.enumLabels?.[value] || value}
        </span>
      );
    }
    
    if (column.type === "date" && value) {
      return new Date(value).toLocaleDateString();
    }
    
    return value || "-";
  };

  if (schemaLoading || loading) {
    return <LoadingSpinner text="Loading data..." />;
  }

  if (schemaError || !schema) {
    return <ErrorMessage error={schemaError || `Schema not found: ${attrs?.schemaPath}`} />;
  }

  const columns = attrs?.columns || Object.keys(schema.properties).map(key => ({
    key,
    label: schema.properties[key].label || key,
    type: "text" as const
  }));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      {(attrs?.title || attrs?.description) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-900">
            {attrs.title || "Data List"}
          </h2>
          {attrs?.description && (
            <p className="text-zinc-600 mt-1 text-sm">{attrs.description}</p>
          )}
        </div>
      )}

      {/* Header Widgets */}
      {attrs?.headerWidgets && (
        <div className="mb-6 flex flex-wrap gap-4">
          {attrs.headerWidgets.map((widget, index) => (
            <div key={index} className="flex-shrink-0">
              {/* Tu można zaimplementować renderowanie widgetów */}
              {widget.tplFile === "ButtonWidget" && (
                <button 
                  onClick={() => go(widget.attrs.navURL)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    widget.attrs.variant === "primary" 
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : widget.attrs.variant === "secondary"
                      ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {widget.title}
                </button>
              )}
              {widget.tplFile === "InfoWidget" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">{widget.attrs.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NEW: Role-based Filters */}
      {filterOptions.length > 0 && (
        <TableFilters
          filters={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          currentUser={currentUser}
        />
      )}

      {/* Table */}
      <div className="bg-white border border-zinc-200/60 rounded-lg overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">{attrs?.emptyState?.icon || "📄"}</div>
            <h3 className="text-lg font-medium text-zinc-900 mb-2">
              {attrs?.emptyState?.title || "No Data"}
            </h3>
            <p className="text-zinc-600 mb-4">
              {attrs?.emptyState?.description || "No records found."}
            </p>
            {attrs?.emptyState?.actionButton && (
              <button
                onClick={() => go(attrs.emptyState!.actionButton!.navURL)}
                className="bg-zinc-900 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-zinc-800"
              >
                {attrs.emptyState.actionButton.title}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50/50 border-b border-zinc-200/60">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                      style={{ width: column.width }}
                    >
                      {column.label || column.key}
                    </th>
                  ))}
                  {attrs?.actions && attrs.actions.length > 0 && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60">
                {items.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-zinc-50/30">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                        {renderCellValue(item, column)}
                      </td>
                    ))}
                    {attrs?.actions && attrs.actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-2">
                          {attrs.actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => {
                                if (action.type === "edit") handleEdit(item);
                                else if (action.type === "delete") handleDelete(item);
                                else handleCustomAction(action, item);
                              }}
                              className={`px-3 py-1 text-xs font-medium rounded ${
                                action.variant === "danger"
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
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

      {/* Pagination info */}
      {attrs?.pagination?.showTotal && items.length > 0 && (
        <div className="mt-4 text-sm text-zinc-600">
          Showing {items.length} records
        </div>
      )}
    </div>
  );
}