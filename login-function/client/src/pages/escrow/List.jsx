// client/src/pages/escrow/List.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import axios from 'axios';
import { API_URL } from '../../config';

const EscrowList = () => {
  const authContext = useContext(AuthContext);
  const { user } = authContext;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // In a real app, you would have an API endpoint to fetch user's transactions
        // For now, we'll use a dummy implementation
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/escrow/user-transactions`);
        setTransactions(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>;
  }

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending': return 'badge-warning';
      case 'paid': return 'badge-info';
      case 'completed': return 'badge-success';
      case 'refunded': return 'badge-secondary';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-light';
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2>Escrow Transactions</h2>
        <div className="mb-2 d-flex justify-content-between align-items-center">
          <Link to="/escrow/create" className="btn btn-primary">+ New Escrow Transaction</Link>
          <Link to="/escrow/disputes" className="btn btn-outline-primary">Dispute Center</Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map(transaction => (
                <tr key={transaction.orderId}>
                  <td>{transaction.orderId}</td>
                  <td>{transaction.amount.toLocaleString()} VND</td>
                  <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
                      {transaction.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <Link to={`/escrow/${transaction.orderId}`} className="btn btn-secondary btn-sm">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EscrowList;
