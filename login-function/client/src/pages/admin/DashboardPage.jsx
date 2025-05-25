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
  // const [allTransactions, setAllTransactions] = useState([]);
  const [transactionsForCurrentPage, setTransactionsForCurrentPage] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('createdAt');  // Mặc định API là 'createdAt'

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default is 10

  const [totalPages, setTotalPages] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [allSelectedInPage, setAllSelectedInPage] = useState(false);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [errorTransactions, setErrorTransactions] = useState(null);

  /// ===== Fetching dashboard statistics =====



  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setErrorStats(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorStats("No authentication token found.");
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
      setErrorStats(err.message || "Unknown error occurred while fetching dashboard stats.");
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Get All Transactions =====

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, itemsPerPage, sortBy, sortOrder, statusFilter, searchTerm]);

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    setErrorTransactions(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorTransactions("No authentication token found.");
      setLoadingTransactions(false);
      return;
    }

    const params = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortBy,
      sortOrder: sortOrder,
      // Chỉ gửi status nếu nó không phải là 'All Status'
      ...(statusFilter !== 'All Status' && { status: statusFilter.toLowerCase() }),
      // Gửi searchTerm (có thể là orderId hoặc tìm kiếm chung - API của bạn đang tìm orderId)
      ...(searchTerm && { orderId: searchTerm }),
      // Bạn có thể thêm các filter khác ở đây nếu TransactionControls hỗ trợ chúng
      // minAmount, maxAmount, startDate, endDate, buyerId, sellerId
    };

    try {
      const response = await axios.get(`${API_URL}/api/escrow`, {
        // headers: { Authorization: `Bearer ${token}` },
        params: params // Gửi các tham số query
      });
      const result = response.data;

      if (!result.success || !result.data) {
        throw new Error(result.msg || 'Failed to fetch transactions or no data returned');
      }

      const { transactions, currentPage: apiCurrentPage, totalPages: apiTotalPages, totalTransactions: apiTotalTransactions } = result.data;

      const processedTransactions = transactions.map(tx => ({
        // Dựa trên ví dụ response đơn lẻ của bạn:
        // transaction object nằm trong result.data.transaction
        // Nhưng getAllTransactions trả về một mảng transactions trong result.data.transactions
        _id: tx._id,
        id: tx.orderId, // Sử dụng orderId làm ID chính hiển thị
        paymentName: tx.description || `Order ${tx.orderId}`, // 'Payment Name' có thể là description
        // Bỏ icon
        amount: parseFloat(tx.amount) || 0, // Giữ nguyên giá trị số
        // Thêm một trường mới để hiển thị amount đã định dạng
        displayAmount: `${(parseFloat(tx.amount) || 0).toLocaleString('vi-VN')} VND`,
        status: tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Unknown',
        date: tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: 'numeric', minute: '2-digit', hour12: true
        }) : 'N/A',
        // paidAt: tx.paidAt ? new Date(tx.paidAt).toLocaleString(...) : null, // Thêm nếu cần hiển thị
        vnpayTransactionNo: tx.vnpayTransactionNo, // Thêm nếu cần hiển thị
        buyerId: tx.buyerId, // Thêm nếu cần
        sellerId: tx.sellerId, // Thêm nếu cần
        selected: false,
        originalData: tx, // Giữ lại dữ liệu gốc
      }));

      setTransactionsForCurrentPage(processedTransactions);
      setTotalPages(apiTotalPages);
      setTotalTransactions(apiTotalTransactions);
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.message || "Unknown error fetching transactions.";
      setErrorTransactions(errorMessage);
      console.error("Error fetching transactions:", err);
      setTransactionsForCurrentPage([]); // Xóa dữ liệu cũ nếu có lỗi
      setTotalPages(0);
      setTotalTransactions(0);
    } finally {
      setLoadingTransactions(false);
    }
  };


  // ======================================= //


  // const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler for changing sort (TransactionControls sẽ gọi)
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset về trang 1 khi đổi sort
  };

  // Handler for status filter (TransactionControls sẽ gọi)
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset về trang 1 khi đổi filter
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };


  const handleSelectTransaction = (id) => {
    const newTransactions = transactionsForCurrentPage.map(t =>
      t.id === id ? { ...t, selected: !t.selected } : t
    );
    setTransactionsForCurrentPage(newTransactions);
  };

  const handleSelectAllInPage = () => {
    const newSelectState = !allSelectedInPage;
    const newTransactions = transactionsForCurrentPage.map(t => ({ ...t, selected: newSelectState }));
    setTransactionsForCurrentPage(newTransactions);
    setAllSelectedInPage(newSelectState);
  };

  useEffect(() => {
    if (transactionsForCurrentPage.length > 0) {
      setAllSelectedInPage(transactionsForCurrentPage.every(t => t.selected));
    } else {
      setAllSelectedInPage(false);
    }
  }, [transactionsForCurrentPage]);


  if (loading || loadingTransactions) {
    let loadingMessage = "";
    if (loading && loadingTransactions) loadingMessage = "Loading dashboard data...";
    else if (loading) loadingMessage = "Loading dashboard statistics...";
    else if (loadingTransactions) loadingMessage = "Loading transactions...";
    return <div className="p-6 text-center text-gray-600">{loadingMessage}</div>;
  }

  if (errorTransactions) {
    return <div className="p-6 text-center text-red-500">Error loading transactions: {errorTransactions}</div>;
  }

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h1 className="main-title">Transactions</h1>

        {stats && !errorStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <StatCard title="Total Escrows" value={stats.transactions?.total || 0} />
            <StatCard title="Pending" value={stats.transactions?.pending || 0} color="bg-yellow-500" />
            <StatCard title="Paid" value={stats.transactions?.paid || 0} color="bg-blue-500" />
            <StatCard title="Completed" value={stats.transactions?.completed || 0} color="bg-green-500" />
            <StatCard title="Refunded" value={stats.transactions?.refunded || 0} color="bg-red-500" />
            <StatCard title="Cancelled" value={stats.transactions?.cancelled || 0} color="bg-gray-500" />
          </div>
        )}
        {errorStats && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            Could not load dashboard statistics: {errorStats}
          </div>
        )}

        <div className="transactions-section">
          <div className="transactions-header">
            <h2 className="transactions-title">Transactions</h2>
            <TransactionControls
              searchTerm={searchTerm}
              // onSearchChange={(value) => { setSearchTerm(value); setCurrentPage(1); }}
              onSearchChange={handleSearchChange} // Sử dụng handler mới
              statusFilter={statusFilter}
              // onStatusFilterChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
              onStatusFilterChange={handleStatusFilterChange} // Sử dụng handler mới
              sortOrder={sortOrder}
              sortBy={sortBy} // Truyền sortBy xuống
              // onSortOrderChange={(value) => { setSortOrder(value); setCurrentPage(1); }}
              // Cần cập nhật TransactionControls để nhận sortBy và có thể cả onSortByChange
              onSortChange={handleSortChange} // Một hàm chung cho cả sortBy và sortOrder
            />
          </div>

          {!errorTransactions && (
            <>
              <TransactionTable
                transactions={transactionsForCurrentPage}
                allSelected={allSelectedInPage}
                onSelectAll={handleSelectAllInPage}
                onSelectTransaction={handleSelectTransaction}
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                // Đảm bảo TransactionTable sử dụng 'displayAmount' để hiển thị số tiền
              />

              {transactionsForCurrentPage.length > 0 && totalPages > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  filteredItemsCount={totalTransactions}
                />
              )}
              {transactionsForCurrentPage.length === 0 && !loadingTransactions && (
                 <p className="text-center text-gray-500 py-4">
                    {totalTransactions > 0 ? "No transactions match your current filters." : "No transactions found."}
                 </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;