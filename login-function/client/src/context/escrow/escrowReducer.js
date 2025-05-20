// client/src/context/escrow/escrowReducer.js
import {
  CREATE_ESCROW_SUCCESS,
  CREATE_ESCROW_FAIL,
  GET_TRANSACTION,
  COMPLETE_ESCROW,
  REFUND_ESCROW,
  ESCROW_ERROR,
  CLEAR_ESCROW
} from '../types';

const escrowReducer = (state, action) => {
  switch (action.type) {
    case CREATE_ESCROW_SUCCESS:
      return {
        ...state,
        currentTransaction: action.payload,
        paymentUrl: action.payload.paymentUrl,
        loading: false
      };
    case GET_TRANSACTION:
      return {
        ...state,
        currentTransaction: action.payload.transaction,
        vnpayStatus: action.payload.vnpayStatus,
        loading: false
      };
    case COMPLETE_ESCROW:
    case REFUND_ESCROW:
      return {
        ...state,
        currentTransaction: action.payload.transaction,
        loading: false
      };
    case CREATE_ESCROW_FAIL:
    case ESCROW_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case CLEAR_ESCROW:
      return {
        ...state,
        currentTransaction: null,
        paymentUrl: null,
        vnpayStatus: null,
        error: null
      };
    default:
      return state;
  }
};

export default escrowReducer;
