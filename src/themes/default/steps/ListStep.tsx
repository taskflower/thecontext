// src/themes/default/steps/ListStep.tsx (refactored)
import { useState, useEffect } from "react";
import { configDB } from "../../../db";
import { useWorkspaceSchema } from "@/core/engine";
import ListHeader from "../commons/ListHeader";
import DataTable, { Column } from "../commons/ListDataTable";
import Pagination from "../commons/ListPaination";


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
    try {
      await configDB.records.delete(`${attrs.collection}:${recordId}`);
      await loadRecords();
    } catch (error) {
      console.error("Failed to delete record:", error);
      alert("Błąd podczas usuwania rekordu");
    }
  };

  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
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
      <ListHeader
        title={attrs.title}
        description={attrs.description}
        widgets={attrs.widgets}
        search={attrs.search}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={filteredRecords.length}
        showTotal={attrs.pagination?.showTotal}
      />

      <DataTable
        records={paginatedRecords}
        columns={columns as Column[]}
        actions={attrs.actions}
        schema={schema}
        loading={loadingRecords}
        emptyState={attrs.emptyState}
        sortField={sortField}
        sortDirection={sortDirection}
        sortingEnabled={attrs.sorting?.enabled}
        onSort={handleSort}
        onDelete={handleDelete}
        collection={attrs.collection}
      />

      {attrs.pagination && (
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