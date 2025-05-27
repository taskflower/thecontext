// src/themes/default/steps/ListStep.tsx - Fixed hooks order
import { useState, useEffect, useMemo } from "react";
import { useWorkspaceSchema, useCollections } from "@/core";
import ListHeader from "../commons/ListHeader";
import DataTable, { Column } from "../commons/ListDataTable";
import Pagination from "../commons/ListPaination";

interface ListStepProps {
  attrs: {
    schemaPath: string;
    collection: string;
    title?: string;
    description?: string;
    emptyState?: {
      icon?: string;
      title?: string;
      description?: string;
      actionButton?: { title: string; navPath: string };
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
      attrs: { navPath: string; variant?: "primary" | "secondary" };
    }>;
    pagination?: { pageSize?: number; showTotal?: boolean };
    search?: { enabled?: boolean; placeholder?: string; fields?: string[] };
    sorting?: {
      enabled?: boolean;
      defaultField?: string;
      defaultDirection?: "asc" | "desc";
    };
  };
}

export default function ListStep({ attrs }: ListStepProps) {
  // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { schema, loading, error } = useWorkspaceSchema(attrs?.schemaPath || "");
  const {
    items: records,
    loading: loadingRecords,
    deleteItem,
  } = useCollections(attrs?.collection || "");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(attrs?.sorting?.defaultField || "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    attrs?.sorting?.defaultDirection || "asc"
  );
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = attrs?.pagination?.pageSize || 10;

  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // Search
    if (searchTerm && attrs?.search?.enabled) {
      const searchFields =
        attrs.search.fields || Object.keys(schema?.properties || {});
      filtered = filtered.filter((record) =>
        searchFields.some((field) =>
          String((record as any)[field] || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortField && attrs?.sorting?.enabled) {
      filtered.sort((a, b) => {
        const comparison = String((a as any)[sortField] || "").localeCompare(
          String((b as any)[sortField] || "")
        );
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [
    records,
    searchTerm,
    sortField,
    sortDirection,
    attrs?.search,
    attrs?.sorting,
    schema,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection]);

  // ✅ Now conditional logic can happen after all hooks

  const handleDelete = async (recordId: string) => {
    try {
      await deleteItem(recordId);
    } catch (error) {
      console.error("Failed to delete record:", error);
      alert("Błąd podczas usuwania rekordu");
    }
  };

  const columns =
    attrs?.columns ||
    Object.entries(schema?.properties || {}).map(([key, field]: any) => ({
      key,
      label: field.label || key,
      type: field.enum ? "badge" : field.format === "date" ? "date" : "text",
    }));

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        <span className="ml-3 text-sm font-medium text-zinc-600">
          Ładowanie konfiguracji
        </span>
      </div>
    );

  if (error || !schema)
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">
          Błąd konfiguracji
        </div>
        <div className="text-xs text-zinc-500">
          {error || `Nie znaleziono schemy: ${attrs?.schemaPath}`}
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <ListHeader
        title={attrs?.title}
        description={attrs?.description}
        widgets={attrs?.widgets}
        search={attrs?.search}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={filteredRecords.length}
        showTotal={attrs?.pagination?.showTotal}
      />

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
        onSort={(field, direction) => {
          setSortField(field);
          setSortDirection(direction);
        }}
        onDelete={handleDelete}
        collection={attrs?.collection || ""}
      />

      {attrs?.pagination && (
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