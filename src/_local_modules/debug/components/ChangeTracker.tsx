// src/debug/components/ChangeTracker.jsx


export const ChangeTracker = ({ changes }) => {
  return Object.entries(changes).map(
    ([path, { oldValue, newValue, type }]) => (
      <div
        key={path}
        className="border-t border-gray-100 pt-2 mt-2 first:border-0 first:pt-0 first:mt-0"
      >
        <div className="flex items-center">
          <span
            className={`px-1.5 py-0.5 rounded text-xs font-semibold mr-2 
            ${
              type === "added"
                ? "bg-green-100 text-green-800"
                : type === "removed"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {type === "added"
              ? "DODANO"
              : type === "removed"
              ? "USUNIĘTO"
              : "ZMIENIONO"}
          </span>
          <span className="font-mono text-sm break-all">{path}</span>
        </div>

        {type !== "added" && (
          <div className="ml-6 mt-1 p-2 bg-red-50 rounded border border-red-100 relative text-sm">
            <div className="absolute -left-4 top-2 w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-red-800 font-mono break-all overflow-auto block max-w-full text-xs">
              {typeof oldValue === "object"
                ? JSON.stringify(oldValue)
                : String(oldValue)}
            </span>
          </div>
        )}

        {type !== "removed" && (
          <div className="ml-6 mt-1 p-2 bg-green-50 rounded border border-green-100 relative text-sm">
            <div className="absolute -left-4 top-2 w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-800 font-mono break-all overflow-auto block max-w-full text-xs">
              {typeof newValue === "object"
                ? JSON.stringify(newValue)
                : String(newValue)}
            </span>
          </div>
        )}
      </div>
    )
  );
};

export default ChangeTracker;