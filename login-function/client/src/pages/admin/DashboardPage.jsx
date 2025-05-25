import React, { useState, useMemo, useEffect } from 'react';
import TransactionTable from '../../components/dashboard/TransactionTable';
import TransactionControls from '../../components/dashboard/TransactionControls';
import Pagination from '../../components/dashboard/Pagination';

import axios from 'axios';
import { API_URL } from '../../config';


const StatCard = ({ title, value, color = 'bg-indigo-500' }) => (
  <div className={`${color} text-white p-6 rounded-lg shadow`}>
    <h3 className="text-lg font-medium">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const DashboardPage = () => {
  // const [allTransactions, setAllTransactions] = useState(allMockTransactions);
  const [allTransactions, setAllTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOrder, setSortOrder] = useState('Latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Mặc định là 10 như trong hình
  const [allSelectedInPage, setAllSelectedInPage] = useState(false);



  // ======================================== //
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("===============================================================");

    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      // move to login page
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/admin/dashboard`);
      const result = response.data;

      if (!result.success) { // Giả sử API của bạn luôn trả về { success: boolean, ... }
        throw new Error(result.msg || 'Failed to fetch dashboard stats');
      }
      if (result.data) {
        setStats(result.data);
      }

    } catch (err) {
      setError(err.message || "Unknown error occurred while fetching dashboard stats.");
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================== //

  const filteredTransactions = useMemo(() => {
    let sortedTransactions = [...allTransactions];

    if (sortOrder === 'Oldest') {
      sortedTransactions.sort((a, b) => new Date(a.date.split(' - ')[0]) - new Date(b.date.split(' - ')[0]));
    } else if (sortOrder === 'Latest') {
      sortedTransactions.sort((a, b) => new Date(b.date.split(' - ')[0]) - new Date(a.date.split(' - ')[0]));
    } else if (sortOrder === 'Amount (High-Low)') {
      sortedTransactions.sort((a, b) => b.amount - a.amount);
    } else if (sortOrder === 'Amount (Low-High)') {
      sortedTransactions.sort((a, b) => a.amount - b.amount);
    }

    return sortedTransactions
      .filter(t => t.paymentName.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(t => statusFilter === 'All Status' || t.status === statusFilter);
  }, [allTransactions, searchTerm, statusFilter, sortOrder]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectTransaction = (id) => {
    const newTransactions = allTransactions.map(t =>
      t.id === id ? { ...t, selected: !t.selected } : t
    );
    setAllTransactions(newTransactions);
  };

  const handleSelectAllInPage = () => {
    const newSelectState = !allSelectedInPage;
    const pageTransactionIds = paginatedTransactions.map(t => t.id);

    const newTransactions = allTransactions.map(t =>
      pageTransactionIds.includes(t.id) ? { ...t, selected: newSelectState } : t
    );
    setAllTransactions(newTransactions);
    setAllSelectedInPage(newSelectState);
  };

  // Update allSelectedInPage status when paginatedTransactions or their selection changes
  useEffect(() => {
    if (paginatedTransactions.length > 0) {
      setAllSelectedInPage(paginatedTransactions.every(t => t.selected));
    } else {
      setAllSelectedInPage(false);
    }
  }, [paginatedTransactions]);

  // Reset current page if filters change and current page becomes invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    } else if (totalPages === 0) {
      setCurrentPage(1); // Or 0 if you prefer, but 1 makes sense for display
    }
  }, [totalPages, currentPage]);


  
  if (loading) {
    return <div className="p-4">Loading dashboard statistics...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!stats) {
    return <div className="p-4">No statistics data available.</div>;
  }

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h1 className="main-title">Transactions</h1>

        <div className="summary-cards-grid">
          <StatCard title="Total Transactions" value={stats.transactions.total} />
          <StatCard title="Pending" value={stats.transactions.pending} color="bg-yellow-500" />
          <StatCard title="Paid" value={stats.transactions.paid} color="bg-blue-500" />
          <StatCard title="Completed" value={stats.transactions.completed} color="bg-green-500" />
          <StatCard title="Refunded" value={stats.transactions.refunded} color="bg-red-500" />
          <StatCard title="Cancelled" value={stats.transactions.cancelled} color="bg-gray-500" />
        </div>

        <div className="transactions-section">
          <div className="transactions-header">
            <h2 className="transactions-title">Transactions</h2>
            <TransactionControls
              searchTerm={searchTerm}
              onSearchChange={(value) => { setSearchTerm(value); setCurrentPage(1); }}
              statusFilter={statusFilter}
              onStatusFilterChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
              sortOrder={sortOrder}
              onSortOrderChange={(value) => { setSortOrder(value); setCurrentPage(1); }}
            />
          </div>

          <TransactionTable
            transactions={paginatedTransactions}
            allSelected={allSelectedInPage}
            onSelectAll={handleSelectAllInPage}
            onSelectTransaction={handleSelectTransaction}
          />

          {filteredTransactions.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={allTransactions.length} // This could be total items before filtering
              filteredItemsCount={filteredTransactions.length} // Total items after filtering
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;