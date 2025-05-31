// src/themes/default/steps/ListTableStep.tsx - SIMPLIFIED VERSION
import { useState, useEffect, useMemo } from "react";
import { useWorkspaceSchema, useEngineStore } from "@/core";
import DataTable, { Column } from "../commons/ListDataTable";
import Pagination from "../commons/ListPaination";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";
// Import widgetów
import TitleWidget from "../widgets/TitleWidget";
import ButtonWidget from "../widgets/ButtonWidget";
import InfoWidget from "../widgets/InfoWidget";
import { useCollections } from "@/core/hooks/useCollections";

interface Widget {
  tplFile: string;
  title: string;
  attrs: any;
}

interface FilterConfig {
  role: string;
  field: string;
}

interface ListStepProps {
  attrs: {
    schemaPath: string;
    collection: string;
    title?: string;
    description?: string;
    filters?: FilterConfig[];
    emptyState?: any;
    columns?: any[];
    actions?: any[];
    headerWidgets?: Widget[];
    pagination?: { pageSize?: number; showTotal?: boolean };
    search?: { enabled?: boolean; placeholder?: string; fields?: string[] };
    sorting?: {
      enabled?: boolean;
      defaultField?: string;
      defaultDirection?: "asc" | "desc";
    };
  };
}

// Mapowanie dostępnych widgetów
const widgetMap = {
  TitleWidget,
  ButtonWidget,
  InfoWidget,
};

export default function ListStep({ attrs }: ListStepProps) {
  // ✅ HOOKI NA GÓRZE
  const { schema, loading, error } = useWorkspaceSchema(attrs?.schemaPath || "");
  const { items: records, loading: loadingRecords, deleteItem } = useCollections(attrs?.collection || "");
  const { get } = useEngineStore();
  
  // ✅ FIX: Stable user reference
  const currentUser = useMemo(() => get("currentUser"), [get("currentUser")?.id, get("currentUser")?.role]);

  // ✅ FIX: Simplified base filtering without complex memoization
  const baseRecords = useMemo(() => {
    if (!attrs.filters || !currentUser || !records.length) return records;
    
    const filter = attrs.filters.find(f => f.role === currentUser.role);
    if (!filter) return records;
    
    return records.filter(r => r[filter.field] === currentUser.id);
  }, [records, attrs.filters, currentUser?.id, currentUser?.role]);

  // STANY UI - SIMPLIFIED
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(attrs?.sorting?.defaultField || "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(attrs?.sorting?.defaultDirection || "asc");
  const [currentPage, setCurrentPage] = useState(1);
  
  const pageSize = attrs?.pagination?.pageSize || 10;

  // ✅ FIX: Much simpler filtering without complex dependencies
  const filteredRecords = useMemo(() => {
    if (!baseRecords.length) return [];

    let filtered = [...baseRecords];

    // Search filter
    if (searchTerm && attrs?.search?.enabled && schema?.properties) {
      const searchFields = attrs.search.fields || Object.keys(schema.properties);
      filtered = filtered.filter(record =>
        searchFields.some(field =>
          String(record[field] || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortField && attrs?.sorting?.enabled) {
      filtered.sort((a, b) => {
        const aValue = String(a[sortField] || "");
        const bValue = String(b[sortField] || "");
        const cmp = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    return filtered;
  }, [baseRecords, searchTerm, sortField, sortDirection, attrs?.search, attrs?.sorting, schema?.properties]);

  // PAGINACJA
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredRecords.slice(start, end);
  }, [filteredRecords, currentPage, pageSize]);
  
  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  // KOLUNY DO TABELI
  const columns = useMemo(() => {
    if (!schema?.properties) return [];
    return (
      attrs.columns ||
      Object.entries(schema.properties).map(([key, field]: any) => ({
        key,
        label: field.label || key,
        type: field.enum ? "badge" : field.format === "date" ? "date" : "text",
      }))
    );
  }, [attrs.columns, schema?.properties]);

  // RESET strony po zmianie search/sort
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection]);

  // DELETE handler
  const handleDelete = async (recordId: string) => {
    try {
      await deleteItem(recordId);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Błąd podczas usuwania rekordu");
    }
  };

  // RENDER WIDGETÓW HEADER
  const renderWidget = (widget: Widget, index: number) => {
    const WidgetComponent = widgetMap[widget.tplFile as keyof typeof widgetMap];
    if (!WidgetComponent) {
      console.warn(`Widget not found: ${widget.tplFile}`);
      return null;
    }
    return (
      <div key={index} className="widget-container">
        <WidgetComponent title={widget.title} attrs={widget.attrs} />
      </div>
    );
  };

  // ⚠️ Loading / Error
  if (loading) return <LoadingSpinner text="Loading configuration..." />;
  if (error || !schema) return <ErrorMessage error={error || `Schema not found: ${attrs?.schemaPath}`} />;

  return (
    <div className="space-y-6">
      {/* Header Widgets */}
      {attrs.headerWidgets && attrs.headerWidgets.length > 0 && (
        <div className="header-widgets-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {attrs.headerWidgets.map((w, i) => renderWidget(w, i))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      {attrs?.search?.enabled && (
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder={attrs.search.placeholder || "Szukaj..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-zinc-300 rounded-md max-w-sm"
          />
          {attrs?.pagination?.showTotal && (
            <div className="text-sm text-zinc-600">
              Znaleziono: {filteredRecords.length}
            </div>
          )}
        </div>
      )}

      <DataTable
        records={paginatedRecords}
        columns={columns as Column[]}
        actions={attrs?.actions}
        schema={schema}
        loading={loadingRecords}
        emptyState={attrs?.emptyState}
        sortField={sortField}
        sortDirection={sortDirection}
        sortingEnabled={attrs?.sorting?.enabled}
        onSort={(field, dir) => {
          setSortField(field);
          setSortDirection(dir);
        }}
        onDelete={handleDelete}
        collection={attrs?.collection || ""}
      />

      {attrs?.pagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={filteredRecords.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          showTotal={attrs.pagination.showTotal}
        />
      )}
    </div>
  );
}