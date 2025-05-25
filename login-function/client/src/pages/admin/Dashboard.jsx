import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
      console.log(`${API_URL}/api/admin/partners`)
      const res = await axios.get(`${API_URL}/api/admin/partners`);
      console.log("Partners data:", res.data);

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
      <div className="card">
        <div className="card-header">
          <h2>Admin Dashboard</h2>
        </div>

        <div className="card-body">
          <h2 className="transaction-stats">Transaction Statistics</h2>
          <div className="transaction-stats-details">
            <StatCard title="Total Transactions" value={stats.transactions.total} />
            <StatCard title="Pending" value={stats.transactions.pending} color="bg-yellow-500" />
            <StatCard title="Paid" value={stats.transactions.paid} color="bg-blue-500" />
            <StatCard title="Completed" value={stats.transactions.completed} color="bg-green-500" />
            <StatCard title="Refunded" value={stats.transactions.refunded} color="bg-red-500" />
            <StatCard title="Cancelled" value={stats.transactions.cancelled} color="bg-gray-500" />
          </div>
        </div>
        {/* Transaction Stats */}

        {/* Volume Stats */}
        <div className="card-body">
          <h2 className="financial">Financial Overview</h2>
          <StatCard title="Total Processed Volume" value={`$${stats.volume.totalProcessedAmount.toLocaleString()}`} />
        </div>

        {/* User Stats */}
        <div className="card-body">
          <h2 className="user-stats">User Statistics</h2>
          <div className="user-stats-details">
            <StatCard title="Total Users" value={stats.users.total} />
            <StatCard title="New Users (Last 24h)" value={stats.users.newInLast24h} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color = 'bg-indigo-500' }) => (
  <div className={`${color} text-white p-6 rounded-lg shadow`}>
    <h3 className="text-lg font-medium">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);


export default DashboardPage;