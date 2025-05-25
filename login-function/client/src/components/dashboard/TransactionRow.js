import React from 'react';
import { IconMoreVertical } from './icons';

const TransactionRow = ({ transaction, onSelectTransaction }) => {
  const getPaymentIconClass = (paymentName) => {
    const name = paymentName.toLowerCase();
    if (name.includes('bank')) return 'icon-bank';
    if (name.includes('youtube')) return 'icon-youtube';
    if (name.includes('internet')) return 'icon-internet';
    if (name.includes('starbucks')) return 'icon-starbucks';
    if (name.includes('salary') || name.includes('freelance')) return 'icon-freelance';
    if (name.includes('crypto')) return 'icon-crypto';
    if (name.includes('amazon')) return 'icon-amazon';
    if (name.includes('spotify')) return 'icon-spotify';
    return ''; // Default or no specific icon class
  };


  return (
    <tr key={transaction.id}>
      <td>
        <input 
          type="checkbox" 
          checked={transaction.selected} 
          onChange={() => onSelectTransaction(transaction.id)} 
        />
      </td>
      <td>{transaction.id}</td>
      <td>
        <div className="payment-name-cell">
          <span className={`payment-icon ${getPaymentIconClass(transaction.paymentName)}`}>
            {transaction.icon}
          </span>
          {transaction.paymentName}
        </div>
      </td>
      <td className={transaction.amount >= 0 ? 'amount-positive' : 'amount-negative'}>
        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
      </td>
      <td>{transaction.date}</td>
      <td>
        <span className={`status-pill status-${transaction.status.toLowerCase()}`}>
          {transaction.status}
        </span>
      </td>
      <td className="actions-cell">
        <button><IconMoreVertical /></button>
      </td>
    </tr>
  );
};

export default TransactionRow;