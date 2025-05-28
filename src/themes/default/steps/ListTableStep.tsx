// src/themes/default/steps/ListTableStep.tsx
import { useState, useEffect, useMemo } from "react";
import { useWorkspaceSchema, useCollections } from "@/core";
import ListHeader from "../commons/ListHeader";
import DataTable, { Column } from "../commons/ListDataTable";
import Pagination from "../commons/ListPaination";
import { LoadingSpinner, ErrorMessage } from "../commons/StepWrapper";

interface ListStepProps {
  attrs: {
    schemaPath: string;
    collection: string;
    title?: string;
    description?: string;
    emptyState?: any;
    columns?: any[];
    actions?: any[];
    widgets?: any[];
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
  // ✅ ALL HOOKS AT TOP LEVEL
  const { schema, loading, error } = useWorkspaceSchema(
    attrs?.schemaPath || ""
  );
  const {
    items: records,
    loading: loadingRecords,
    deleteItem,
  } = useCollections(attrs?.collection || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(
    attrs?.sorting?.defaultField || ""
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    attrs?.sorting?.defaultDirection || "asc"
  );
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = attrs?.pagination?.pageSize || 10;

  // ✅ MEMOIZED CALCULATIONS
  const filteredRecords = useMemo(() => {
    if (!records.length) return [];

    let filtered = [...records];

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
    schema?.properties,
  ]);

  const columns = useMemo(() => {
    if (!schema?.properties) return [];

    return (
      attrs?.columns ||
      Object.entries(schema.properties).map(([key, field]: any) => ({
        key,
        label: field.label || key,
        type: field.enum ? "badge" : field.format === "date" ? "date" : "text",
      }))
    );
  }, [attrs?.columns, schema?.properties]);

  const paginatedRecords = useMemo(
    () =>
      filteredRecords.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [filteredRecords, currentPage, pageSize]
  );

  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  // ✅ EFFECTS
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection]);

  // ✅ HANDLERS
  const handleDelete = async (recordId: string) => {
    try {
      await deleteItem(recordId);
    } catch (error) {
      alert("Błąd podczas usuwania rekordu");
    }
  };

  // ✅ CONDITIONAL RENDERING AFTER ALL HOOKS
  if (loading) return <LoadingSpinner text="Loading configuration..." />;
  if (error || !schema)
    return (
      <ErrorMessage error={error || `Schema not found: ${attrs?.schemaPath}`} />
    );

  return (
    <div className="space-y-6">
      {(attrs?.title || attrs?.description) && (
        <div className="mb-6">
          {attrs?.title && (
            <h2 className="text-xl font-semibold text-zinc-900">
              {attrs.title}
            </h2>
          )}
          {attrs?.description && (
            <p className="text-zinc-600 mt-1 text-sm">{attrs.description}</p>
          )}
        </div>
      )}

      <ListHeader
        widgets={attrs?.widgets}
        search={attrs?.search}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={filteredRecords.length}
        showTotal={attrs?.pagination?.showTotal}
        slugs={[]}
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
