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
        <div className="card-header">
          <h2>My Escrow Transactions</h2>
          <Link to="/escrow/create" className="btn btn-primary">
            New Transaction
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="card-body text-center">
            <p>No transactions found.</p>
            <p>Create a new escrow transaction to securely pay for goods and services.</p>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(transaction => (
              <div key={transaction.orderId} className="transaction-item">
                <div className="transaction-header">
                  <h3>Order #{transaction.orderId}</h3>
                  <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
                <div className="transaction-body">
                  <p><strong>Amount:</strong> {transaction.amount.toLocaleString()} VND</p>
                  <p><strong>Date:</strong> {new Date(transaction.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="transaction-actions">
                  <Link to={`/escrow/${transaction.orderId}`} className="btn btn-secondary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowList;
