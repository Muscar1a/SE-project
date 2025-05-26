import React from 'react';
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from './icons';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  filteredItemsCount
}) => {

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) {
        pageNumbers.push('...');
      }
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) endPage = Math.min(totalPages - 1, Math.max(3, startPage)); // Ensure at least 3 pages or up to totalPages-1
      if (currentPage >= totalPages - 2) startPage = Math.max(2, totalPages - 2);

      for (let i = startPage; i <= endPage; i++) {
        if (i > 0 && i <= totalPages) pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2 && endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      if (totalPages > 1) pageNumbers.push(totalPages); // Ensure totalPages is added if more than 1 page
    }
    // Remove duplicates that might arise from logic, e.g., [1, '...', 2, 3, 4, '...', 5] -> [1, '...', 2, 3, 4, 5] if current page is 3 and totalPages is 5
    return [...new Set(pageNumbers)];
  };

  const firstItem = Math.min((currentPage - 1) * itemsPerPage + 1, filteredItemsCount);
  const lastItem = Math.min(currentPage * itemsPerPage, filteredItemsCount);

  /*
  return (
    <div className="pagination-controls">
      <div className="pagination-info">
        {filteredItemsCount > 0 ? 
            `Show data ${firstItem} - ${lastItem} of ${filteredItemsCount}` : 
            "No data to show"
        }
      </div>
      {totalPages > 0 && (
        <div className="pagination-buttons">
            <button onClick={() => onPageChange(1)} disabled={currentPage === 1}><IconChevronsLeft /></button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><IconChevronLeft /></button>
            {getPageNumbers().map((page, index) => 
            typeof page === 'number' ? (
                <button 
                key={index} 
                onClick={() => onPageChange(page)} 
                className={currentPage === page ? 'active' : ''}
                >
                {page}
                </button>
            ) : (
                <button key={index} className="ellipsis" disabled>...</button>
            )
            )}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}><IconChevronRight /></button>
            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}><IconChevronsRight /></button>
        </div>
      )}
    </div>
  );
  */
  return (
    <div className="pagination-container">
      <div className="pagination-info">
        {filteredItemsCount > 0 ?
          `Show data ${firstItem} - ${lastItem} of ${filteredItemsCount}` :
          "No data to show"
        }
      </div>
      {totalPages > 0 && (
        <div className="pagination-controls" style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => onPageChange(1)} disabled={currentPage === 1}><IconChevronsLeft /></button>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><IconChevronLeft /></button>
          {getPageNumbers().map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={currentPage === page ? 'active' : ''}
              >
                {page}
              </button>
            ) : (
              <button key={index} className="ellipsis" disabled>...</button>
            )
          )}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}><IconChevronRight /></button>
          <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}><IconChevronsRight /></button>
        </div>
      )}
    </div>
  );
};

export default Pagination;