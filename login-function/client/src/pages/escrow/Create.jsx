// client/src/pages/escrow/Create.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EscrowContext from '../../context/escrow/escrowContext';
import AlertContext from '../../context/alert/alertContext';
import AuthContext from '../../context/auth/authContext';

const EscrowCreate = () => {
  const escrowContext = useContext(EscrowContext);
  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);

  const { createEscrow, paymentUrl, error, clearEscrow } = escrowContext;
  const { setAlert } = alertContext;
  const { user } = authContext;

  const navigate = useNavigate();

  const [transaction, setTransaction] = useState({
    sellerId: '',
    amount: '',
    description: ''
  });

  const { sellerId, amount, description } = transaction;

  useEffect(() => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }

    if (error) {
      setAlert(error, 'danger');
    }

    return () => {
      clearEscrow();
    };
    // eslint-disable-next-line
  }, [paymentUrl, error]);

  const onChange = e => {
    setTransaction({ ...transaction, [e.target.name]: e.target.value });
  };

  const onSubmit = e => {
    e.preventDefault();

    if (!sellerId || !amount) {
      setAlert('Please fill all required fields', 'danger');
      return;
    }

    // Create transaction with current user as buyer
    createEscrow({
      buyerId: user._id,
      sellerId,
      amount: parseFloat(amount),
      description
    });
  };

  return (
    <div className="form-container">
      <h1 className="text-center">Create Escrow Transaction</h1>
      <p className="text-center">
        Funds will be held securely until you confirm receipt of goods or services
      </p>
      <form onSubmit={onSubmit} className="form">
        <div className="form-group">
          <label htmlFor="sellerId">Seller ID</label>
          <input
            type="text"
            name="sellerId"
            value={sellerId}
            onChange={onChange}
            placeholder="Enter seller ID"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount (VND)</label>
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={onChange}
            placeholder="Enter amount"
            required
            min="1000"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            value={description}
            onChange={onChange}
            placeholder="Enter transaction description"
            rows="3"
          />
        </div>
        <input
          type="submit"
          value="Create Transaction"
          className="btn btn-primary btn-block"
        />
      </form>
    </div>
  );
};

export default EscrowCreate;
