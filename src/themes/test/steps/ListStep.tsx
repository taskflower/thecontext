// src/themes/test/steps/ListStep.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { configDB } from "../../../db";
import { useWorkspaceSchema } from "@/core/engine";

type ListStepAttrs = {
  schemaPath: string;
  collection: string;
  title?: string;
  description?: string;
  emptyState?: {
    icon?: string;
    title?: string;
    description?: string;
    actionButton?: {
      title: string;
      navPath: string;
    };
  };
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
    navPath?: string;
    confirm?: string;
    variant?: "default" | "danger";
  }>;
  widgets?: Array<{
    tplFile: string;
    title: string;
    attrs: {
      navPath: string;
      variant?: "primary" | "secondary";
    };
  }>;
  pagination?: {
    pageSize?: number;
    showTotal?: boolean;
  };
  search?: {
    enabled?: boolean;
    placeholder?: string;
    fields?: string[];
  };
  sorting?: {
    enabled?: boolean;
    defaultField?: string;
    defaultDirection?: "asc" | "desc";
  };
};

interface ListStepProps {
  attrs: ListStepAttrs;
}

export default function ListStep({ attrs }: ListStepProps) {
  const navigate = useNavigate();
  const params = useParams<{ config: string; workspace: string }>();
  const { schema, loading, error } = useWorkspaceSchema(attrs.schemaPath);

  const [records, setRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(attrs.sorting?.defaultField || "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    attrs.sorting?.defaultDirection || "asc"
  );
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = attrs.pagination?.pageSize || 10;

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterAndSortRecords();
  }, [records, searchTerm, sortField, sortDirection]);

  const loadRecords = async () => {
    try {
      setLoadingRecords(true);
      const data = await configDB.records
        .where("id")
        .startsWith(`${attrs.collection}:`)
        .toArray();

      const recordList = data.map((record) => ({
        id: record.id?.replace(`${attrs.collection}:`, "") ?? "",
        ...record.data,
      }));

      setRecords(recordList);
    } catch (error) {
      console.error("Failed to load records:", error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const filterAndSortRecords = () => {
    let filtered = [...records];

    // Filtrowanie
    if (searchTerm && attrs.search?.enabled) {
      const searchFields =
        attrs.search.fields || Object.keys(schema?.properties || {});
      filtered = filtered.filter((record) =>
        searchFields.some((field) =>
          String(record[field] || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sortowanie
    if (sortField && attrs.sorting?.enabled) {
      filtered.sort((a, b) => {
        const aVal = a[sortField] || "";
        const bVal = b[sortField] || "";
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (recordId: string) => {
    const action = attrs.actions?.find((a) => a.type === "delete");
    const confirmMessage =
      action?.confirm || "Czy na pewno chcesz usunąć ten rekord?";

    if (confirm(confirmMessage)) {
      try {
        await configDB.records.delete(`${attrs.collection}:${recordId}`);
        await loadRecords();
      } catch (error) {
        console.error("Failed to delete record:", error);
        alert("Błąd podczas usuwania rekordu");
      }
    }
  };

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

  const renderCell = (record: any, column: any) => {
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

  const getDefaultColumns = () => {
    if (!schema?.properties) return [];
    return Object.entries(schema.properties).map(([key, field]: any) => ({
      key,
      label: field.label || key,
      type: field.enum ? "badge" : field.format === "date" ? "date" : "text",
    }));
  };

  const columns = attrs.columns || getDefaultColumns();
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <span className="text-sm font-medium text-zinc-600">
            Ładowanie konfiguracji
          </span>
        </div>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">
          Błąd konfiguracji
        </div>
        <div className="text-xs text-zinc-500">
          {error || `Nie znaleziono schemy: ${attrs.schemaPath}`}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {attrs.title || "Lista rekordów"}
          </h1>
          {attrs.description && (
            <p className="text-zinc-600 mt-1 text-sm">{attrs.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          {attrs.widgets?.map((widget: any, i: number) => (
            <button
              key={i}
              onClick={() =>
                navigate(`/${params.config}/${widget.attrs.navPath}`)
              }
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                widget.attrs.variant === "primary"
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {widget.title}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      {attrs.search?.enabled && (
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder={attrs.search.placeholder || "Szukaj..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-zinc-300/80 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 max-w-sm"
          />
          {attrs.pagination?.showTotal && (
            <div className="text-sm text-zinc-600">
              Znaleziono: {filteredRecords.length} rekordów
            </div>
          )}
        </div>
      )}

      {loadingRecords ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
            <span className="text-sm font-medium text-zinc-600">
              Ładowanie danych
            </span>
          </div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50/50 rounded-lg border border-zinc-200/60">
          <div className="text-zinc-400 text-lg mb-3">
            {attrs.emptyState?.icon || "📝"}
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            {attrs.emptyState?.title || "Brak rekordów"}
          </h3>
          <p className="text-zinc-600 text-sm mb-6 max-w-sm mx-auto">
            {attrs.emptyState?.description ||
              "Nie masz jeszcze żadnych rekordów. Dodaj pierwszy rekord, aby rozpocząć."}
          </p>
          {attrs.emptyState?.actionButton && (
            <button
              onClick={() =>
                navigate(
                  `/${params.config}/${attrs.emptyState?.actionButton?.navPath}`
                )
              }
              className="bg-zinc-900 text-white px-5 py-2.5 text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
            >
              {attrs.emptyState.actionButton.title}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
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
                          attrs.sorting?.enabled && column.sortable !== false
                            ? "cursor-pointer hover:bg-zinc-100/80"
                            : ""
                        }`}
                        onClick={() => {
                          if (
                            attrs.sorting?.enabled &&
                            column.sortable !== false
                          ) {
                            if (sortField === column.key) {
                              setSortDirection(
                                sortDirection === "asc" ? "desc" : "asc"
                              );
                            } else {
                              setSortField(column.key);
                              setSortDirection("asc");
                            }
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {column.label}
                          {attrs.sorting?.enabled &&
                            column.sortable !== false &&
                            sortField === column.key && (
                              <span className="text-zinc-400">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                        </div>
                      </th>
                    ))}
                    {attrs.actions && attrs.actions.length > 0 && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-zinc-600 uppercase tracking-wider">
                        Akcje
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60">
                  {paginatedRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4">
                          {renderCell(record, column)}
                        </td>
                      ))}
                      {attrs.actions && attrs.actions.length > 0 && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            {attrs.actions.map((action, index) => {
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

          {/* Pagination */}
          {attrs.pagination && totalPages > 1 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-zinc-600">
                Strona {currentPage} z {totalPages} ({filteredRecords.length}{" "}
                rekordów)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-zinc-300/80 rounded hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Poprzednia
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-zinc-300/80 rounded hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Następna
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
