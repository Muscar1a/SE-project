// client/src/pages/escrow/Details.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EscrowContext from '../../context/escrow/escrowContext';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';

const EscrowDetails = () => {
  const escrowContext = useContext(EscrowContext);
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { currentTransaction, vnpayStatus, getTransaction, completeEscrow, refundEscrow, error, loading } = escrowContext;
  const { user } = authContext;
  const { setAlert } = alertContext;

  const { orderId } = useParams();
  const navigate = useNavigate();

  const [refundReason, setRefundReason] = useState('');
  const [showRefundForm, setShowRefundForm] = useState(false);

  // Poll for status updates every 10 seconds if transaction is pending
  useEffect(() => {
    getTransaction(orderId);

    if (currentTransaction && currentTransaction.status === 'pending') {
      const interval = setInterval(() => {
        getTransaction(orderId);
      }, 10000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [orderId]);

  useEffect(() => {
    if (error) {
      setAlert(error, 'danger');
    }
    // eslint-disable-next-line
  }, [error]);

  if (loading || !currentTransaction) {
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

  const handleComplete = async () => {
    try {
      await completeEscrow(orderId);
      setAlert('Transaction completed successfully!', 'success');
    } catch (err) {
      setAlert('Failed to complete transaction', 'danger');
    }
  };

  const handleRefund = async (e) => {
    e.preventDefault();
    try {
      await refundEscrow(orderId, refundReason);
      setAlert('Transaction refunded successfully!', 'success');
      setShowRefundForm(false);
    } catch (err) {
      setAlert('Failed to refund transaction', 'danger');
    }
  };

  const showRefundFormComp = () => {
    return (
      <form onSubmit={handleRefund} className="refund-form">
        <div className="form-group">
          <label htmlFor="refundReason">Reason for refund</label>
          <textarea
            name="refundReason"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            required
            placeholder="Please provide a reason for the refund"
            rows="3"
          />
        </div>
        <div>
          <button type="submit" className="btn btn-danger">
            Confirm Refund
          </button>
          <button
            type="button"
            className="btn btn-secondary ml-2"
            onClick={() => setShowRefundForm(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h2>Escrow Transaction Details</h2>
        <span className={`badge ${getStatusBadgeClass(currentTransaction.status)}`}>
          {currentTransaction.status.toUpperCase()}
        </span>
      </div>
      <div className="card-body">
        <div className="detail-row">
          <strong>Order ID:</strong> {currentTransaction.orderId}
        </div>
        <div className="detail-row">
          <strong>Amount:</strong> {currentTransaction.amount.toLocaleString()} VND
        </div>
        <div className="detail-row">
          <strong>Buyer ID:</strong> {currentTransaction.buyerId}
        </div>
        <div className="detail-row">
          <strong>Seller ID:</strong> {currentTransaction.sellerId}
        </div>
        {currentTransaction.description && (
          <div className="detail-row">
            <strong>Description:</strong> {currentTransaction.description}
          </div>
        )}
        <div className="detail-row">
          <strong>Created At:</strong> {new Date(currentTransaction.createdAt).toLocaleString()}
        </div>
        {currentTransaction.paidAt && (
          <div className="detail-row">
            <strong>Paid At:</strong> {new Date(currentTransaction.paidAt).toLocaleString()}
          </div>
        )}
        {currentTransaction.completedAt && (
          <div className="detail-row">
            <strong>Completed At:</strong> {new Date(currentTransaction.completedAt).toLocaleString()}
          </div>
        )}
        {currentTransaction.refundedAt && (
          <div className="detail-row">
            <strong>Refunded At:</strong> {new Date(currentTransaction.refundedAt).toLocaleString()}
          </div>
        )}

        {/* Actions based on transaction status */}
        {currentTransaction.status === 'paid' && (
          <div className="transaction-actions">
            <button onClick={handleComplete} className="btn btn-success mr-2">
              Complete Transaction
            </button>
            {!showRefundForm ? (
              <button
                onClick={() => setShowRefundForm(true)}
                className="btn btn-danger"
              >
                Refund Transaction
              </button>
            ) : (
              showRefundFormComp()
            )}
          </div>
        )}

        {/* Back to transactions */}
        <button
          onClick={() => navigate('/escrow')}
          className="btn btn-secondary mt-3"
        >
          Back to Transactions
        </button>
      </div>
    </div>
  );
};

export default EscrowDetails;
