// src/themes/default/commons/ErrorMessage.tsx
export function ErrorMessage({ error, showBackButton = true }: { error: string; showBackButton?: boolean }) {
    return (
      <div className="py-24 text-center">
        <div className="text-red-600 text-sm font-medium mb-2">Configuration Error</div>
        <div className="text-xs text-zinc-500">{error}</div>
        {showBackButton && (
          <button onClick={() => window.history.back()} className="mt-4 text-blue-600 hover:underline">
            ← Go Back
          </button>
        )}
      </div>
    );
  }