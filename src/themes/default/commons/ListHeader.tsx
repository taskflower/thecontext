// src/themes/default/commons/ListHeader.tsx
import { useParams } from "react-router-dom";
import { useAppNavigation } from "@/core/hooks/useAppNavigation";

interface Widget {
  tplFile: string;
  title: string;
  attrs: { navPath: string; variant?: "primary" | "secondary" };
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
  onSearchChange: (v: string) => void;
  totalCount?: number;
  showTotal?: boolean;
  slugs: string[];
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
  slugs,
}: ListHeaderProps) {
  const { go } = useAppNavigation(slugs);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {title}
          </h1>
          {description && <p className="text-zinc-600 mt-1 text-sm">{description}</p>}
        </div>
        <div className="flex gap-2">
          {widgets?.map((w, i) => (
            <button
              key={i}
              onClick={() => go(`/:config/:workspace/:scenario/${w.attrs.navPath}`)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                w.attrs.variant === "primary"
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {w.title}
            </button>
          ))}
        </div>
      </div>
      {search?.enabled && (
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder={search.placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-zinc-900/20 max-w-sm"
          />
          {showTotal && totalCount !== undefined && (
            <div className="text-sm text-zinc-600">
              Znaleziono: {totalCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
