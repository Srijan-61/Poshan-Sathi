

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export default function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Dynamic Window logic
  const getPageNumbers = (current: number, total: number) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, '...', total];
    if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  return (
    <div className="flex items-center justify-between p-6 border-t border-neutral-100 bg-white/50 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
      <div>
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      <div className="flex items-center gap-2 font-medium">
        <button 
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 disabled:opacity-50"
        >&lt;</button>
        
        {getPageNumbers(currentPage, totalPages).map((page, index) => {
          if (page === '...') {
            return <span key={`ellipsis-${index}`} className="px-1 text-neutral-400">...</span>;
          }
          return (
            <button
              key={`page-${page}`}
              onClick={() => setCurrentPage(Number(page))}
              className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${currentPage === page ? 'border-[#00a86b] bg-[#00a86b] text-white shadow-sm' : 'border-transparent hover:bg-neutral-100 text-neutral-600'}`}
            >
              {page}
            </button>
          );
        })}

        <button 
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 disabled:opacity-50"
        >&gt;</button>
      </div>
    </div>
  );
}
