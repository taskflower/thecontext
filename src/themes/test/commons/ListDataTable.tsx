// src/themes/test/components/DataTable.tsx
import { useNavigate, useParams } from "react-router-dom";

export interface Column {
  key: string;
  label?: string;
  type?: "text" | "badge" | "date" | "enum";
  width?: string;
  sortable?: boolean;
}

interface Action {
  type: "edit" | "delete" | "custom";
  label?: string;
  navPath?: string;
  confirm?: string;
  variant?: "default" | "danger";
}

interface EmptyState {
  icon?: string;
  title?: string;
  description?: string;
  actionButton?: {
    title: string;
    navPath: string;
  };
}

interface DataTableProps {
  records: any[];
  columns: Column[];
  actions?: Action[];
  schema?: any;
  loading?: boolean;
  emptyState?: EmptyState;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  sortingEnabled?: boolean;
  onSort?: (field: string, direction: "asc" | "desc") => void;
  onDelete?: (recordId: string) => void;
  collection: string;
}

export default function DataTable({
  records,
  columns,
  actions,
  schema,
  loading,
  emptyState,
  sortField,
  sortDirection,
  sortingEnabled,
  onSort,
  onDelete,
  collection,
}: DataTableProps) {
  const navigate = useNavigate();
  const params = useParams<{ config: string; workspace: string }>();

  const getFieldDisplayValue = (key: string, value: any) => {
    const field = schema?.properties?.[key];
    if (field?.enumLabels && value) {
      return field.enumLabels[value] || value;
    }
    return value || "";
  };

  const getBadgeColor = (field: any, value: any) => {
    if (field?.enum) {
      const colorMap: Record<string, string> = {
        urgent: "bg-red-100 text-red-700",
        high: "bg-orange-100 text-orange-700",
        medium: "bg-yellow-100 text-yellow-700",
        low: "bg-green-100 text-green-700",
        new: "bg-yellow-100 text-yellow-700",
        in_progress: "bg-blue-100 text-blue-700",
        resolved: "bg-green-100 text-green-700",
        closed: "bg-zinc-100 text-zinc-700",
      };
      return colorMap[value] || "bg-zinc-100 text-zinc-700";
    }
    return "bg-zinc-100 text-zinc-700";
  };

  const renderCell = (record: any, column: Column) => {
    const value = record[column.key];
    const field = schema?.properties?.[column.key];
    const displayValue = getFieldDisplayValue(column.key, value);

    switch (column.type) {
      case "badge":
        return (
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(
              field,
              value
            )}`}
          >
            {displayValue}
          </span>
        );
      case "date":
        return value ? new Date(value).toLocaleDateString() : "";
      default:
        return (
          <div>
            <div className="font-medium text-zinc-900 text-sm">
              {displayValue}
            </div>
            {column.key === Object.keys(schema?.properties || {})[0] &&
              record.description && (
                <div className="text-xs text-zinc-500 truncate max-w-xs mt-1">
                  {record.description}
                </div>
              )}
          </div>
        );
    }
  };

  const handleDelete = async (recordId: string) => {
    const action = actions?.find((a) => a.type === "delete");
    const confirmMessage =
      action?.confirm || "Czy na pewno chcesz usunąć ten rekord?";

    if (confirm(confirmMessage)) {
      onDelete?.(recordId);
    }
  };

  const handleSort = (columnKey: string) => {
    if (!sortingEnabled || !onSort) return;

    if (sortField === columnKey) {
      onSort(columnKey, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(columnKey, "asc");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <span className="text-sm font-medium text-zinc-600">
            Ładowanie danych
          </span>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-50/50 rounded-lg border border-zinc-200/60">
        <div className="text-zinc-400 text-lg mb-3">
          {emptyState?.icon || "📝"}
        </div>
        <h3 className="text-lg font-medium text-zinc-900 mb-2">
          {emptyState?.title || "Brak rekordów"}
        </h3>
        <p className="text-zinc-600 text-sm mb-6 max-w-sm mx-auto">
          {emptyState?.description ||
            "Nie masz jeszcze żadnych rekordów. Dodaj pierwszy rekord, aby rozpocząć."}
        </p>
        {emptyState?.actionButton && (
          <button
            onClick={() =>
              navigate(
                `/${params.config}/${emptyState?.actionButton?.navPath}`
              )
            }
            className="bg-zinc-900 text-white px-5 py-2.5 text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
          >
            {emptyState.actionButton.title}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200/60 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50/80 border-b border-zinc-200/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider ${
                    column.width || ""
                  } ${
                    sortingEnabled && column.sortable !== false
                      ? "cursor-pointer hover:bg-zinc-100/80"
                      : ""
                  }`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {sortingEnabled &&
                      column.sortable !== false &&
                      sortField === column.key && (
                        <span className="text-zinc-400">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  Akcje
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-zinc-50/50 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4">
                    {renderCell(record, column)}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      {actions.map((action, index) => {
                        if (action.type === "edit") {
                          return (
                            <button
                              key={index}
                              onClick={() =>
                                navigate(
                                  `/${params.config}/${action.navPath}/${record.id}`
                                )
                              }
                              className="text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors"
                            >
                              {action.label || "Edytuj"}
                            </button>
                          );
                        }
                        if (action.type === "delete") {
                          return (
                            <button
                              key={index}
                              onClick={() => handleDelete(record.id)}
                              className={`text-sm font-medium transition-colors ${
                                action.variant === "danger"
                                  ? "text-red-600 hover:text-red-700"
                                  : "text-zinc-600 hover:text-zinc-900"
                              }`}
                            >
                              {action.label || "Usuń"}
                            </button>
                          );
                        }
                        if (action.type === "custom") {
                          return (
                            <button
                              key={index}
                              onClick={() =>
                                navigate(
                                  `/${params.config}/${action.navPath}/${record.id}`
                                )
                              }
                              className="text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors"
                            >
                              {action.label || "Akcja"}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}