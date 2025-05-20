// client/src/context/escrow/EscrowState.js
import React, { useReducer } from 'react';
import axios from 'axios';
import EscrowContext from './escrowContext';
import escrowReducer from './escrowReducer';
import { API_URL } from '../../config';
import {
  CREATE_ESCROW_SUCCESS,
  CREATE_ESCROW_FAIL,
  GET_TRANSACTION,
  COMPLETE_ESCROW,
  REFUND_ESCROW,
  ESCROW_ERROR,
  CLEAR_ESCROW
} from '../types';

const EscrowState = (props) => {
  const initialState = {
    currentTransaction: null,
    paymentUrl: null,
    vnpayStatus: null,
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(escrowReducer, initialState);

  // Create escrow transaction
  const createEscrow = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post(`${API_URL}/api/escrow/create`, formData, config);

      dispatch({
        type: CREATE_ESCROW_SUCCESS,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: CREATE_ESCROW_FAIL,
        payload: err.response.data.error || 'Failed to create escrow transaction'
      });
      throw err;
    }
  };

  // Get transaction details
  const getTransaction = async (orderId) => {
    try {
      const res = await axios.get(`${API_URL}/api/escrow/${orderId}`);

      dispatch({
        type: GET_TRANSACTION,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: ESCROW_ERROR,
        payload: err.response.data.error || 'Failed to get transaction'
      });
      throw err;
    }
  };

  // Complete escrow transaction
  const completeEscrow = async (orderId) => {
    try {
      const res = await axios.post(`${API_URL}/api/escrow/${orderId}/complete`);

      dispatch({
        type: COMPLETE_ESCROW,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: ESCROW_ERROR,
        payload: err.response.data.error || 'Failed to complete transaction'
      });
      throw err;
    }
  };

  // Refund escrow transaction
  const refundEscrow = async (orderId, reason) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post(`${API_URL}/api/escrow/${orderId}/refund`, { reason }, config);

      dispatch({
        type: REFUND_ESCROW,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: ESCROW_ERROR,
        payload: err.response.data.error || 'Failed to refund transaction'
      });
      throw err;
    }
  };

  // Clear current escrow data
  const clearEscrow = () => {
    dispatch({ type: CLEAR_ESCROW });
  };

  return (
    <EscrowContext.Provider
      value={{
        currentTransaction: state.currentTransaction,
        paymentUrl: state.paymentUrl,
        vnpayStatus: state.vnpayStatus,
        loading: state.loading,
        error: state.error,
        createEscrow,
        getTransaction,
        completeEscrow,
        refundEscrow,
        clearEscrow
      }}
    >
      {props.children}
    </EscrowContext.Provider>
  );
};

export default EscrowState;
