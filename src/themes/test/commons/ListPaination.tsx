// src/themes/test/components/Pagination.tsx

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    showTotal?: boolean;
  }
  
  export default function Pagination({
    currentPage,
    totalPages,
    totalRecords,
    pageSize,
    onPageChange,
    showTotal = true,
  }: PaginationProps) {
    if (totalPages <= 1) return null;
  
    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);
  
    return (
      <div className="flex justify-between items-center">
        <div className="text-sm text-zinc-600">
          {showTotal && (
            <>
              Strona {currentPage} z {totalPages} ({totalRecords} rekordów)
              <span className="ml-2 text-zinc-400">
                • Wyświetlono {startRecord}-{endRecord}
              </span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-zinc-300/80 rounded hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Poprzednia
          </button>
          
          {/* Page numbers for better UX */}
          {totalPages <= 7 ? (
            // Show all pages if total is 7 or less
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 text-sm border rounded transition-colors ${
                  currentPage === page
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "border-zinc-300/80 hover:bg-zinc-50"
                }`}
              >
                {page}
              </button>
            ))
          ) : (
            // Show abbreviated pagination for more than 7 pages
            <>
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className="px-3 py-1 text-sm border border-zinc-300/80 rounded hover:bg-zinc-50"
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="px-2 py-1 text-sm text-zinc-400">...</span>
                  )}
                </>
              )}
              
              {Array.from({ length: 3 }, (_, i) => {
                const page = currentPage - 1 + i;
                if (page < 1 || page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${
                      currentPage === page
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "border-zinc-300/80 hover:bg-zinc-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-2 py-1 text-sm text-zinc-400">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className="px-3 py-1 text-sm border border-zinc-300/80 rounded hover:bg-zinc-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </>
          )}
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-zinc-300/80 rounded hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Następna
          </button>
        </div>
      </div>
    );
  }