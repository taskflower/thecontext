// src/themes/default/commons/StepWrapper.tsx
import { useWorkspaceSchema } from "@/core";

interface StepWrapperProps {
  schemaPath?: string;
  title?: string;
  description?: string;
  children: (schema: any) => React.ReactNode;
  className?: string;
}

export function StepWrapper({
  schemaPath,
  title,
  description,
  children,
  className = "max-w-4xl mx-auto",
}: StepWrapperProps) {
  const { schema, loading, error } = useWorkspaceSchema(schemaPath || "");

  if (loading) return <LoadingSpinner text="Loading configuration..." />;
  if (error || !schema)
    return <ErrorMessage error={error || `Schema not found: ${schemaPath}`} />;

  return (
    <div className={className}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
          )}
          {description && (
            <p className="text-zinc-600 mt-1 text-sm">{description}</p>
          )}
        </div>
      )}
      {children(schema)}
    </div>
  );
}

// src/themes/default/commons/LoadingSpinner.tsx
export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      <span className="ml-3 text-sm font-medium text-zinc-600">{text}</span>
    </div>
  );
}

// src/themes/default/commons/ErrorMessage.tsx
export function ErrorMessage({
  error,
  showBackButton = true,
}: {
  error: string;
  showBackButton?: boolean;
}) {
  return (
    <div className="py-24 text-center">
      <div className="text-red-600 text-sm font-medium mb-2">
        Configuration Error
      </div>
      <div className="text-xs text-zinc-500">{error}</div>
      {showBackButton && (
        <button
          onClick={() => window.history.back()}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Go Back
        </button>
      )}
    </div>
  );
}
