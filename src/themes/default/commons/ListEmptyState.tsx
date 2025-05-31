// src/themes/default/commons/ListEmptyState.tsx
import { useAppNavigation } from "@/core/hooks/useAppNavigation";

interface ListEmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  actionButton?: {
    title: string;
    navURL: string;
    variant?: "primary" | "secondary" | "outline";
  };
  className?: string;
}

export default function ListEmptyState({
  icon = "📄",
  title = "No Data",
  description = "No records found.",
  actionButton,
  className = "",
}: ListEmptyStateProps) {
  const { go } = useAppNavigation();

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-600 mb-4">{description}</p>
      {actionButton && (
        <button
          onClick={() => go(actionButton.navURL)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            actionButton.variant === "primary" || !actionButton.variant
              ? "bg-zinc-900 text-white hover:bg-zinc-800"
              : actionButton.variant === "secondary"
              ? "bg-zinc-600 text-white hover:bg-zinc-700"
              : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          {actionButton.title}
        </button>
      )}
    </div>
  );
}
