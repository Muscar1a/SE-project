import React from 'react';
import TransactionTableHeader from './TransactionTableHeader';
import TransactionRow from './TransactionRow';

const TransactionTable = ({ 
    transactions, 
    allSelected, 
    onSelectAll, 
    onSelectTransaction 
}) => {
  return (
    <div className="transactions-table-container">
        <table className="transactions-table">
        <TransactionTableHeader 
            allSelected={allSelected} 
            onSelectAll={onSelectAll} 
        />
        <tbody>
            {transactions.map(t => (
            <TransactionRow 
                key={t.id} 
                transaction={t} 
                onSelectTransaction={onSelectTransaction} 
            />
            ))}
            {transactions.length === 0 && (
                <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No transactions found.</td>
                </tr>
            )}
        </tbody>
        </table>
    </div>
  );
};

export default TransactionTable;