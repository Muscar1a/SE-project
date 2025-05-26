import React from 'react';
import { IconSearch, IconDownload, IconFilter } from './icons';
import '../../pages/admin/DashboardPage.css'; // Assuming you have a CSS file for styles

const TransactionControls = ({ 
    searchTerm, 
    onSearchChange, 
    statusFilter, 
    onStatusFilterChange, 
    sortOrder, 
    onSortOrderChange 
}) => {
  return (
    <div className="transactions-controls">
      <div className="search-bar">
        <IconSearch />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select
        className="filter-dropdown"
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
      >
        <option value="All Status">All Status</option>
        <option value="Completed">Completed</option>
        <option value="Paid">Paid</option>
        <option value="Failed">Failed</option>
        <option value="Pending">Pending</option>
        <option value="Refunded">Refunded</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      <select
        className="filter-dropdown"
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value)}
      >
        <option value="Latest">Latest</option>
        <option value="Oldest">Oldest</option>
        <option value="Amount (High-Low)">Amount (High-Low)</option>
        <option value="Amount (Low-High)">Amount (Low-High)</option>
      </select>
      {/* <button className="action-button primary icon-only"><IconDownload /></button>
      <button className="action-button icon-only"><IconFilter /></button> */}
    </div>
  );
};

export default TransactionControls;