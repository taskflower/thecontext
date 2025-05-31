export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="relative inline-flex">
          {/* Outer spinning ring */}
          <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
          {/* Inner spinning element */}
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600">{text}</p>
      </div>
    </div>
  );
}