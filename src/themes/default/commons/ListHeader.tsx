// src/themes/default/components/ListHeader.tsx
import { useNavigate, useParams } from "react-router-dom";

interface Widget {
  tplFile: string;
  title: string;
  attrs: {
    navPath: string;
    variant?: "primary" | "secondary";
  };
}

interface SearchConfig {
  enabled?: boolean;
  placeholder?: string;
  fields?: string[];
}

interface ListHeaderProps {
  title?: string;
  description?: string;
  widgets?: Widget[];
  search?: SearchConfig;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount?: number;
  showTotal?: boolean;
}

export default function ListHeader({
  title,
  description,
  widgets,
  search,
  searchTerm,
  onSearchChange,
  totalCount,
  showTotal,
}: ListHeaderProps) {
  const navigate = useNavigate();
  const params = useParams<{ config: string; workspace: string }>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {title || "Lista rekordów"}
          </h1>
          {description && (
            <p className="text-zinc-600 mt-1 text-sm">{description}</p>
          )}
        </div>

        <div className="flex gap-2">
          {widgets?.map((widget: Widget, i: number) => (
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
      {search?.enabled && (
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder={search.placeholder || "Szukaj..."}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-4 py-2 border border-zinc-300/80 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 max-w-sm"
          />
          {showTotal && totalCount !== undefined && (
            <div className="text-sm text-zinc-600">
              Znaleziono: {totalCount} rekordów
            </div>
          )}
        </div>
      )}
    </div>
  );
}