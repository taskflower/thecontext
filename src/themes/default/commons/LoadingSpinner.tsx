// src/themes/default/commons/LoadingSpinner.tsx
export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        <span className="ml-3 text-sm font-medium text-zinc-600">{text}</span>
      </div>
    );
  }